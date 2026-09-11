# Workspace Madani88 — Dokumen Arsitektur Fase 1
**Cakupan:** Core System + Master Data
**Status:** Draf v1 — untuk ditinjau owner
**Tanggal:** 11 September 2026

---

## 1. Tujuan fase 1

Membangun fondasi yang dipakai semua modul berikutnya. Fase 1 belum menggantikan aplikasi apa pun (Farmacare, GajiHub, Akuntansiku tetap jalan). Hasil fase 1: pengguna bisa login di web & HP, hak akses berjalan per outlet, dan data master (produk, supplier, pelanggan, pegawai) tersimpan rapi dengan jejak audit.

**Di luar cakupan fase 1:** transaksi (POS, pembelian, stok), payroll, jurnal, dashboard.

---

## 2. Keputusan arsitektur (usulan)

| # | Keputusan | Alasan |
|---|---|---|
| A1 | Hierarki data: **Entitas → Outlet** | Cabang baru dengan komposisi pemilik berbeda butuh pembukuan terpisah. Menambah lapisan entitas belakangan = migrasi seluruh data. |
| A2 | Satu database untuk semua entitas & outlet | Laporan konsolidasi dan mutasi antar outlet jadi mudah; pemisahan dilakukan lewat hak akses. |
| A3 | Web + HP dari **satu kode** (web app yang bisa di-install di HP / PWA) | Dipelihara sendiri → satu kode jauh lebih ringan daripada web + aplikasi Android/iOS terpisah. |
| A4 | Layanan terkelola (managed), bukan server sendiri | Tidak ada programmer untuk merawat server, patch keamanan, dan backup manual. |
| A5 | Semua perubahan data tercatat di audit log (siapa, kapan, nilai lama, nilai baru) | Kontrol internal & kebutuhan investigasi selisih. |
| A6 | Tidak ada hapus permanen; data dinonaktifkan (soft delete) | Riwayat transaksi lama tetap merujuk ke data master yang valid. |
| A7 | Zona waktu sistem: **WIB (UTC+7)** | Batam masuk WIB; cut-off harian mengikuti jam lokal. |
| A8 | Modul klinik **tidak dibangun sendiri** | RME klinik tetap di sistem yang sekarang (terhubung SATUSEHAT); Workspace hanya menarik data pendapatan & pemakaian obat. |

---

## 3. Teknologi yang diusulkan

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Aplikasi | Next.js (React) | Satu kode untuk web & HP; dukungan komunitas besar sehingga Claude menanganinya dengan baik. |
| Database | PostgreSQL via Supabase | Termasuk login, penyimpanan file, dan Row Level Security (hak akses per outlet dipaksakan di database, bukan hanya di tampilan). |
| Hosting | Vercel (aplikasi) + Supabase (database), region Singapura | Keduanya terkelola; tidak perlu merawat server. |
| Kode | GitHub (repositori privat) | Riwayat perubahan, rollback, dan sumber kebenaran untuk Claude di setiap sesi. |

**Perkiraan biaya:** paket berbayar Supabase + Vercel sekitar USD 45/bulan (±Rp750 rb). [Menebak — cek harga terbaru; paket gratis Vercel tidak boleh dipakai komersial.]

**Perlu dicek sebelum mulai:** aturan penyimpanan data pribadi (UU PDP No. 27/2022) untuk data pelanggan dan pegawai, termasuk apakah server di Singapura dapat diterima atau perlu pusat data di Indonesia.

---

## 4. Model data inti

### 4.1 Organisasi & akses
| Tabel | Isi utama |
|---|---|
| `entitas` | Nama badan usaha, NPWP, alamat, status aktif |
| `outlet` | Kode (GRL, NGY, KDA, …), nama, entitas, alamat, izin apotek + tanggal berlaku, jam operasional |
| `pengguna` | Akun login (email/HP), status aktif, terakhir login |
| `peran` | Owner, APJ, Apoteker, TTK, Administrator, (peran lain menyusul) |
| `izin` | Daftar aksi: lihat / buat / ubah / setujui, per modul |
| `peran_izin` | Peran × izin |
| `penugasan` | Pengguna × outlet × peran (satu orang bisa punya peran berbeda di outlet berbeda; mendukung rotasi antar outlet) |

### 4.2 Pegawai
| Tabel | Isi utama |
|---|---|
| `pegawai` | Nama, NIK internal, jabatan, outlet utama, tanggal masuk, status, tautan ke `pengguna` |
| `dokumen_pegawai` | Jenis (KTP, STR, SIPA, SIPTTK, kontrak), nomor, tanggal kedaluwarsa, file |

Pengingat otomatis 60 hari sebelum STR/SIP kedaluwarsa masuk fase 1 karena menyangkut izin praktik.

### 4.3 Produk
| Tabel | Isi utama |
|---|---|
| `produk` | Kode, nama dagang, zat aktif, kategori, **golongan obat** (bebas, bebas terbatas, keras, psikotropika, narkotika, prekursor, alkes, non-obat), wajib resep (ya/tidak), status aktif |
| `satuan_produk` | Satuan bertingkat + faktor konversi (mis. 1 box = 10 strip = 100 tablet), satuan dasar |
| `barcode_produk` | Satu produk bisa punya banyak barcode |
| `harga_produk` | Harga jual per outlet per satuan, berlaku mulai tanggal (riwayat harga tidak ditimpa) |
| `stok_parameter` | Stok minimum & maksimum per produk per outlet (dipakai fase inventori) |

### 4.4 Mitra
| Tabel | Isi utama |
|---|---|
| `supplier` | Nama PBF, NPWP, kontak, termin pembayaran, status |
| `pelanggan` | Nama, no. HP, tanggal lahir (opsional), persetujuan penyimpanan data |

### 4.5 Kontrol
| Tabel | Isi utama |
|---|---|
| `audit_log` | Tabel, ID data, aksi, nilai lama, nilai baru, pengguna, waktu, perangkat |
| `persetujuan` | Antrean persetujuan: jenis, pengaju, penyetuju, status, alasan |
| `periode` | Periode bulanan per entitas: terbuka / ditutup |

---

## 5. Hak akses awal (draf)

| Aksi | Owner | APJ | Apoteker | TTK | Administrator |
|---|---|---|---|---|---|
| Kelola entitas & outlet | ✔ | – | – | – | – |
| Kelola pengguna & peran | ✔ | – | – | – | – |
| Lihat semua outlet | ✔ | outlet sendiri | outlet sendiri | outlet sendiri | outlet sendiri |
| Tambah/ubah produk | ✔ | ✔ | ajukan | – | ajukan |
| Ubah harga jual | ✔ | ajukan | – | – | – |
| Kelola supplier | ✔ | ✔ | – | – | ✔ |
| Kelola data pegawai | ✔ | lihat | – | – | ✔ |
| Setujui pengajuan | ✔ | sebagian | – | – | – |
| Lihat audit log | ✔ | – | – | – | – |

"Ajukan" = perubahan masuk antrean persetujuan, belum berlaku sampai disetujui.

---

## 6. Aturan kontrol

1. Perubahan harga jual selalu lewat persetujuan owner dan menyimpan riwayat.
2. Produk golongan psikotropika/narkotika hanya bisa dibuat/diubah oleh APJ atau owner.
3. Pengguna nonaktif tidak bisa login, tetapi riwayatnya tetap utuh.
4. Setiap akses ke data pelanggan dan pegawai tercatat di audit log.
5. Periode yang sudah ditutup tidak bisa diubah (berlaku mulai fase transaksi).

---

## 7. Cara kerja pengembangan (dipelihara owner + Claude)

Karena tidak ada programmer, disiplin berikut wajib:

1. **Satu repositori GitHub** berisi kode + folder `/docs` (dokumen ini, keputusan, kamus data). Setiap sesi dengan Claude dimulai dengan membaca `/docs`.
2. **Dua lingkungan:** *staging* untuk uji coba, *production* untuk pemakaian nyata. Tidak ada perubahan langsung ke production.
3. **Perubahan database lewat file migrasi** yang tersimpan di repo, bukan diklik manual di dashboard.
4. **Tes otomatis** untuk logika uang, stok, dan hak akses.
5. **Backup harian otomatis** + **uji pemulihan (restore) setiap bulan**. Backup yang belum pernah diuji dianggap tidak ada.
6. **Catatan keputusan:** setiap keputusan penting ditulis satu baris di `/docs/keputusan.md` beserta tanggal dan alasannya.

---

## 8. Kriteria fase 1 selesai

- [ ] Semua pegawai aktif punya akun dan bisa login dari HP
- [ ] Hak akses teruji: pengguna outlet A tidak bisa melihat data outlet B
- [ ] Master produk terisi dari data Farmacare (impor), termasuk satuan bertingkat & harga per outlet
- [ ] Supplier terisi
- [ ] Pengingat STR/SIP berjalan
- [ ] Audit log mencatat semua perubahan
- [ ] Backup & restore sudah diuji sekali

---

## 9. Keputusan terbuka

| # | Pertanyaan | Dampak |
|---|---|---|
| T1 | Apakah cabang baru berbeda kepemilikan dari Madani88? | Menentukan jumlah entitas awal |
| T2 | Sistem RME apa yang dipakai klinik sekarang, dan bisakah datanya diekspor/diakses via API? | Menentukan cara integrasi klinik |
| T3 | Apakah Farmacare bisa mengekspor master produk (Excel/CSV)? | Menentukan cara migrasi data produk |
| T4 | Setuju dengan usulan teknologi di bagian 3? | Harus dikunci sebelum menulis kode |
| T5 | Nama domain untuk aplikasi | Dibutuhkan saat deployment |

---

## 10. Urutan fase (ringkas)

1. **Core + master data** ← dokumen ini
2. Dashboard KPI + kontrol kasir (data dari ekspor Farmacare & bank)
3. HR: absensi, jadwal, payroll → lepas GajiHub
4. Kas, bank & akuntansi otomatis → lepas Akuntansiku
5. Inventori + pembelian + POS apotek (termasuk mode offline) → uji paralel ≥1 bulan → lepas Farmacare
6. Integrasi data klinik (bukan membangun RME)
