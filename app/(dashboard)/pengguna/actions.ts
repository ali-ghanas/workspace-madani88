"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSesiPengguna } from "@/lib/auth/session";

export type ActionState = { error?: string } | null;

export async function undangPengguna(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!sesi.isOwner) return { error: "Hanya Owner yang bisa mengundang pengguna baru." };

  const email = String(formData.get("email") ?? "").trim();
  const nama = String(formData.get("nama") ?? "").trim();

  if (!email || !nama) return { error: "Email dan nama wajib diisi." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { nama } });

  if (error) return { error: error.message };

  revalidatePath("/pengguna");
  redirect(`/pengguna/${data.user.id}`);
}

export async function nonaktifkanPengguna(penggunaId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pengguna").update({ status_aktif: false }).eq("id", penggunaId);

  if (error) return { error: error.message };

  revalidatePath("/pengguna");
  revalidatePath(`/pengguna/${penggunaId}`);
  return { error: undefined };
}

export async function tambahPenugasan(
  penggunaId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!sesi.isOwner) return { error: "Hanya Owner yang bisa mengatur penugasan." };

  const outletId = String(formData.get("outlet_id") ?? "");
  const peranId = String(formData.get("peran_id") ?? "");

  if (!outletId || !peranId) return { error: "Outlet dan peran wajib dipilih." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("penugasan")
    .insert({ pengguna_id: penggunaId, outlet_id: outletId, peran_id: peranId });

  if (error) return { error: error.message };

  revalidatePath(`/pengguna/${penggunaId}`);
  return { error: undefined };
}

export async function nonaktifkanPenugasan(penugasanId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("penugasan").update({ status_aktif: false }).eq("id", penugasanId);

  if (error) return { error: error.message };

  revalidatePath("/pengguna");
  return { error: undefined };
}
