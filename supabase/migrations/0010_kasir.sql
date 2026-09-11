-- Fase 2: Dashboard KPI & Kontrol Kasir. Lihat docs/keputusan.md untuk
-- ringkasan sumber data (file Excel KK_Madani88) dan keputusan scope.

create table shift_kasir (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  outlet_id uuid not null references outlet(id),
  shift text not null check (shift in ('pagi', 'siang', 'sore')),
  kasir_pegawai_id uuid references pegawai(id),
  kasir_nama text not null,
  jumlah_transaksi int not null default 0,
  cd numeric,                          -- kolom "CD" di sumber Excel, di luar total_nontunai/tunai; makna persisnya belum dikonfirmasi owner, disimpan apa adanya
  tunai numeric not null default 0,
  total_nontunai numeric not null default 0,
  total_penjualan numeric not null default 0,
  setoran numeric not null default 0,
  selisih numeric not null default 0,
  hpp numeric,
  catatan text,
  status_aktif boolean not null default true,
  dibuat_oleh uuid references pengguna(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tanggal, outlet_id, shift, kasir_nama)
);

create index shift_kasir_tanggal_outlet_idx on shift_kasir(tanggal, outlet_id);

create table pembayaran_shift (
  id uuid primary key default gen_random_uuid(),
  shift_kasir_id uuid not null references shift_kasir(id) on delete cascade,
  channel text not null,
  sub_channel text,
  jumlah numeric not null default 0
);

create index pembayaran_shift_shift_kasir_id_idx on pembayaran_shift(shift_kasir_id);

create table pembelian_harian (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null,
  outlet_id uuid not null references outlet(id),
  jumlah numeric not null default 0,
  dibuat_oleh uuid references pengguna(id),
  created_at timestamptz not null default now(),
  unique (tanggal, outlet_id)
);

-- Trigger updated_at + audit_log, pola sama seperti fn_touch_updated_at()/fn_audit_log() di 0007.
create trigger trg_touch_updated_at before update on shift_kasir
  for each row execute function fn_touch_updated_at();

create trigger trg_audit_log after insert or update or delete on shift_kasir
  for each row execute function fn_audit_log();
create trigger trg_audit_log after insert or update or delete on pembelian_harian
  for each row execute function fn_audit_log();
-- pembayaran_shift tidak diaudit tersendiri (sama seperti barcode_produk) - perubahannya
-- selalu mengikuti insert/update shift_kasir induknya yang sudah teraudit.

alter table shift_kasir enable row level security;
alter table pembayaran_shift enable row level security;
alter table pembelian_harian enable row level security;

create policy shift_kasir_select on shift_kasir for select
  using (fn_is_owner() or outlet_id in (select fn_user_outlet_ids()));
create policy shift_kasir_write on shift_kasir for insert
  with check (
    fn_is_owner()
    or (fn_has_izin('kasir.tutup') and outlet_id in (select fn_user_outlet_ids()))
  );
create policy shift_kasir_update on shift_kasir for update
  using (fn_is_owner() or (fn_has_izin('kasir.tutup') and outlet_id in (select fn_user_outlet_ids())))
  with check (fn_is_owner() or (fn_has_izin('kasir.tutup') and outlet_id in (select fn_user_outlet_ids())));

create policy pembayaran_shift_select on pembayaran_shift for select
  using (
    fn_is_owner()
    or shift_kasir_id in (select id from shift_kasir where outlet_id in (select fn_user_outlet_ids()))
  );
create policy pembayaran_shift_write on pembayaran_shift for insert
  with check (
    fn_is_owner()
    or (
      fn_has_izin('kasir.tutup')
      and shift_kasir_id in (select id from shift_kasir where outlet_id in (select fn_user_outlet_ids()))
    )
  );

create policy pembelian_harian_select on pembelian_harian for select
  using (fn_is_owner() or outlet_id in (select fn_user_outlet_ids()));
create policy pembelian_harian_write on pembelian_harian for insert
  with check (
    fn_is_owner()
    or (fn_has_izin('kasir.tutup') and outlet_id in (select fn_user_outlet_ids()))
  );
create policy pembelian_harian_update on pembelian_harian for update
  using (fn_is_owner() or (fn_has_izin('kasir.tutup') and outlet_id in (select fn_user_outlet_ids())))
  with check (fn_is_owner() or (fn_has_izin('kasir.tutup') and outlet_id in (select fn_user_outlet_ids())));
