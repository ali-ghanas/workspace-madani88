import { createClient } from "@/lib/supabase/server";

export type PenugasanAktif = {
  outletId: string;
  outletKode: string;
  outletNama: string;
  peranKode: string;
};

export type SesiPengguna = {
  penggunaId: string;
  nama: string;
  isOwner: boolean;
  penugasan: PenugasanAktif[];
  izinKodes: Set<string>;
};

// Sumber kebenaran akses tetap RLS di database (§A2/A4) — helper ini hanya
// dipakai untuk keputusan tampilan UI (menu apa yang muncul, status_persetujuan
// apa yang ditulis), bukan sebagai satu-satunya lapisan keamanan.
export async function getSesiPengguna(): Promise<SesiPengguna | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: pengguna } = await supabase
    .from("pengguna")
    .select("nama")
    .eq("id", user.id)
    .single();

  const { data: penugasanRows } = await supabase
    .from("penugasan")
    .select("outlet_id, peran_id, outlet:outlet_id(kode, nama), peran:peran_id(kode)")
    .eq("pengguna_id", user.id)
    .eq("status_aktif", true);

  const penugasan: PenugasanAktif[] = (penugasanRows ?? []).map((row) => ({
    outletId: row.outlet_id as string,
    outletKode: (row.outlet as unknown as { kode: string; nama: string }).kode,
    outletNama: (row.outlet as unknown as { kode: string; nama: string }).nama,
    peranKode: (row.peran as unknown as { kode: string }).kode,
  }));

  const isOwner = penugasan.some((p) => p.peranKode === "owner");

  const peranIds = (penugasanRows ?? []).map((row) => row.peran_id as string);
  let izinKodes = new Set<string>();

  if (peranIds.length > 0) {
    const { data: izinRows } = await supabase
      .from("peran_izin")
      .select("izin:izin_id(kode)")
      .in("peran_id", peranIds);

    izinKodes = new Set(
      (izinRows ?? []).map((row) => (row.izin as unknown as { kode: string }).kode)
    );
  }

  return {
    penggunaId: user.id,
    nama: pengguna?.nama ?? user.email ?? "",
    isOwner,
    penugasan,
    izinKodes,
  };
}

export function punyaIzin(sesi: SesiPengguna, kode: string): boolean {
  return sesi.isOwner || sesi.izinKodes.has(kode);
}
