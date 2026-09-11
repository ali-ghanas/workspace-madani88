# Workspace Madani88

Core system & master data untuk Madani88 (apotek multi-outlet). Lihat
[docs/architecture/Arsitektur_Fase1_Workspace_Madani88.md](docs/architecture/Arsitektur_Fase1_Workspace_Madani88.md)
untuk konteks & keputusan arsitektur, dan [docs/keputusan.md](docs/keputusan.md) untuk log keputusan.

Tumpukan: Next.js (App Router) + Supabase (Postgres, Auth, RLS) + Tailwind.

## Menjalankan secara lokal

Prasyarat: Node.js, Git, dan Docker Desktop (semua sudah terpasang & jalan di komputer dev ini).

```bash
npm install
npx supabase start
```

`supabase start` akan menampilkan `API URL` dan `anon key`. Salin `.env.local.example` menjadi
`.env.local` lalu isi `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan nilai tersebut.

Buat pengguna demo (untuk uji isolasi RLS antar outlet & antar peran):

```bash
$env:SUPABASE_SERVICE_ROLE_KEY = "<service_role key dari supabase status>"
node scripts/seed-demo-users.mjs
```

Lalu jalankan app:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Password semua akun demo: `Demo1234!`.

| Email | Peran | Outlet |
|---|---|---|
| `owner.demo@madani88.local` | Owner | semua |
| `apoteker.grl@madani88.local` | Apoteker | GRL |
| `apoteker.ngy@madani88.local` | Apoteker | NGY |
| `admin.grl@madani88.local` | Administrator | GRL |

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

Fondasi (schema semua tabel, auth, RBAC/RLS per outlet, audit log) + modul Produk, Supplier,
Pelanggan, dan Pegawai (termasuk badge pengingat dokumen STR/SIP kedaluwarsa). Diverifikasi
end-to-end lawan Supabase lokal. Belum tersambung ke akun Supabase/GitHub asli, belum ada UI
antrean persetujuan penuh, dan pengingat dokumen masih badge di UI (belum notifikasi otomatis)
— lihat `docs/keputusan.md`.
