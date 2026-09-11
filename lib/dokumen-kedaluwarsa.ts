// Pengingat STR/SIP 60 hari (§4.2 dokumen arsitektur). Untuk increment ini,
// "pengingat" berupa badge di UI, bukan notifikasi otomatis (email/WA) —
// itu butuh keputusan saluran notifikasi yang belum diambil owner.
const HARI_PERINGATAN = 60;

export type StatusKedaluwarsa = "kedaluwarsa" | "segera" | "aman" | null;

export function statusKedaluwarsa(tanggalKedaluwarsa: string | null): StatusKedaluwarsa {
  if (!tanggalKedaluwarsa) return null;

  const hariTersisa = Math.ceil(
    (new Date(tanggalKedaluwarsa).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (hariTersisa < 0) return "kedaluwarsa";
  if (hariTersisa <= HARI_PERINGATAN) return "segera";
  return "aman";
}
