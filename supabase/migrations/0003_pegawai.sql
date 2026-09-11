create table pegawai (
  id uuid primary key default gen_random_uuid(),
  pengguna_id uuid references pengguna(id),
  outlet_utama_id uuid not null references outlet(id),
  nama text not null,
  nik_internal text,
  jabatan text,
  tanggal_masuk date,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pegawai_outlet_utama_id_idx on pegawai(outlet_utama_id);

create table dokumen_pegawai (
  id uuid primary key default gen_random_uuid(),
  pegawai_id uuid not null references pegawai(id) on delete cascade,
  jenis text not null check (jenis in ('ktp', 'str', 'sipa', 'siptt', 'kontrak', 'lainnya')),
  nomor text,
  tanggal_kedaluwarsa date,
  file_path text,
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dokumen_pegawai_pegawai_id_idx on dokumen_pegawai(pegawai_id);
create index dokumen_pegawai_kedaluwarsa_idx on dokumen_pegawai(tanggal_kedaluwarsa)
  where status_aktif and tanggal_kedaluwarsa is not null;
