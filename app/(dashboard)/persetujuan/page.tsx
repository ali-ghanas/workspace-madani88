import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna, punyaIzin } from "@/lib/auth/session";
import SetujuiTolakButtons from "./SetujuiTolakButtons";
import { setujuiProduk, tolakProduk, setujuiHarga, tolakHarga } from "./actions";

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
  const [{ data: produkPending, error: produkError }, { data: hargaPending, error: hargaError }] = await Promise.all([
    supabase
      .from("produk")
      .select("id, kode, nama_dagang, golongan_obat, updated_at")
      .eq("status_persetujuan", "pending")
      .order("updated_at", { ascending: true }),
    sesi.isOwner
      ? supabase
          .from("harga_produk")
          .select(
            "id, produk_id, harga, berlaku_mulai, produk:produk_id(kode, nama_dagang), outlet:outlet_id(kode), satuan:satuan_produk_id(nama_satuan)"
          )
          .eq("status_persetujuan", "pending")
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: null, error: null }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Persetujuan</h1>
          <p className="text-sm text-muted-foreground">
            Perubahan produk yang diajukan peran non-owner, menunggu disetujui.
          </p>
        </div>

        {produkError && <p className="text-sm text-destructive">Gagal memuat antrean: {produkError.message}</p>}

        <div className="space-y-2">
          {(produkPending ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <Link href={`/produk/${p.id}`} className="text-sm font-medium hover:underline">
                  {p.nama_dagang} <span className="text-muted-foreground">({p.kode})</span>
                </Link>
                <div className="text-xs text-muted-foreground">{GOLONGAN_LABEL[p.golongan_obat] ?? p.golongan_obat}</div>
              </div>
              <SetujuiTolakButtons
                id={p.id}
                setujui={setujuiProduk}
                tolak={sesi.isOwner ? tolakProduk : undefined}
                tolakConfirmText="Tolak pengajuan ini? Data akan dikembalikan ke nilai sebelumnya."
              />
            </div>
          ))}

          {(produkPending ?? []).length === 0 && !produkError && (
            <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Tidak ada pengajuan produk yang menunggu.
            </p>
          )}
        </div>
      </div>

      {sesi.isOwner && (
        <div>
          <div className="mb-4">
            <h1 className="text-xl font-semibold">Persetujuan Harga</h1>
            <p className="text-sm text-muted-foreground">Usulan harga jual dari APJ, menunggu disetujui.</p>
          </div>

          {hargaError && <p className="text-sm text-destructive">Gagal memuat antrean: {hargaError.message}</p>}

          <div className="space-y-2">
            {(hargaPending ?? []).map((h) => {
              const produk = h.produk as unknown as { kode: string; nama_dagang: string } | null;
              const outlet = h.outlet as unknown as { kode: string } | null;
              const satuan = h.satuan as unknown as { nama_satuan: string } | null;
              return (
                <div key={h.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                  <div>
                    <Link href={`/produk/${h.produk_id}`} className="text-sm font-medium hover:underline">
                      {produk?.nama_dagang} <span className="text-muted-foreground">({produk?.kode})</span>
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {outlet?.kode} · {satuan?.nama_satuan} · Rp {Number(h.harga).toLocaleString("id-ID")} · berlaku{" "}
                      {h.berlaku_mulai}
                    </div>
                  </div>
                  <SetujuiTolakButtons
                    id={h.id}
                    setujui={setujuiHarga}
                    tolak={tolakHarga}
                    tolakConfirmText="Tolak usulan harga ini?"
                  />
                </div>
              );
            })}

            {(hargaPending ?? []).length === 0 && !hargaError && (
              <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Tidak ada usulan harga yang menunggu.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
