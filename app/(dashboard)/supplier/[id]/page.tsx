import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SupplierForm from "../SupplierForm";
import { ubahSupplier, nonaktifkanSupplier } from "../actions";
import NonaktifkanButton from "../../NonaktifkanButton";

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: supplier } = await supabase.from("supplier").select("*").eq("id", id).single();

  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{supplier.nama_pbf}</h1>

      <section className="max-w-lg">
        <SupplierForm action={ubahSupplier.bind(null, id)} supplier={supplier} submitLabel="Simpan perubahan" />
      </section>

      <section>
        <NonaktifkanButton
          id={id}
          statusAktif={supplier.status_aktif}
          action={nonaktifkanSupplier}
          confirmText="Nonaktifkan supplier ini?"
          label="Nonaktifkan supplier"
        />
      </section>
    </div>
  );
}
