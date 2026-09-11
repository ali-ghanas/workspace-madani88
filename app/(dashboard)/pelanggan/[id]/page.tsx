import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PelangganForm from "../PelangganForm";
import { ubahPelanggan, nonaktifkanPelanggan } from "../actions";
import NonaktifkanButton from "../../NonaktifkanButton";

export default async function PelangganDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pelanggan } = await supabase.from("pelanggan").select("*").eq("id", id).single();

  if (!pelanggan) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{pelanggan.nama}</h1>

      <section className="max-w-lg">
        <PelangganForm action={ubahPelanggan.bind(null, id)} pelanggan={pelanggan} submitLabel="Simpan perubahan" />
      </section>

      <section>
        <NonaktifkanButton
          id={id}
          statusAktif={pelanggan.status_aktif}
          action={nonaktifkanPelanggan}
          confirmText="Nonaktifkan pelanggan ini?"
          label="Nonaktifkan pelanggan"
        />
      </section>
    </div>
  );
}
