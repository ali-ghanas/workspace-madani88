import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { statusKedaluwarsa } from "@/lib/dokumen-kedaluwarsa";

export default async function PegawaiListPage() {
  const supabase = await createClient();

  const { data: pegawaiList, error } = await supabase
    .from("pegawai")
    .select(
      "id, nama, jabatan, status_aktif, outlet:outlet_utama_id(kode), dokumen_pegawai(tanggal_kedaluwarsa, status_aktif)"
    )
    .order("nama");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pegawai</h1>
        <Link
          href="/pegawai/baru"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Tambah pegawai
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">Gagal memuat pegawai: {error.message}</p>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">Jabatan</th>
              <th className="px-4 py-2 font-medium">Outlet</th>
              <th className="px-4 py-2 font-medium">Dokumen</th>
            </tr>
          </thead>
          <tbody>
            {(pegawaiList ?? []).map((p) => {
              const outlet = p.outlet as unknown as { kode: string } | null;
              const dokumenAktif = (p.dokumen_pegawai as { tanggal_kedaluwarsa: string | null; status_aktif: boolean }[]).filter(
                (d) => d.status_aktif
              );
              const adaKedaluwarsa = dokumenAktif.some((d) => statusKedaluwarsa(d.tanggal_kedaluwarsa) === "kedaluwarsa");
              const adaSegera = dokumenAktif.some((d) => statusKedaluwarsa(d.tanggal_kedaluwarsa) === "segera");

              return (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/pegawai/${p.id}`} className="font-medium text-gray-900 hover:underline">
                      {p.nama}
                    </Link>
                    {!p.status_aktif && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                        nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">{p.jabatan ?? "-"}</td>
                  <td className="px-4 py-2">{outlet?.kode ?? "-"}</td>
                  <td className="px-4 py-2">
                    {adaKedaluwarsa && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                        ada dokumen kedaluwarsa
                      </span>
                    )}
                    {!adaKedaluwarsa && adaSegera && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                        segera kedaluwarsa
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {(pegawaiList ?? []).length === 0 && !error && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Belum ada pegawai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
