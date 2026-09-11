-- Fungsi bantu RLS. security definer + set search_path supaya bisa membaca
-- penugasan/peran_izin tanpa memicu rekursi kebijakan RLS pada tabel itu sendiri.

create function fn_is_owner()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from penugasan pen
    join peran r on r.id = pen.peran_id
    where pen.pengguna_id = auth.uid() and pen.status_aktif and r.kode = 'owner'
  );
$$;

create function fn_user_outlet_ids()
returns setof uuid
language sql
stable
security definer set search_path = public
as $$
  select outlet_id from penugasan where pengguna_id = auth.uid() and status_aktif;
$$;

create function fn_has_active_assignment()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select fn_is_owner() or exists (
    select 1 from penugasan where pengguna_id = auth.uid() and status_aktif
  );
$$;

create function fn_has_izin(p_izin_kode text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select fn_is_owner() or exists (
    select 1
    from penugasan pen
    join peran_izin pi on pi.peran_id = pen.peran_id
    join izin i on i.id = pi.izin_id
    where pen.pengguna_id = auth.uid() and pen.status_aktif and i.kode = p_izin_kode
  );
$$;

alter table entitas enable row level security;
alter table outlet enable row level security;
alter table pengguna enable row level security;
alter table peran enable row level security;
alter table izin enable row level security;
alter table peran_izin enable row level security;
alter table penugasan enable row level security;
alter table pegawai enable row level security;
alter table dokumen_pegawai enable row level security;
alter table produk enable row level security;
alter table satuan_produk enable row level security;
alter table barcode_produk enable row level security;
alter table harga_produk enable row level security;
alter table stok_parameter enable row level security;
alter table supplier enable row level security;
alter table pelanggan enable row level security;
alter table audit_log enable row level security;
alter table persetujuan enable row level security;
alter table periode enable row level security;

-- entitas: kelola entitas & outlet khusus owner (§5)
create policy entitas_select on entitas for select using (fn_is_owner());
create policy entitas_write on entitas for insert with check (fn_is_owner());
create policy entitas_update on entitas for update using (fn_is_owner()) with check (fn_is_owner());

-- outlet: owner lihat semua, lainnya outlet sendiri (§5); kelola khusus owner
create policy outlet_select on outlet for select
  using (fn_is_owner() or id in (select fn_user_outlet_ids()));
create policy outlet_write on outlet for insert with check (fn_is_owner());
create policy outlet_update on outlet for update using (fn_is_owner()) with check (fn_is_owner());

-- pengguna: profil sendiri, atau owner lihat semua (baris dibuat oleh trigger, bukan API)
create policy pengguna_select on pengguna for select
  using (id = auth.uid() or fn_is_owner());
create policy pengguna_update on pengguna for update
  using (id = auth.uid() or fn_is_owner()) with check (id = auth.uid() or fn_is_owner());

-- peran/izin: referensi dibaca semua pengguna aktif, diubah hanya owner
create policy peran_select on peran for select using (fn_has_active_assignment());
create policy peran_write on peran for insert with check (fn_is_owner());
create policy peran_update on peran for update using (fn_is_owner()) with check (fn_is_owner());

create policy izin_select on izin for select using (fn_has_active_assignment());
create policy izin_write on izin for insert with check (fn_is_owner());
create policy izin_update on izin for update using (fn_is_owner()) with check (fn_is_owner());

create policy peran_izin_select on peran_izin for select using (fn_has_active_assignment());
create policy peran_izin_write on peran_izin for insert with check (fn_is_owner());
create policy peran_izin_delete on peran_izin for delete using (fn_is_owner());

-- penugasan: kelola pengguna & peran khusus owner (§5); pengguna lihat penugasannya sendiri
create policy penugasan_select on penugasan for select
  using (fn_is_owner() or pengguna_id = auth.uid());
create policy penugasan_write on penugasan for insert with check (fn_is_owner());
create policy penugasan_update on penugasan for update using (fn_is_owner()) with check (fn_is_owner());

-- pegawai: lihat dibatasi outlet sendiri; kelola oleh owner/administrator (§5)
create policy pegawai_select on pegawai for select
  using (fn_is_owner() or outlet_utama_id in (select fn_user_outlet_ids()));
create policy pegawai_write on pegawai for insert
  with check (fn_is_owner() or fn_has_izin('pegawai.kelola'));
create policy pegawai_update on pegawai for update
  using (fn_is_owner() or fn_has_izin('pegawai.kelola'))
  with check (fn_is_owner() or fn_has_izin('pegawai.kelola'));

create policy dokumen_pegawai_select on dokumen_pegawai for select
  using (
    fn_is_owner()
    or pegawai_id in (select id from pegawai where outlet_utama_id in (select fn_user_outlet_ids()))
  );
create policy dokumen_pegawai_write on dokumen_pegawai for insert
  with check (fn_is_owner() or fn_has_izin('pegawai.kelola'));
create policy dokumen_pegawai_update on dokumen_pegawai for update
  using (fn_is_owner() or fn_has_izin('pegawai.kelola'))
  with check (fn_is_owner() or fn_has_izin('pegawai.kelola'));

-- produk: katalog dibaca semua pengguna aktif (lintas outlet); psikotropika/narkotika
-- hanya APJ/owner (aturan kontrol §6.2), peran lain butuh izin produk.ajukan (ditandai pending)
create policy produk_select on produk for select using (fn_has_active_assignment());
create policy produk_write on produk for insert
  with check (
    (fn_is_owner() or fn_has_izin('produk.tambah') or fn_has_izin('produk.ajukan'))
    and (golongan_obat not in ('psikotropika', 'narkotika') or fn_is_owner() or fn_has_izin('produk.golongan_khusus'))
  );
create policy produk_update on produk for update
  using (fn_is_owner() or fn_has_izin('produk.ubah') or fn_has_izin('produk.ajukan'))
  with check (
    (fn_is_owner() or fn_has_izin('produk.ubah') or fn_has_izin('produk.ajukan'))
    and (golongan_obat not in ('psikotropika', 'narkotika') or fn_is_owner() or fn_has_izin('produk.golongan_khusus'))
  );

create policy satuan_produk_select on satuan_produk for select using (fn_has_active_assignment());
create policy satuan_produk_write on satuan_produk for insert
  with check (fn_is_owner() or fn_has_izin('produk.tambah') or fn_has_izin('produk.ajukan'));
create policy satuan_produk_update on satuan_produk for update
  using (fn_is_owner() or fn_has_izin('produk.ubah') or fn_has_izin('produk.ajukan'))
  with check (fn_is_owner() or fn_has_izin('produk.ubah') or fn_has_izin('produk.ajukan'));

create policy barcode_produk_select on barcode_produk for select using (fn_has_active_assignment());
create policy barcode_produk_write on barcode_produk for insert
  with check (fn_is_owner() or fn_has_izin('produk.tambah') or fn_has_izin('produk.ajukan'));

-- harga_produk: append-only (tidak ada policy update -> RLS menolak UPDATE untuk semua non-owner-table)
create policy harga_produk_select on harga_produk for select
  using (fn_is_owner() or outlet_id in (select fn_user_outlet_ids()));
create policy harga_produk_write on harga_produk for insert
  with check (
    outlet_id in (select fn_user_outlet_ids())
    and (fn_is_owner() or fn_has_izin('harga.ubah') or fn_has_izin('harga.ajukan'))
  );

create policy stok_parameter_select on stok_parameter for select
  using (fn_is_owner() or outlet_id in (select fn_user_outlet_ids()));
create policy stok_parameter_write on stok_parameter for insert
  with check (outlet_id in (select fn_user_outlet_ids()) and (fn_is_owner() or fn_has_izin('produk.ubah')));
create policy stok_parameter_update on stok_parameter for update
  using (fn_is_owner() or fn_has_izin('produk.ubah'))
  with check (fn_is_owner() or fn_has_izin('produk.ubah'));

-- supplier & pelanggan: master data lintas outlet (dokumen tidak mencantumkan outlet_id)
create policy supplier_select on supplier for select using (fn_has_active_assignment());
create policy supplier_write on supplier for insert
  with check (fn_is_owner() or fn_has_izin('supplier.kelola'));
create policy supplier_update on supplier for update
  using (fn_is_owner() or fn_has_izin('supplier.kelola'))
  with check (fn_is_owner() or fn_has_izin('supplier.kelola'));

create policy pelanggan_select on pelanggan for select using (fn_has_active_assignment());
create policy pelanggan_write on pelanggan for insert with check (fn_has_active_assignment());
create policy pelanggan_update on pelanggan for update
  using (fn_has_active_assignment()) with check (fn_has_active_assignment());

-- audit_log: hanya owner (§5); baris ditulis lewat trigger security definer, bukan API langsung
create policy audit_log_select on audit_log for select using (fn_is_owner());

-- persetujuan: pengaju lihat pengajuannya, penyetuju & owner lihat semua
create policy persetujuan_select on persetujuan for select
  using (fn_is_owner() or pengaju_id = auth.uid() or fn_has_izin('persetujuan.setujui'));
create policy persetujuan_write on persetujuan for insert with check (fn_has_active_assignment());
create policy persetujuan_update on persetujuan for update
  using (fn_is_owner() or fn_has_izin('persetujuan.setujui'))
  with check (fn_is_owner() or fn_has_izin('persetujuan.setujui'));

-- periode: tutup buku khusus owner
create policy periode_select on periode for select using (fn_is_owner());
create policy periode_write on periode for insert with check (fn_is_owner());
create policy periode_update on periode for update using (fn_is_owner()) with check (fn_is_owner());
