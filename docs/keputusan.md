# Catatan Keputusan

Satu baris per keputusan penting, sesuai aturan §7.6 dokumen arsitektur.

- **2026-09-11** — Mulai pembangunan Fase 1 dengan tumpukan teknologi sesuai usulan §3 dokumen arsitektur (Next.js + Supabase + Vercel), disetujui owner secara implisit lewat instruksi "mau bangun ini".
- **2026-09-11** — Increment pertama: fondasi (schema semua tabel §4, auth, RBAC/RLS per outlet, audit log) + modul Produk penuh sebagai pola referensi. Modul supplier/pelanggan/pegawai menyusul memakai pola yang sama.
- **2026-09-11** — Supabase & GitHub belum dibuat oleh owner. Pengembangan dimulai lokal (Supabase CLI + Docker Desktop) agar tidak ada kerja ulang saat akun sudah siap — tinggal `supabase link` + push migrasi.
- **2026-09-11** — Node.js LTS dan Git dipasang otomatis via `winget` di komputer pengembangan (bukan perubahan setting sistem, hanya instalasi tool standar). Docker Desktop **tidak** dipasang otomatis (butuh WSL2/Hyper-V + restart) — menunggu owner memasang sendiri.
- **2026-09-11** — Alur "ajukan" (persetujuan) di §5 disederhanakan untuk increment pertama: skema `persetujuan` sudah dibuat, tapi UI antrean persetujuan penuh baru dibangun bersamaan modul kedua. Perubahan oleh peran non-owner untuk field yang butuh persetujuan ditandai `status_persetujuan = 'pending'` di baris terkait, belum masuk antrean UI.

## Keputusan terbuka dari dokumen (§9) — belum dijawab owner

- T1: Apakah cabang baru berbeda kepemilikan dari Madani88? (menentukan jumlah entitas awal)
- T2: Sistem RME klinik & akses API-nya (untuk fase integrasi klinik nanti)
- T3: Bisakah Farmacare ekspor master produk (Excel/CSV)? (untuk migrasi data produk)
- T5: Nama domain aplikasi (dibutuhkan saat deployment)
