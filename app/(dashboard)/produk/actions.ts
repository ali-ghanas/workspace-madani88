"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna, punyaIzin } from "@/lib/auth/session";
import { statusPersetujuanUntuk } from "@/lib/auth/rbac";

export type ActionState = { error?: string } | null;

export async function buatProduk(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");

  const kode = String(formData.get("kode") ?? "").trim();
  const namaDagang = String(formData.get("nama_dagang") ?? "").trim();
  const zatAktif = String(formData.get("zat_aktif") ?? "").trim() || null;
  const kategori = String(formData.get("kategori") ?? "").trim() || null;
  const golonganObat = String(formData.get("golongan_obat") ?? "");
  const wajibResep = formData.get("wajib_resep") === "on";

  if (!kode || !namaDagang || !golonganObat) {
    return { error: "Kode, nama dagang, dan golongan obat wajib diisi." };
  }

  const bisaTambah = punyaIzin(sesi!, "produk.tambah") || punyaIzin(sesi!, "produk.ajukan") || sesi!.isOwner;
  if (!bisaTambah) {
    return { error: "Anda tidak punya izin menambah produk." };
  }

  const statusPersetujuan = statusPersetujuanUntuk(sesi!, golonganObat, "produk.tambah");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produk")
    .insert({
      kode,
      nama_dagang: namaDagang,
      zat_aktif: zatAktif,
      kategori,
      golongan_obat: golonganObat,
      wajib_resep: wajibResep,
      status_persetujuan: statusPersetujuan,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/produk");
  redirect(`/produk/${data.id}`);
}

export async function ubahProduk(produkId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");

  const namaDagang = String(formData.get("nama_dagang") ?? "").trim();
  const zatAktif = String(formData.get("zat_aktif") ?? "").trim() || null;
  const kategori = String(formData.get("kategori") ?? "").trim() || null;
  const golonganObat = String(formData.get("golongan_obat") ?? "");
  const wajibResep = formData.get("wajib_resep") === "on";

  if (!namaDagang || !golonganObat) {
    return { error: "Nama dagang dan golongan obat wajib diisi." };
  }

  const statusPersetujuan = statusPersetujuanUntuk(sesi!, golonganObat, "produk.ubah");

  const supabase = await createClient();
  const { error } = await supabase
    .from("produk")
    .update({
      nama_dagang: namaDagang,
      zat_aktif: zatAktif,
      kategori,
      golongan_obat: golonganObat,
      wajib_resep: wajibResep,
      status_persetujuan: statusPersetujuan,
    })
    .eq("id", produkId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/produk/${produkId}`);
  revalidatePath("/produk");
  return { error: undefined };
}

export async function nonaktifkanProduk(produkId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("produk").update({ status_aktif: false }).eq("id", produkId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/produk/${produkId}`);
  revalidatePath("/produk");
  return { error: undefined };
}

export async function tambahSatuan(produkId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const namaSatuan = String(formData.get("nama_satuan") ?? "").trim();
  const faktorKonversi = Number(formData.get("faktor_konversi") ?? 0);
  const adalahDasar = formData.get("adalah_satuan_dasar") === "on";

  if (!namaSatuan || faktorKonversi <= 0) {
    return { error: "Nama satuan wajib diisi dan faktor konversi harus lebih dari 0." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("satuan_produk").insert({
    produk_id: produkId,
    nama_satuan: namaSatuan,
    faktor_konversi: faktorKonversi,
    adalah_satuan_dasar: adalahDasar,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/produk/${produkId}`);
  return { error: undefined };
}

export async function tambahBarcode(produkId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const barcode = String(formData.get("barcode") ?? "").trim();
  if (!barcode) return { error: "Barcode wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.from("barcode_produk").insert({ produk_id: produkId, barcode });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/produk/${produkId}`);
  return { error: undefined };
}

export async function tambahHarga(produkId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");

  const outletId = String(formData.get("outlet_id") ?? "");
  const satuanProdukId = String(formData.get("satuan_produk_id") ?? "");
  const harga = Number(formData.get("harga") ?? -1);
  const berlakuMulai = String(formData.get("berlaku_mulai") ?? "");

  if (!outletId || !satuanProdukId || harga < 0 || !berlakuMulai) {
    return { error: "Outlet, satuan, harga, dan tanggal berlaku wajib diisi." };
  }

  const bolehUbahHarga = sesi!.isOwner || punyaIzin(sesi!, "harga.ubah") || punyaIzin(sesi!, "harga.ajukan");
  if (!bolehUbahHarga) {
    return { error: "Anda tidak punya izin mengubah harga jual." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("harga_produk").insert({
    produk_id: produkId,
    outlet_id: outletId,
    satuan_produk_id: satuanProdukId,
    harga,
    berlaku_mulai: berlakuMulai,
    dibuat_oleh: sesi!.penggunaId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/produk/${produkId}`);
  return { error: undefined };
}
