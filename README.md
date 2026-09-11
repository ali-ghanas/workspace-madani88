# Workspace Madani88

Core system & master data untuk Apotek Madani88 (3 outlet: Greenland, Nagoya, KDA). Lihat
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
| `apoteker.grl@madani88.local` | Apoteker | Greenland (GRL) |
| `apoteker.ngy@madani88.local` | Apoteker | Nagoya (NGY) |
| `apoteker.kda@madani88.local` | Apoteker | KDA |
| `admin.grl@madani88.local` | Administrator | Greenland (GRL) |
| `apj.grl@madani88.local` | APJ | Greenland (GRL) |

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
Pelanggan, Pegawai (badge pengingat STR/SIP), Audit Log, Persetujuan (setujui/tolak pengajuan),
dan Kelola Pengguna & Penugasan (undang pengguna baru + atur peran×outlet). Tema visual
disamakan dengan dashboard keuangan Madani88 (ghanas.net). Semua diverifikasi end-to-end lawan
Supabase lokal — bukan cuma ditulis dan diasumsikan benar.

**Belum dikerjakan** (lihat `docs/keputusan.md` untuk detail & alasan):
- Belum tersambung ke akun Supabase/GitHub/Vercel asli — masih 100% lokal
- Master produk belum diimpor dari Farmacare (perlu file ekspornya dari owner)
- Pengingat STR/SIP baru badge di UI, belum notifikasi email/WhatsApp otomatis
- Backup & restore belum diuji di lingkungan Supabase hosting sungguhan (baru local dev)
- ~~Alur "ajukan" untuk harga jual~~ — **sudah selesai**: APJ mengajukan (masuk status
  "menunggu"), Owner menyetujui/menolak di `/persetujuan` (bagian "Persetujuan Harga")
