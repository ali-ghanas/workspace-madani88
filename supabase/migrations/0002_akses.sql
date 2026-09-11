create table pengguna (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nama text not null,
  status_aktif boolean not null default true,
  terakhir_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auth.users adalah sumber login (dikelola Supabase Auth); baris `pengguna`
-- dibuat otomatis lewat trigger ini supaya app punya tempat menyimpan
-- profil & status_aktif tanpa menyentuh skema auth.users.
create function fn_handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.pengguna (id, email, nama)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nama', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function fn_handle_new_auth_user();

create table peran (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique,
  nama text not null,
  created_at timestamptz not null default now()
);

create table izin (
  id uuid primary key default gen_random_uuid(),
  kode text not null unique,
  modul text not null,
  deskripsi text,
  created_at timestamptz not null default now()
);

create table peran_izin (
  peran_id uuid not null references peran(id) on delete cascade,
  izin_id uuid not null references izin(id) on delete cascade,
  primary key (peran_id, izin_id)
);

create table penugasan (
  id uuid primary key default gen_random_uuid(),
  pengguna_id uuid not null references pengguna(id) on delete cascade,
  outlet_id uuid not null references outlet(id),
  peran_id uuid not null references peran(id),
  status_aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pengguna_id, outlet_id, peran_id)
);

create index penugasan_pengguna_id_idx on penugasan(pengguna_id) where status_aktif;
create index penugasan_outlet_id_idx on penugasan(outlet_id) where status_aktif;
