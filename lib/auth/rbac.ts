import { punyaIzin, type SesiPengguna } from "./session";

const GOLONGAN_KHUSUS = ["psikotropika", "narkotika"];

// Aturan kontrol §6.2: psikotropika/narkotika hanya boleh dibuat/diubah
// langsung oleh APJ atau owner. Peran lain yang punya izin "ajukan" tetap
// bisa menyimpan, tapi hasilnya ditandai pending (lihat docs/keputusan.md).
export function statusPersetujuanUntuk(
  sesi: Pick<SesiPengguna, "isOwner" | "izinKodes">,
  golonganObat: string,
  izinLangsung: string
): "disetujui" | "pending" {
  const bolehLangsung = punyaIzin(sesi as SesiPengguna, izinLangsung);
  const golonganDiizinkan =
    !GOLONGAN_KHUSUS.includes(golonganObat) ||
    sesi.isOwner ||
    punyaIzin(sesi as SesiPengguna, "produk.golongan_khusus");

  return bolehLangsung && golonganDiizinkan ? "disetujui" : "pending";
}
