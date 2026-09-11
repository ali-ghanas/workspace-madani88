import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SupplierListPage() {
  const supabase = await createClient();

  const { data: supplierList, error } = await supabase
    .from("supplier")
    .select("id, nama_pbf, kontak, termin_pembayaran, status_aktif")
    .order("nama_pbf");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Supplier</h1>
        <Link
          href="/supplier/baru"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          + Tambah supplier
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">Gagal memuat supplier: {error.message}</p>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Nama PBF</th>
              <th className="px-4 py-2 font-medium">Kontak</th>
              <th className="px-4 py-2 font-medium">Termin pembayaran</th>
            </tr>
          </thead>
          <tbody>
            {(supplierList ?? []).map((s) => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2">
                  <Link href={`/supplier/${s.id}`} className="font-medium text-gray-900 hover:underline">
                    {s.nama_pbf}
                  </Link>
                  {!s.status_aktif && (
                    <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      nonaktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{s.kontak ?? "-"}</td>
                <td className="px-4 py-2">{s.termin_pembayaran ?? "-"}</td>
              </tr>
            ))}
            {(supplierList ?? []).length === 0 && !error && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  Belum ada supplier.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
