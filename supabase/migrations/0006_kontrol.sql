create table audit_log (
  id uuid primary key default gen_random_uuid(),
  nama_tabel text not null,
  data_id uuid,
  aksi text not null check (aksi in ('insert', 'update', 'delete')),
  nilai_lama jsonb,
  nilai_baru jsonb,
  pengguna_id uuid,
  waktu timestamptz not null default now()
);

create index audit_log_tabel_data_idx on audit_log(nama_tabel, data_id);
create index audit_log_waktu_idx on audit_log(waktu desc);

create table persetujuan (
  id uuid primary key default gen_random_uuid(),
  jenis text not null,
  nama_tabel text not null,
  data_id uuid not null,
  payload jsonb,
  pengaju_id uuid references pengguna(id),
  penyetuju_id uuid references pengguna(id),
  status text not null default 'menunggu' check (status in ('menunggu', 'disetujui', 'ditolak')),
  alasan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index persetujuan_status_idx on persetujuan(status) where status = 'menunggu';

create table periode (
  id uuid primary key default gen_random_uuid(),
  entitas_id uuid not null references entitas(id),
  bulan int not null check (bulan between 1 and 12),
  tahun int not null check (tahun >= 2020),
  status text not null default 'terbuka' check (status in ('terbuka', 'ditutup')),
  ditutup_oleh uuid references pengguna(id),
  ditutup_pada timestamptz,
  created_at timestamptz not null default now(),
  unique (entitas_id, bulan, tahun)
);
