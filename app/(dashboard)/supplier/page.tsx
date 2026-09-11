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
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Tambah supplier
        </Link>
      </div>

      {error && <p className="text-sm text-destructive">Gagal memuat supplier: {error.message}</p>}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nama PBF</th>
              <th className="px-4 py-2 font-medium">Kontak</th>
              <th className="px-4 py-2 font-medium">Termin pembayaran</th>
            </tr>
          </thead>
          <tbody>
            {(supplierList ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-accent/40">
                <td className="px-4 py-2">
                  <Link href={`/supplier/${s.id}`} className="font-medium text-foreground hover:underline">
                    {s.nama_pbf}
                  </Link>
                  {!s.status_aktif && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
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
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
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
