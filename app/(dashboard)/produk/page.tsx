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
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Tambah produk
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">Gagal memuat produk: {error.message}</p>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
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
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2">
                  <Link href={`/produk/${p.id}`} className="font-medium text-gray-900 hover:underline">
                    {p.kode}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {p.nama_dagang}
                  {!p.status_aktif && (
                    <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      nonaktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{GOLONGAN_LABEL[p.golongan_obat] ?? p.golongan_obat}</td>
                <td className="px-4 py-2">{p.wajib_resep ? "Ya" : "Tidak"}</td>
                <td className="px-4 py-2">
                  {p.status_persetujuan === "pending" ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                      menunggu persetujuan
                    </span>
                  ) : (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                      disetujui
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {(produkList ?? []).length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
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
