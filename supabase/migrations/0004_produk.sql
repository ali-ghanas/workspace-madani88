create table produk (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique,
  nama_dagang text not null,
  zat_aktif text,
  kategori text,
  golongan_obat text not null check (golongan_obat in (
    'bebas', 'bebas_terbatas', 'keras', 'psikotropika', 'narkotika', 'prekursor', 'alkes', 'non_obat'
  )),
  wajib_resep boolean not null default false,
  status_persetujuan text not null default 'disetujui' check (status_persetujuan in ('disetujui', 'pending')),
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index produk_golongan_obat_idx on produk(golongan_obat);

create table satuan_produk (
  id uuid primary key default gen_random_uuid(),
  produk_id uuid not null references produk(id) on delete cascade,
  nama_satuan text not null,
  faktor_konversi numeric not null default 1 check (faktor_konversi > 0),
  adalah_satuan_dasar boolean not null default false,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index satuan_produk_produk_id_idx on satuan_produk(produk_id);
-- Maksimal satu satuan dasar per produk (basis konversi antar satuan bertingkat).
create unique index satuan_produk_satu_dasar_idx on satuan_produk(produk_id)
  where adalah_satuan_dasar and status_aktif;

create table barcode_produk (
  id uuid primary key default gen_random_uuid(),
  produk_id uuid not null references produk(id) on delete cascade,
  barcode text not null unique,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now()
);

create index barcode_produk_produk_id_idx on barcode_produk(produk_id);

-- Append-only: harga baru selalu berupa baris baru dengan berlaku_mulai baru,
-- tidak pernah UPDATE baris lama, supaya riwayat harga (§4.3) tidak tertimpa.
create table harga_produk (
  id uuid primary key default gen_random_uuid(),
  produk_id uuid not null references produk(id),
  outlet_id uuid not null references outlet(id),
  satuan_produk_id uuid not null references satuan_produk(id),
  harga numeric not null check (harga >= 0),
  berlaku_mulai date not null,
  dibuat_oleh uuid references pengguna(id),
  created_at timestamptz not null default now()
);

create index harga_produk_lookup_idx on harga_produk(produk_id, outlet_id, satuan_produk_id, berlaku_mulai desc);

create table stok_parameter (
  id uuid primary key default gen_random_uuid(),
  produk_id uuid not null references produk(id),
  outlet_id uuid not null references outlet(id),
  stok_minimum numeric not null default 0,
  stok_maksimum numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (produk_id, outlet_id)
);
