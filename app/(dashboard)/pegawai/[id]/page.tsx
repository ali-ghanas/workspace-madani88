import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { statusKedaluwarsa } from "@/lib/dokumen-kedaluwarsa";
import PegawaiForm from "../PegawaiForm";
import { ubahPegawai, nonaktifkanPegawai } from "../actions";
import NonaktifkanButton from "../../NonaktifkanButton";
import DokumenForm from "./DokumenForm";

const JENIS_LABEL: Record<string, string> = {
  ktp: "KTP",
  str: "STR",
  sipa: "SIPA",
  siptt: "SIPTTK",
  kontrak: "Kontrak",
  lainnya: "Lainnya",
};

const BADGE_KEDALUWARSA: Record<string, string> = {
  kedaluwarsa: "bg-red-100 text-red-700",
  segera: "bg-amber-100 text-amber-700",
  aman: "bg-green-100 text-green-700",
};

export default async function PegawaiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pegawai }, { data: dokumenList }, { data: outletList }] = await Promise.all([
    supabase.from("pegawai").select("*").eq("id", id).single(),
    supabase
      .from("dokumen_pegawai")
      .select("id, jenis, nomor, tanggal_kedaluwarsa")
      .eq("pegawai_id", id)
      .eq("status_aktif", true)
      .order("tanggal_kedaluwarsa"),
    supabase.from("outlet").select("id, kode, nama").eq("status_aktif", true).order("kode"),
  ]);

  if (!pegawai) notFound();

  const outletOptions = (outletList ?? []).map((o) => ({ id: o.id, label: `${o.kode} — ${o.nama}` }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{pegawai.nama}</h1>

      <section className="max-w-lg">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Data pegawai</h2>
        <PegawaiForm
          action={ubahPegawai.bind(null, id)}
          pegawai={pegawai}
          outletOptions={outletOptions}
          submitLabel="Simpan perubahan"
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Dokumen (KTP, STR, SIPA, SIPTTK, kontrak)</h2>
        <ul className="mb-1 space-y-1 text-sm text-gray-700">
          {(dokumenList ?? []).map((d) => {
            const status = statusKedaluwarsa(d.tanggal_kedaluwarsa);
            return (
              <li key={d.id} className="flex items-center gap-2">
                <span>
                  {JENIS_LABEL[d.jenis] ?? d.jenis}
                  {d.nomor ? ` — ${d.nomor}` : ""}
                  {d.tanggal_kedaluwarsa ? ` (kedaluwarsa ${d.tanggal_kedaluwarsa})` : ""}
                </span>
                {status && (
                  <span className={`rounded px-1.5 py-0.5 text-xs ${BADGE_KEDALUWARSA[status]}`}>
                    {status === "kedaluwarsa" ? "kedaluwarsa" : status === "segera" ? "segera kedaluwarsa" : "aman"}
                  </span>
                )}
              </li>
            );
          })}
          {(dokumenList ?? []).length === 0 && <li className="text-gray-400">Belum ada dokumen.</li>}
        </ul>
        <DokumenForm pegawaiId={id} />
      </section>

      <section>
        <NonaktifkanButton
          id={id}
          statusAktif={pegawai.status_aktif}
          action={nonaktifkanPegawai}
          confirmText="Nonaktifkan pegawai ini?"
          label="Nonaktifkan pegawai"
        />
      </section>
    </div>
  );
}
