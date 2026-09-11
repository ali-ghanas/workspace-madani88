import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna } from "@/lib/auth/session";

export default async function PenggunaListPage() {
  const sesi = await getSesiPengguna();

  if (!sesi?.isOwner) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Kelola pengguna &amp; peran hanya untuk Owner.
      </div>
    );
  }

  const supabase = await createClient();
  const { data: penggunaList, error } = await supabase
    .from("pengguna")
    .select(
      "id, nama, email, status_aktif, penugasan(status_aktif, outlet:outlet_id(kode), peran:peran_id(kode))"
    )
    .order("nama");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pengguna</h1>
        <Link
          href="/pengguna/undang"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Undang pengguna
        </Link>
      </div>

      {error && <p className="text-sm text-destructive">Gagal memuat pengguna: {error.message}</p>}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Penugasan</th>
            </tr>
          </thead>
          <tbody>
            {(penggunaList ?? []).map((p) => {
              const penugasanAktif = (
                p.penugasan as unknown as {
                  status_aktif: boolean;
                  outlet: { kode: string } | null;
                  peran: { kode: string } | null;
                }[]
              ).filter((pen) => pen.status_aktif);

              return (
                <tr key={p.id} className="border-t border-border hover:bg-accent/40">
                  <td className="px-4 py-2">
                    <Link href={`/pengguna/${p.id}`} className="font-medium text-foreground hover:underline">
                      {p.nama}
                    </Link>
                    {!p.status_aktif && (
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{p.email}</td>
                  <td className="px-4 py-2">
                    {penugasanAktif.length === 0 ? (
                      <span className="text-muted-foreground">belum ditugaskan</span>
                    ) : (
                      penugasanAktif
                        .map((pen) => `${pen.peran?.kode}@${pen.outlet?.kode}`)
                        .join(", ")
                    )}
                  </td>
                </tr>
              );
            })}
            {(penggunaList ?? []).length === 0 && !error && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                  Belum ada pengguna.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
