"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna, punyaIzin } from "@/lib/auth/session";

export type ActionState = { error?: string } | null;

function cekIzinKelola(sesi: NonNullable<Awaited<ReturnType<typeof getSesiPengguna>>>): boolean {
  return sesi.isOwner || punyaIzin(sesi, "supplier.kelola");
}

export async function buatSupplier(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!cekIzinKelola(sesi)) return { error: "Anda tidak punya izin mengelola supplier." };

  const namaPbf = String(formData.get("nama_pbf") ?? "").trim();
  const npwp = String(formData.get("npwp") ?? "").trim() || null;
  const kontak = String(formData.get("kontak") ?? "").trim() || null;
  const terminPembayaran = String(formData.get("termin_pembayaran") ?? "").trim() || null;

  if (!namaPbf) return { error: "Nama PBF wajib diisi." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier")
    .insert({ nama_pbf: namaPbf, npwp, kontak, termin_pembayaran: terminPembayaran })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/supplier");
  redirect(`/supplier/${data.id}`);
}

export async function ubahSupplier(supplierId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!cekIzinKelola(sesi)) return { error: "Anda tidak punya izin mengelola supplier." };

  const namaPbf = String(formData.get("nama_pbf") ?? "").trim();
  const npwp = String(formData.get("npwp") ?? "").trim() || null;
  const kontak = String(formData.get("kontak") ?? "").trim() || null;
  const terminPembayaran = String(formData.get("termin_pembayaran") ?? "").trim() || null;

  if (!namaPbf) return { error: "Nama PBF wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("supplier")
    .update({ nama_pbf: namaPbf, npwp, kontak, termin_pembayaran: terminPembayaran })
    .eq("id", supplierId);

  if (error) return { error: error.message };

  revalidatePath(`/supplier/${supplierId}`);
  revalidatePath("/supplier");
  return { error: undefined };
}

export async function nonaktifkanSupplier(supplierId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("supplier").update({ status_aktif: false }).eq("id", supplierId);

  if (error) return { error: error.message };

  revalidatePath(`/supplier/${supplierId}`);
  revalidatePath("/supplier");
  return { error: undefined };
}
