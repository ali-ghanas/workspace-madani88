"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna } from "@/lib/auth/session";

export type ActionState = { error?: string } | null;

export async function buatPelanggan(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");

  const nama = String(formData.get("nama") ?? "").trim();
  const noHp = String(formData.get("no_hp") ?? "").trim() || null;
  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim() || null;
  const persetujuanData = formData.get("persetujuan_data") === "on";

  if (!nama) return { error: "Nama wajib diisi." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pelanggan")
    .insert({ nama, no_hp: noHp, tanggal_lahir: tanggalLahir, persetujuan_data: persetujuanData })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/pelanggan");
  redirect(`/pelanggan/${data.id}`);
}

export async function ubahPelanggan(pelangganId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");

  const nama = String(formData.get("nama") ?? "").trim();
  const noHp = String(formData.get("no_hp") ?? "").trim() || null;
  const tanggalLahir = String(formData.get("tanggal_lahir") ?? "").trim() || null;
  const persetujuanData = formData.get("persetujuan_data") === "on";

  if (!nama) return { error: "Nama wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("pelanggan")
    .update({ nama, no_hp: noHp, tanggal_lahir: tanggalLahir, persetujuan_data: persetujuanData })
    .eq("id", pelangganId);

  if (error) return { error: error.message };

  revalidatePath(`/pelanggan/${pelangganId}`);
  revalidatePath("/pelanggan");
  return { error: undefined };
}

export async function nonaktifkanPelanggan(pelangganId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pelanggan").update({ status_aktif: false }).eq("id", pelangganId);

  if (error) return { error: error.message };

  revalidatePath(`/pelanggan/${pelangganId}`);
  revalidatePath("/pelanggan");
  return { error: undefined };
}
