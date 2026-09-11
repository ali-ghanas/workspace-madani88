const KOLOM_DIABAIKAN = new Set(["created_at", "updated_at"]);

export type PerubahanField = { field: string; lama: unknown; baru: unknown };

// Untuk aksi 'update': hanya field yang benar-benar berubah nilainya.
export function hitungDiff(
  nilaiLama: Record<string, unknown> | null,
  nilaiBaru: Record<string, unknown> | null
): PerubahanField[] {
  if (!nilaiLama || !nilaiBaru) return [];

  const semuaField = new Set([...Object.keys(nilaiLama), ...Object.keys(nilaiBaru)]);
  const hasil: PerubahanField[] = [];

  for (const field of semuaField) {
    if (KOLOM_DIABAIKAN.has(field)) continue;
    const lama = nilaiLama[field];
    const baru = nilaiBaru[field];
    if (JSON.stringify(lama) !== JSON.stringify(baru)) {
      hasil.push({ field, lama, baru });
    }
  }

  return hasil;
}

export function formatNilai(v: unknown): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "boolean") return v ? "ya" : "tidak";
  return String(v);
}
