# Workspace Madani88

Core system & master data untuk Madani88 (apotek multi-outlet). Lihat
[docs/architecture/Arsitektur_Fase1_Workspace_Madani88.md](docs/architecture/Arsitektur_Fase1_Workspace_Madani88.md)
untuk konteks & keputusan arsitektur, dan [docs/keputusan.md](docs/keputusan.md) untuk log keputusan.

Tumpukan: Next.js (App Router) + Supabase (Postgres, Auth, RLS) + Tailwind.

## Menjalankan secara lokal

Prasyarat: Node.js (sudah terpasang), **Docker Desktop** (untuk Supabase lokal — belum terpasang,
lihat [docker.com](https://www.docker.com/products/docker-desktop/)).

```bash
npm install
npx supabase start
```

`supabase start` akan menampilkan `API URL` dan `anon key`. Salin `.env.local.example` menjadi
`.env.local` lalu isi `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan nilai tersebut.

Buat 3 pengguna demo (owner + 2 apoteker di 2 outlet berbeda, untuk uji isolasi RLS antar outlet):

```bash
$env:SUPABASE_SERVICE_ROLE_KEY = "<service_role key dari supabase status>"
node scripts/seed-demo-users.mjs
```

Lalu jalankan app:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), masuk dengan salah satu akun demo
(`owner.demo@madani88.local` / `apoteker.grl@madani88.local` / `apoteker.ngy@madani88.local`,
password `Demo1234!`).

### Perubahan skema

Jangan ubah database lewat Supabase Studio secara manual. Buat file migrasi baru:

```bash
npx supabase migration new nama_perubahan
```

lalu `npx supabase db reset` untuk menerapkan ulang semua migrasi + seed di database lokal.

### Test

```bash
npm test
```

`tests/rbac.test.ts` murni logika (tanpa DB). `tests/harga-history.test.ts` butuh Supabase lokal
yang jalan + `SUPABASE_ANON_KEY` di env — otomatis di-skip kalau belum ada.

## Status

Increment pertama: fondasi (schema semua tabel, auth, RBAC/RLS per outlet, audit log) + modul
Produk penuh. Belum tersambung ke akun Supabase/GitHub asli — lihat `docs/keputusan.md`.
