-- Dijalankan otomatis oleh `supabase db reset` (dev lokal saja).
-- Pengguna login dibuat lewat scripts/seed-demo-users.mjs (butuh Supabase Auth admin API,
-- tidak bisa lewat SQL biasa karena password perlu di-hash oleh GoTrue).

insert into peran (kode, nama) values
  ('owner', 'Owner'),
  ('apj', 'APJ'),
  ('apoteker', 'Apoteker'),
  ('ttk', 'TTK'),
  ('administrator', 'Administrator');

insert into izin (kode, modul, deskripsi) values
  ('produk.tambah', 'produk', 'Tambah produk baru'),
  ('produk.ubah', 'produk', 'Ubah produk langsung (tanpa persetujuan)'),
  ('produk.ajukan', 'produk', 'Ajukan tambah/ubah produk (butuh persetujuan owner/APJ)'),
  ('produk.golongan_khusus', 'produk', 'Kelola produk golongan psikotropika/narkotika'),
  ('pegawai.kelola', 'pegawai', 'Tambah/ubah data pegawai'),
  ('supplier.kelola', 'mitra', 'Tambah/ubah data supplier'),
  ('harga.ubah', 'produk', 'Ubah harga jual langsung'),
  ('harga.ajukan', 'produk', 'Ajukan perubahan harga jual (butuh persetujuan owner)'),
  ('persetujuan.setujui', 'kontrol', 'Menyetujui/menolak pengajuan');

insert into peran_izin (peran_id, izin_id)
select p.id, i.id from peran p cross join izin i where p.kode = 'owner';

insert into peran_izin (peran_id, izin_id)
select p.id, i.id from peran p, izin i
where p.kode = 'apj'
  and i.kode in ('produk.tambah', 'produk.ubah', 'produk.golongan_khusus', 'harga.ajukan', 'supplier.kelola', 'persetujuan.setujui');

insert into peran_izin (peran_id, izin_id)
select p.id, i.id from peran p, izin i
where p.kode = 'apoteker' and i.kode = 'produk.ajukan';

insert into peran_izin (peran_id, izin_id)
select p.id, i.id from peran p, izin i
where p.kode = 'administrator'
  and i.kode in ('produk.ajukan', 'pegawai.kelola', 'supplier.kelola');

-- Data demo untuk dev lokal (2 outlet, dipakai scripts/seed-demo-users.mjs untuk uji isolasi RLS antar outlet)
insert into entitas (id, nama, npwp, status_aktif) values
  ('00000000-0000-0000-0000-000000000001', 'PT Madani88 (Demo)', '00.000.000.0-000.000', true);

insert into outlet (id, entitas_id, kode, nama, status_aktif) values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'GRL', 'Outlet Griya Legita (Demo)', true),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'NGY', 'Outlet Nagoya (Demo)', true);
