import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna } from "@/lib/auth/session";
import { statusKedaluwarsa } from "@/lib/dokumen-kedaluwarsa";
import PegawaiForm from "../PegawaiForm";
import { ubahPegawai, nonaktifkanPegawai } from "../actions";
import NonaktifkanButton from "../../NonaktifkanButton";
import DokumenForm from "./DokumenForm";
import TautkanPenggunaForm from "./TautkanPenggunaForm";

const JENIS_LABEL: Record<string, string> = {
  ktp: "KTP",
  str: "STR",
  sipa: "SIPA",
  siptt: "SIPTTK",
  kontrak: "Kontrak",
  lainnya: "Lainnya",
};

const BADGE_KEDALUWARSA: Record<string, string> = {
  kedaluwarsa: "bg-destructive/10 text-destructive",
  segera: "bg-warning/10 text-warning",
  aman: "bg-primary/10 text-primary",
};

export default async function PegawaiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesi = await getSesiPengguna();
  const supabase = await createClient();

  const [{ data: pegawai }, { data: dokumenList }, { data: outletList }, { data: penggunaList }] = await Promise.all([
    supabase.from("pegawai").select("*").eq("id", id).single(),
    supabase
      .from("dokumen_pegawai")
      .select("id, jenis, nomor, tanggal_kedaluwarsa")
      .eq("pegawai_id", id)
      .eq("status_aktif", true)
      .order("tanggal_kedaluwarsa"),
    supabase.from("outlet").select("id, kode, nama").eq("status_aktif", true).order("kode"),
    sesi?.isOwner
      ? supabase.from("pengguna").select("id, nama, email").eq("status_aktif", true).order("nama")
      : Promise.resolve({ data: null }),
  ]);

  if (!pegawai) notFound();

  const outletOptions = (outletList ?? []).map((o) => ({ id: o.id, label: `${o.kode} — ${o.nama}` }));
  const penggunaOptions = (penggunaList ?? []).map((p) => ({ id: p.id, label: `${p.nama} (${p.email})` }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{pegawai.nama}</h1>

      <section className="max-w-lg">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Data pegawai</h2>
        <PegawaiForm
          action={ubahPegawai.bind(null, id)}
          pegawai={pegawai}
          outletOptions={outletOptions}
          submitLabel="Simpan perubahan"
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Dokumen (KTP, STR, SIPA, SIPTTK, kontrak)</h2>
        <ul className="mb-1 space-y-1 text-sm text-muted-foreground">
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
          {(dokumenList ?? []).length === 0 && <li className="text-muted-foreground">Belum ada dokumen.</li>}
        </ul>
        <DokumenForm pegawaiId={id} />
      </section>

      {sesi?.isOwner && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Akun login</h2>
          <p className="mb-2 text-xs text-muted-foreground">
            Tautkan pegawai ini ke akun pengguna supaya bisa login. Belum ada akunnya?{" "}
            <Link href="/pengguna/undang" className="text-primary hover:underline">
              Undang pengguna baru
            </Link>{" "}
            dulu.
          </p>
          <TautkanPenggunaForm
            pegawaiId={id}
            penggunaOptions={penggunaOptions}
            penggunaIdSaatIni={pegawai.pengguna_id}
          />
        </section>
      )}

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
