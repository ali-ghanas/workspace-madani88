import { createClient } from "@/lib/supabase/server";
import { rentangBulan, formatRupiah } from "@/lib/tanggal-wib";
import BulanPicker from "./BulanPicker";

type BarisShift = {
  tanggal: string;
  total_penjualan: number;
  hpp: number | null;
  jumlah_transaksi: number;
  outlet: { kode: string; nama: string } | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const { bulan: bulanParam } = await searchParams;
  const { awal, akhir, label } = rentangBulan(bulanParam);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_kasir")
    .select("tanggal, total_penjualan, hpp, jumlah_transaksi, outlet:outlet_id(kode, nama)")
    .gte("tanggal", awal)
    .lt("tanggal", akhir)
    .order("tanggal", { ascending: true });

  const rows = (data ?? []) as unknown as BarisShift[];

  const omzet = rows.reduce((s, r) => s + Number(r.total_penjualan), 0);
  const hpp = rows.reduce((s, r) => s + Number(r.hpp ?? 0), 0);
  const labaKotor = omzet - hpp;
  const margin = omzet > 0 ? (labaKotor / omzet) * 100 : 0;
  const jumlahTransaksi = rows.reduce((s, r) => s + r.jumlah_transaksi, 0);

  const perHari = new Map<string, number>();
  for (const r of rows) {
    perHari.set(r.tanggal, (perHari.get(r.tanggal) ?? 0) + Number(r.total_penjualan));
  }
  const tren = Array.from(perHari.entries()).sort(([a], [b]) => a.localeCompare(b));
  const maxHarian = Math.max(1, ...tren.map(([, v]) => v));

  const perOutlet = new Map<string, { nama: string; omzet: number; hpp: number }>();
  for (const r of rows) {
    const kode = r.outlet?.kode ?? "-";
    const cur = perOutlet.get(kode) ?? { nama: r.outlet?.nama ?? kode, omzet: 0, hpp: 0 };
    cur.omzet += Number(r.total_penjualan);
    cur.hpp += Number(r.hpp ?? 0);
    perOutlet.set(kode, cur);
  }
  const maxOmzetOutlet = Math.max(1, ...Array.from(perOutlet.values()).map((o) => o.omzet));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dashboard KPI</h1>
          <p className="text-sm text-muted-foreground">Periode {label}.</p>
        </div>
        <BulanPicker bulan={label} />
      </div>

      {error && <p className="text-sm text-destructive">Gagal memuat data: {error.message}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KartuKpi label="Omzet" value={formatRupiah(omzet)} />
        <KartuKpi label="Laba Kotor" value={formatRupiah(labaKotor)} />
        <KartuKpi label="Margin Kotor" value={`${margin.toFixed(1)}%`} />
        <KartuKpi label="Transaksi" value={jumlahTransaksi.toLocaleString("id-ID")} />
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Tren omzet harian</h2>
        {tren.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data shift bulan ini.</p>
        ) : (
          <div className="space-y-1.5">
            {tren.map(([tanggal, v]) => (
              <div key={tanggal} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-muted-foreground">{tanggal.slice(8, 10)}/{tanggal.slice(5, 7)}</span>
                <div className="h-4 flex-1 rounded bg-muted">
                  <div
                    className="h-4 rounded bg-primary"
                    style={{ width: `${Math.max(2, (v / maxHarian) * 100)}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right tabular-nums">{formatRupiah(v)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Perbandingan outlet</h2>
        {perOutlet.size === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data.</p>
        ) : (
          <div className="space-y-3">
            {Array.from(perOutlet.entries()).map(([kode, o]) => (
              <div key={kode}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">
                    {kode} — {o.nama}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatRupiah(o.omzet)} · laba {formatRupiah(o.omzet - o.hpp)}
                  </span>
                </div>
                <div className="h-3 rounded bg-muted">
                  <div
                    className="h-3 rounded bg-primary"
                    style={{ width: `${Math.max(2, (o.omzet / maxOmzetOutlet) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KartuKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
