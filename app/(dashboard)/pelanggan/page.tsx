import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PelangganListPage() {
  const supabase = await createClient();

  const { data: pelangganList, error } = await supabase
    .from("pelanggan")
    .select("id, nama, no_hp, status_aktif")
    .order("nama");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pelanggan</h1>
        <Link
          href="/pelanggan/baru"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Tambah pelanggan
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">Gagal memuat pelanggan: {error.message}</p>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">No. HP</th>
            </tr>
          </thead>
          <tbody>
            {(pelangganList ?? []).map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2">
                  <Link href={`/pelanggan/${p.id}`} className="font-medium text-gray-900 hover:underline">
                    {p.nama}
                  </Link>
                  {!p.status_aktif && (
                    <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      nonaktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{p.no_hp ?? "-"}</td>
              </tr>
            ))}
            {(pelangganList ?? []).length === 0 && !error && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-gray-400">
                  Belum ada pelanggan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
