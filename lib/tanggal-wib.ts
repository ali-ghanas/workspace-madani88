// Semua tanggal sistem pakai WIB (UTC+7, tanpa DST) sesuai A7 dokumen arsitektur.
// Dihitung lewat aritmatika UTC+7 jam supaya benar di server manapun (Vercel=UTC,
// dev lokal=timezone apa saja) — bukan lewat toLocaleString+parse yang bisa keliru
// tergantung timezone lokal runtime.
function tanggalWibSekarang(): Date {
  return new Date(Date.now() + 7 * 60 * 60 * 1000);
}

export function awalBulanWib(offsetBulan = 0): string {
  const w = tanggalWibSekarang();
  const y = w.getUTCFullYear();
  const m = w.getUTCMonth() + offsetBulan;
  const d = new Date(Date.UTC(y, m, 1));
  return d.toISOString().slice(0, 10);
}

export function hariIniWib(): string {
  return tanggalWibSekarang().toISOString().slice(0, 10);
}

export function formatRupiah(v: number): string {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}
