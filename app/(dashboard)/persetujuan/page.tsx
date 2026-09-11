import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna, punyaIzin } from "@/lib/auth/session";
import SetujuiTolakButtons from "./SetujuiTolakButtons";

const GOLONGAN_LABEL: Record<string, string> = {
  bebas: "Bebas",
  bebas_terbatas: "Bebas Terbatas",
  keras: "Keras",
  psikotropika: "Psikotropika",
  narkotika: "Narkotika",
  prekursor: "Prekursor",
  alkes: "Alkes",
  non_obat: "Non-Obat",
};

export default async function PersetujuanPage() {
  const sesi = await getSesiPengguna();

  if (!sesi || (!sesi.isOwner && !punyaIzin(sesi, "persetujuan.setujui"))) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Halaman ini hanya untuk Owner/APJ.
      </div>
    );
  }

  const supabase = await createClient();
  const { data: produkPending, error } = await supabase
    .from("produk")
    .select("id, kode, nama_dagang, golongan_obat, updated_at")
    .eq("status_persetujuan", "pending")
    .order("updated_at", { ascending: true });

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Persetujuan</h1>
        <p className="text-sm text-muted-foreground">
          Perubahan produk yang diajukan peran non-owner, menunggu disetujui.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">Gagal memuat antrean: {error.message}</p>}

      <div className="space-y-2">
        {(produkPending ?? []).map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <Link href={`/produk/${p.id}`} className="text-sm font-medium hover:underline">
                {p.nama_dagang} <span className="text-muted-foreground">({p.kode})</span>
              </Link>
              <div className="text-xs text-muted-foreground">{GOLONGAN_LABEL[p.golongan_obat] ?? p.golongan_obat}</div>
            </div>
            <SetujuiTolakButtons produkId={p.id} bisaTolak={sesi.isOwner} />
          </div>
        ))}

        {(produkPending ?? []).length === 0 && !error && (
          <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Tidak ada pengajuan yang menunggu.
          </p>
        )}
      </div>
    </div>
  );
}
