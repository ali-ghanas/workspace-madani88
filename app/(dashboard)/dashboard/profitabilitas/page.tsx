import { createClient } from "@/lib/supabase/server";
import { rentangBulan, formatRupiah } from "@/lib/tanggal-wib";
import BulanPicker from "../BulanPicker";

const SHIFT_LABEL: Record<string, string> = { pagi: "Pagi", siang: "Siang", sore: "Sore" };

export default async function ProfitabilitasPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const { bulan: bulanParam } = await searchParams;
  const { awal, akhir, label } = rentangBulan(bulanParam);
  const supabase = await createClient();

  const [{ data: shiftData, error: shiftError }, { data: pembelianData }] = await Promise.all([
    supabase
      .from("shift_kasir")
      .select("outlet_id, shift, total_penjualan, hpp, outlet:outlet_id(kode, nama)")
      .gte("tanggal", awal)
      .lt("tanggal", akhir),
    supabase
      .from("pembelian_harian")
      .select("outlet_id, jumlah, outlet:outlet_id(kode)")
      .gte("tanggal", awal)
      .lt("tanggal", akhir),
  ]);

  type Row = { key: string; outletKode: string; outletNama: string; shift: string; omzet: number; hpp: number };
  const perOutletShift = new Map<string, Row>();
  const perOutlet = new Map<string, { nama: string; omzet: number; hpp: number }>();

  for (const r of (shiftData ?? []) as unknown as {
    outlet_id: string;
    shift: string;
    total_penjualan: number;
    hpp: number | null;
    outlet: { kode: string; nama: string } | null;
  }[]) {
    const kode = r.outlet?.kode ?? "-";
    const key = `${kode}|${r.shift}`;
    const cur = perOutletShift.get(key) ?? {
      key,
      outletKode: kode,
      outletNama: r.outlet?.nama ?? kode,
      shift: r.shift,
      omzet: 0,
      hpp: 0,
    };
    cur.omzet += Number(r.total_penjualan);
    cur.hpp += Number(r.hpp ?? 0);
    perOutletShift.set(key, cur);

    const o = perOutlet.get(kode) ?? { nama: r.outlet?.nama ?? kode, omzet: 0, hpp: 0 };
    o.omzet += Number(r.total_penjualan);
    o.hpp += Number(r.hpp ?? 0);
    perOutlet.set(kode, o);
  }

  const pembelianPerOutlet = new Map<string, number>();
  for (const p of (pembelianData ?? []) as unknown as { outlet_id: string; jumlah: number; outlet: { kode: string } | null }[]) {
    const kode = p.outlet?.kode ?? "-";
    pembelianPerOutlet.set(kode, (pembelianPerOutlet.get(kode) ?? 0) + Number(p.jumlah));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Profitabilitas</h1>
          <p className="text-sm text-muted-foreground">Periode {label}.</p>
        </div>
        <BulanPicker bulan={label} />
      </div>

      {shiftError && <p className="text-sm text-destructive">Gagal memuat data: {shiftError.message}</p>}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Outlet</th>
              <th className="px-4 py-2 font-medium">Omzet</th>
              <th className="px-4 py-2 font-medium">HPP</th>
              <th className="px-4 py-2 font-medium">Laba Kotor</th>
              <th className="px-4 py-2 font-medium">Margin</th>
              <th className="px-4 py-2 font-medium">Pembelian</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(perOutlet.entries()).map(([kode, o]) => (
              <tr key={kode} className="border-t border-border">
                <td className="px-4 py-2 font-medium">
                  {kode} — {o.nama}
                </td>
                <td className="px-4 py-2 tabular-nums">{formatRupiah(o.omzet)}</td>
                <td className="px-4 py-2 tabular-nums">{formatRupiah(o.hpp)}</td>
                <td className="px-4 py-2 tabular-nums">{formatRupiah(o.omzet - o.hpp)}</td>
                <td className="px-4 py-2 tabular-nums">
                  {o.omzet > 0 ? (((o.omzet - o.hpp) / o.omzet) * 100).toFixed(1) : "0.0"}%
                </td>
                <td className="px-4 py-2 tabular-nums text-muted-foreground">
                  {formatRupiah(pembelianPerOutlet.get(kode) ?? 0)}
                </td>
              </tr>
            ))}
            {perOutlet.size === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Per shift</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-1 font-medium">Outlet</th>
                <th className="py-1 font-medium">Shift</th>
                <th className="py-1 font-medium">Omzet</th>
                <th className="py-1 font-medium">Laba Kotor</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(perOutletShift.values())
                .sort((a, b) => a.outletKode.localeCompare(b.outletKode) || a.shift.localeCompare(b.shift))
                .map((r) => (
                  <tr key={r.key} className="border-t border-border">
                    <td className="py-1">{r.outletKode}</td>
                    <td className="py-1">{SHIFT_LABEL[r.shift] ?? r.shift}</td>
                    <td className="py-1 tabular-nums">{formatRupiah(r.omzet)}</td>
                    <td className="py-1 tabular-nums">{formatRupiah(r.omzet - r.hpp)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
