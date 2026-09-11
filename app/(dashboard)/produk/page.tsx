import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

export default async function ProdukListPage() {
  const supabase = await createClient();

  const { data: produkList, error } = await supabase
    .from("produk")
    .select("id, kode, nama_dagang, golongan_obat, wajib_resep, status_persetujuan, status_aktif")
    .order("nama_dagang");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Produk</h1>
        <Link
          href="/produk/baru"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Tambah produk
        </Link>
      </div>

      {error && <p className="text-sm text-destructive">Gagal memuat produk: {error.message}</p>}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Kode</th>
              <th className="px-4 py-2 font-medium">Nama dagang</th>
              <th className="px-4 py-2 font-medium">Golongan</th>
              <th className="px-4 py-2 font-medium">Resep</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(produkList ?? []).map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-accent/40">
                <td className="px-4 py-2">
                  <Link href={`/produk/${p.id}`} className="font-medium text-foreground hover:underline">
                    {p.kode}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {p.nama_dagang}
                  {!p.status_aktif && (
                    <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      nonaktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{GOLONGAN_LABEL[p.golongan_obat] ?? p.golongan_obat}</td>
                <td className="px-4 py-2">{p.wajib_resep ? "Ya" : "Tidak"}</td>
                <td className="px-4 py-2">
                  {p.status_persetujuan === "pending" ? (
                    <span className="rounded-md bg-warning/10 px-1.5 py-0.5 text-xs font-medium text-warning">
                      menunggu persetujuan
                    </span>
                  ) : (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      disetujui
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {(produkList ?? []).length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Belum ada produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
