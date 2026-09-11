import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna } from "@/lib/auth/session";
import NonaktifkanButton from "../../NonaktifkanButton";
import { nonaktifkanPengguna, nonaktifkanPenugasan } from "../actions";
import PenugasanForm from "../PenugasanForm";

export default async function PenggunaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesi = await getSesiPengguna();

  if (!sesi?.isOwner) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Kelola pengguna &amp; peran hanya untuk Owner.
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: pengguna }, { data: penugasanList }, { data: outletList }, { data: peranList }] = await Promise.all([
    supabase.from("pengguna").select("*").eq("id", id).single(),
    supabase
      .from("penugasan")
      .select("id, status_aktif, outlet:outlet_id(kode, nama), peran:peran_id(kode, nama)")
      .eq("pengguna_id", id)
      .order("status_aktif", { ascending: false }),
    supabase.from("outlet").select("id, kode, nama").eq("status_aktif", true).order("kode"),
    supabase.from("peran").select("id, kode, nama").order("nama"),
  ]);

  if (!pengguna) notFound();

  const outletOptions = (outletList ?? []).map((o) => ({ id: o.id, label: `${o.kode} — ${o.nama}` }));
  const peranOptions = (peranList ?? []).map((p) => ({ id: p.id, label: p.nama }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{pengguna.nama}</h1>
        <p className="text-sm text-muted-foreground">{pengguna.email}</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Penugasan (outlet × peran)</h2>
        <ul className="mb-1 space-y-1.5 text-sm">
          {(penugasanList ?? []).map((pen) => {
            const outlet = pen.outlet as unknown as { kode: string; nama: string } | null;
            const peran = pen.peran as unknown as { kode: string; nama: string } | null;
            return (
              <li key={pen.id} className="flex items-center justify-between gap-3">
                <span className={pen.status_aktif ? "" : "text-muted-foreground line-through"}>
                  {peran?.nama} — {outlet?.kode} ({outlet?.nama})
                </span>
                <NonaktifkanButton
                  id={pen.id}
                  statusAktif={pen.status_aktif}
                  action={nonaktifkanPenugasan}
                  confirmText="Nonaktifkan penugasan ini?"
                  label="Cabut"
                />
              </li>
            );
          })}
          {(penugasanList ?? []).length === 0 && <li className="text-muted-foreground">Belum ada penugasan.</li>}
        </ul>
        <PenugasanForm penggunaId={id} outletOptions={outletOptions} peranOptions={peranOptions} />
      </section>

      <section>
        <NonaktifkanButton
          id={id}
          statusAktif={pengguna.status_aktif}
          action={nonaktifkanPengguna}
          confirmText="Nonaktifkan pengguna ini? Mereka tidak akan bisa login lagi."
          label="Nonaktifkan pengguna"
        />
      </section>
    </div>
  );
}
