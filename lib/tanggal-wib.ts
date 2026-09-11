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

// Rentang [awal, akhir) untuk satu bulan kalender, dipakai halaman dashboard
// supaya bisa lihat bulan lain (bukan cuma bulan berjalan) lewat ?bulan=YYYY-MM.
export function rentangBulan(bulanParam?: string): { awal: string; akhir: string; label: string } {
  let tahun: number;
  let bulan: number; // 0-indexed

  if (bulanParam && /^\d{4}-\d{2}$/.test(bulanParam)) {
    tahun = Number(bulanParam.slice(0, 4));
    bulan = Number(bulanParam.slice(5, 7)) - 1;
  } else {
    const w = tanggalWibSekarang();
    tahun = w.getUTCFullYear();
    bulan = w.getUTCMonth();
  }

  const awal = new Date(Date.UTC(tahun, bulan, 1)).toISOString().slice(0, 10);
  const akhir = new Date(Date.UTC(tahun, bulan + 1, 1)).toISOString().slice(0, 10);
  const label = `${tahun}-${String(bulan + 1).padStart(2, "0")}`;

  return { awal, akhir, label };
}

export function formatRupiah(v: number): string {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}
