import { createClient } from "@/lib/supabase/server";
import TutupShiftForm from "../TutupShiftForm";

export default async function TutupShiftPage({
  searchParams,
}: {
  searchParams: Promise<{ sukses?: string }>;
}) {
  const { sukses } = await searchParams;
  const supabase = await createClient();
  const { data: outletList } = await supabase
    .from("outlet")
    .select("id, kode, nama")
    .eq("status_aktif", true)
    .order("kode");

  const outletOptions = (outletList ?? []).map((o) => ({ id: o.id, label: `${o.kode} — ${o.nama}` }));

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Tutup Shift Kasir</h1>
      {sukses && (
        <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          Tersimpan. Isi lagi untuk shift/outlet lain.
        </p>
      )}
      <TutupShiftForm outletOptions={outletOptions} />
    </div>
  );
}
