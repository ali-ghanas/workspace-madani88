"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna, punyaIzin } from "@/lib/auth/session";

export async function setujuiProduk(produkId: string) {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!sesi.isOwner && !punyaIzin(sesi, "persetujuan.setujui")) {
    return { error: "Anda tidak punya izin menyetujui pengajuan." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("produk").update({ status_persetujuan: "disetujui" }).eq("id", produkId);

  if (error) return { error: error.message };

  revalidatePath("/persetujuan");
  revalidatePath("/produk");
  revalidatePath(`/produk/${produkId}`);
  return { error: undefined };
}

// Tidak ada tabel staging payload (lihat docs/keputusan.md) — "Tolak" memulihkan
// nilai sebelum perubahan lewat baris audit_log terakhir untuk produk ini.
// Karena audit_log hanya bisa dibaca Owner (§5 "Lihat audit log: Owner"), Tolak
// untuk sekarang hanya tersedia untuk Owner (APJ tetap bisa Setujui).
export async function tolakProduk(produkId: string) {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!sesi.isOwner) {
    return { error: "Menolak pengajuan (revert) hanya bisa dilakukan Owner." };
  }

  const supabase = await createClient();
  const { data: logTerakhir, error: logError } = await supabase
    .from("audit_log")
    .select("nilai_lama")
    .eq("nama_tabel", "produk")
    .eq("data_id", produkId)
    .eq("aksi", "update")
    .order("waktu", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (logError) return { error: logError.message };
  if (!logTerakhir?.nilai_lama) {
    return { error: "Tidak ditemukan riwayat untuk dipulihkan." };
  }

  const nilaiLama = logTerakhir.nilai_lama as Record<string, unknown>;
  const { error } = await supabase
    .from("produk")
    .update({
      nama_dagang: nilaiLama.nama_dagang,
      zat_aktif: nilaiLama.zat_aktif,
      kategori: nilaiLama.kategori,
      golongan_obat: nilaiLama.golongan_obat,
      wajib_resep: nilaiLama.wajib_resep,
      status_persetujuan: nilaiLama.status_persetujuan,
    })
    .eq("id", produkId);

  if (error) return { error: error.message };

  revalidatePath("/persetujuan");
  revalidatePath("/produk");
  revalidatePath(`/produk/${produkId}`);
  return { error: undefined };
}
