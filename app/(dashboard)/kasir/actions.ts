"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna, punyaIzin } from "@/lib/auth/session";

export type ActionState = { error?: string } | null;

export async function tutupShift(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!sesi.isOwner && !punyaIzin(sesi, "kasir.tutup")) {
    return { error: "Anda tidak punya izin input tutup shift." };
  }

  const tanggal = String(formData.get("tanggal") ?? "");
  const outletId = String(formData.get("outlet_id") ?? "");
  const shift = String(formData.get("shift") ?? "");
  const kasirNama = String(formData.get("kasir_nama") ?? "").trim();
  const jumlahTransaksi = Number(formData.get("jumlah_transaksi") ?? 0);
  const tunai = Number(formData.get("tunai") ?? 0);
  const setoran = Number(formData.get("setoran") ?? 0);
  const hppRaw = String(formData.get("hpp") ?? "").trim();
  const hpp = hppRaw ? Number(hppRaw) : null;
  const catatan = String(formData.get("catatan") ?? "").trim() || null;

  if (!tanggal || !outletId || !shift || !kasirNama) {
    return { error: "Tanggal, outlet, shift, dan nama kasir wajib diisi." };
  }

  const channels = formData.getAll("channel").map(String);
  const subChannels = formData.getAll("sub_channel").map(String);
  const channelJumlah = formData.getAll("channel_jumlah").map((v) => Number(v));

  const pembayaran = channels
    .map((channel, i) => ({
      channel: channel.trim(),
      sub_channel: subChannels[i]?.trim() || null,
      jumlah: channelJumlah[i] || 0,
    }))
    .filter((p) => p.channel && p.jumlah > 0);

  const totalNontunai = pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
  const totalPenjualan = tunai + totalNontunai;
  // Selisih = rekonsiliasi uang FISIK (setoran vs tunai) — nontunai langsung masuk
  // rekening, tidak lewat tangan kasir, jadi tidak relevan untuk cek selisih kas.
  const selisih = setoran - tunai;

  const supabase = await createClient();

  const { data: shiftBaru, error: shiftError } = await supabase
    .from("shift_kasir")
    .insert({
      tanggal,
      outlet_id: outletId,
      shift,
      kasir_nama: kasirNama,
      jumlah_transaksi: jumlahTransaksi,
      tunai,
      total_nontunai: totalNontunai,
      total_penjualan: totalPenjualan,
      setoran,
      selisih,
      hpp,
      catatan,
      dibuat_oleh: sesi!.penggunaId,
    })
    .select("id")
    .single();

  if (shiftError) {
    return { error: shiftError.message };
  }

  if (pembayaran.length > 0) {
    const { error: pembayaranError } = await supabase
      .from("pembayaran_shift")
      .insert(pembayaran.map((p) => ({ ...p, shift_kasir_id: shiftBaru.id })));

    if (pembayaranError) {
      return { error: `Shift tersimpan, tapi gagal simpan breakdown channel: ${pembayaranError.message}` };
    }
  }

  revalidatePath("/kasir/tutup");
  revalidatePath("/dashboard");
  redirect("/kasir/tutup?sukses=1");
}

export async function tambahPembelianHarian(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!sesi.isOwner && !punyaIzin(sesi, "kasir.tutup")) {
    return { error: "Anda tidak punya izin input pembelian harian." };
  }

  const tanggal = String(formData.get("tanggal") ?? "");
  const outletId = String(formData.get("outlet_id") ?? "");
  const jumlah = Number(formData.get("jumlah") ?? 0);

  if (!tanggal || !outletId) {
    return { error: "Tanggal dan outlet wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pembelian_harian")
    .upsert(
      { tanggal, outlet_id: outletId, jumlah, dibuat_oleh: sesi!.penggunaId },
      { onConflict: "tanggal,outlet_id" }
    );

  if (error) return { error: error.message };

  revalidatePath("/kasir/tutup");
  revalidatePath("/dashboard");
  return { error: undefined };
}
