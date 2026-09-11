"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna, punyaIzin } from "@/lib/auth/session";

export type ActionState = { error?: string } | null;

function cekIzinKelola(sesi: NonNullable<Awaited<ReturnType<typeof getSesiPengguna>>>): boolean {
  return sesi.isOwner || punyaIzin(sesi, "pegawai.kelola");
}

export async function buatPegawai(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!cekIzinKelola(sesi)) return { error: "Anda tidak punya izin mengelola data pegawai." };

  const nama = String(formData.get("nama") ?? "").trim();
  const nikInternal = String(formData.get("nik_internal") ?? "").trim() || null;
  const jabatan = String(formData.get("jabatan") ?? "").trim() || null;
  const outletUtamaId = String(formData.get("outlet_utama_id") ?? "");
  const tanggalMasuk = String(formData.get("tanggal_masuk") ?? "").trim() || null;

  if (!nama || !outletUtamaId) return { error: "Nama dan outlet utama wajib diisi." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pegawai")
    .insert({ nama, nik_internal: nikInternal, jabatan, outlet_utama_id: outletUtamaId, tanggal_masuk: tanggalMasuk })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/pegawai");
  redirect(`/pegawai/${data.id}`);
}

export async function ubahPegawai(pegawaiId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!cekIzinKelola(sesi)) return { error: "Anda tidak punya izin mengelola data pegawai." };

  const nama = String(formData.get("nama") ?? "").trim();
  const nikInternal = String(formData.get("nik_internal") ?? "").trim() || null;
  const jabatan = String(formData.get("jabatan") ?? "").trim() || null;
  const outletUtamaId = String(formData.get("outlet_utama_id") ?? "");
  const tanggalMasuk = String(formData.get("tanggal_masuk") ?? "").trim() || null;

  if (!nama || !outletUtamaId) return { error: "Nama dan outlet utama wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("pegawai")
    .update({ nama, nik_internal: nikInternal, jabatan, outlet_utama_id: outletUtamaId, tanggal_masuk: tanggalMasuk })
    .eq("id", pegawaiId);

  if (error) return { error: error.message };

  revalidatePath(`/pegawai/${pegawaiId}`);
  revalidatePath("/pegawai");
  return { error: undefined };
}

export async function nonaktifkanPegawai(pegawaiId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pegawai").update({ status_aktif: false }).eq("id", pegawaiId);

  if (error) return { error: error.message };

  revalidatePath(`/pegawai/${pegawaiId}`);
  revalidatePath("/pegawai");
  return { error: undefined };
}

// Menautkan pegawai ke akun login (pengguna) — hanya Owner, karena membaca
// daftar pengguna butuh fn_is_owner() (lihat RLS pengguna_select di 0008_rls.sql).
export async function tautkanPengguna(
  pegawaiId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!sesi.isOwner) return { error: "Hanya Owner yang bisa menautkan akun login." };

  const penggunaId = String(formData.get("pengguna_id") ?? "") || null;

  const supabase = await createClient();
  const { error } = await supabase.from("pegawai").update({ pengguna_id: penggunaId }).eq("id", pegawaiId);

  if (error) return { error: error.message };

  revalidatePath(`/pegawai/${pegawaiId}`);
  return { error: undefined };
}

export async function tambahDokumen(pegawaiId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!cekIzinKelola(sesi)) return { error: "Anda tidak punya izin mengelola data pegawai." };

  const jenis = String(formData.get("jenis") ?? "");
  const nomor = String(formData.get("nomor") ?? "").trim() || null;
  const tanggalKedaluwarsa = String(formData.get("tanggal_kedaluwarsa") ?? "").trim() || null;

  if (!jenis) return { error: "Jenis dokumen wajib dipilih." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("dokumen_pegawai")
    .insert({ pegawai_id: pegawaiId, jenis, nomor, tanggal_kedaluwarsa: tanggalKedaluwarsa });

  if (error) return { error: error.message };

  revalidatePath(`/pegawai/${pegawaiId}`);
  return { error: undefined };
}
