import { createClient } from "@/lib/supabase/server";
import PegawaiForm from "../PegawaiForm";
import { buatPegawai } from "../actions";

export default async function PegawaiBaruPage() {
  const supabase = await createClient();
  const { data: outletList } = await supabase.from("outlet").select("id, kode, nama").eq("status_aktif", true).order("kode");
  const outletOptions = (outletList ?? []).map((o) => ({ id: o.id, label: `${o.kode} — ${o.nama}` }));

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">Tambah pegawai</h1>
      <PegawaiForm action={buatPegawai} outletOptions={outletOptions} submitLabel="Simpan pegawai" />
    </div>
  );
}
