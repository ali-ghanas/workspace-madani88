create table supplier (
  id uuid primary key default gen_random_uuid(),
  nama_pbf text not null,
  npwp text,
  kontak text,
  termin_pembayaran text,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pelanggan (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  no_hp text,
  tanggal_lahir date,
  persetujuan_data boolean not null default false,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
