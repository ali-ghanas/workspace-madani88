-- Sebelumnya harga.ajukan (APJ) berperilaku sama seperti harga.ubah (langsung
-- berlaku) — tidak sesuai §5 "Ubah harga jual: APJ ajukan". Tambah status
-- supaya harga usulan APJ butuh persetujuan Owner dulu sebelum jadi acuan.
alter table harga_produk
  add column status_persetujuan text not null default 'disetujui'
    check (status_persetujuan in ('disetujui', 'pending', 'ditolak'));

-- harga_produk sengaja tidak punya policy RLS untuk UPDATE (append-only, lihat
-- 0008_rls.sql) supaya harga & tanggal tidak pernah bisa ditimpa lewat API biasa.
-- Menyetujui/menolak cuma perlu ubah satu kolom status, jadi lewat fungsi
-- security definer yang tervalidasi ketat, bukan buka policy UPDATE umum yang
-- akan melubangi jaminan append-only untuk kolom harga/tanggal juga.
create function fn_setujui_harga(p_harga_id uuid, p_status text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not fn_is_owner() then
    raise exception 'hanya owner yang bisa menyetujui/menolak harga';
  end if;
  if p_status not in ('disetujui', 'ditolak') then
    raise exception 'status tidak valid: %', p_status;
  end if;

  update harga_produk
  set status_persetujuan = p_status
  where id = p_harga_id and status_persetujuan = 'pending';

  if not found then
    raise exception 'harga tidak ditemukan atau bukan status pending';
  end if;
end;
$$;
