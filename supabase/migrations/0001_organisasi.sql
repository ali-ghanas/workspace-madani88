create extension if not exists pgcrypto;

create table entitas (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  npwp text,
  alamat text,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table outlet (
  id uuid primary key default gen_random_uuid(),
  entitas_id uuid not null references entitas(id),
  kode text not null unique,
  nama text not null,
  alamat text,
  izin_apotek_nomor text,
  izin_apotek_berlaku_sampai date,
  jam_buka time,
  jam_tutup time,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index outlet_entitas_id_idx on outlet(entitas_id);
