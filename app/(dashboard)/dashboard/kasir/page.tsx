import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna } from "@/lib/auth/session";
import { rentangBulan, formatRupiah } from "@/lib/tanggal-wib";
import BulanPicker from "../BulanPicker";

export default async function PerformaKasirPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const sesi = await getSesiPengguna();

  if (!sesi?.isOwner) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Performa Kasir hanya untuk Owner.
      </div>
    );
  }

  const { bulan: bulanParam } = await searchParams;
  const { awal, akhir, label } = rentangBulan(bulanParam);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_kasir")
    .select("kasir_nama, outlet:outlet_id(kode), total_penjualan, selisih")
    .gte("tanggal", awal)
    .lt("tanggal", akhir);

  type Row = { nama: string; outlet: string; jumlahShift: number; totalOmzet: number; totalSelisih: number };
  const perKasir = new Map<string, Row>();

  for (const r of (data ?? []) as unknown as {
    kasir_nama: string;
    outlet: { kode: string } | null;
    total_penjualan: number;
    selisih: number;
  }[]) {
    const key = r.kasir_nama;
    const cur = perKasir.get(key) ?? {
      nama: r.kasir_nama,
      outlet: r.outlet?.kode ?? "-",
      jumlahShift: 0,
      totalOmzet: 0,
      totalSelisih: 0,
    };
    cur.jumlahShift += 1;
    cur.totalOmzet += Number(r.total_penjualan);
    cur.totalSelisih += Number(r.selisih);
    perKasir.set(key, cur);
  }

  const baris = Array.from(perKasir.values()).sort((a, b) => b.jumlahShift - a.jumlahShift);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Performa Kasir</h1>
          <p className="text-sm text-muted-foreground">
            Periode {label}. Skor risiko fraud (CUSUM/Benford/dst) belum dibangun di pass ini —
            lihat docs/keputusan.md.
          </p>
        </div>
        <BulanPicker bulan={label} />
      </div>

      {error && <p className="text-sm text-destructive">Gagal memuat data: {error.message}</p>}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Kasir</th>
              <th className="px-4 py-2 font-medium">Outlet</th>
              <th className="px-4 py-2 font-medium">Jml Shift</th>
              <th className="px-4 py-2 font-medium">Total Omzet</th>
              <th className="px-4 py-2 font-medium">Total Selisih</th>
              <th className="px-4 py-2 font-medium">Rata² Selisih</th>
            </tr>
          </thead>
          <tbody>
            {baris.map((r) => {
              const rata = r.jumlahShift > 0 ? r.totalSelisih / r.jumlahShift : 0;
              return (
                <tr key={r.nama} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{r.nama}</td>
                  <td className="px-4 py-2">{r.outlet}</td>
                  <td className="px-4 py-2 tabular-nums">{r.jumlahShift}</td>
                  <td className="px-4 py-2 tabular-nums">{formatRupiah(r.totalOmzet)}</td>
                  <td className={`px-4 py-2 tabular-nums ${r.totalSelisih < 0 ? "text-destructive" : ""}`}>
                    {formatRupiah(r.totalSelisih)}
                  </td>
                  <td className={`px-4 py-2 tabular-nums ${rata < 0 ? "text-destructive" : ""}`}>
                    {formatRupiah(rata)}
                  </td>
                </tr>
              );
            })}
            {baris.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
