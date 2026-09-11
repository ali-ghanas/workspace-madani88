import { createClient } from "@/lib/supabase/server";
import { rentangBulan, formatRupiah } from "@/lib/tanggal-wib";
import BulanPicker from "../BulanPicker";

export default async function ReviewChannelPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const { bulan: bulanParam } = await searchParams;
  const { awal, akhir, label } = rentangBulan(bulanParam);
  const supabase = await createClient();

  const [{ data: pembayaranData, error }, { data: shiftData }] = await Promise.all([
    supabase
      .from("pembayaran_shift")
      .select("channel, sub_channel, jumlah, shift_kasir!inner(tanggal)")
      .gte("shift_kasir.tanggal", awal)
      .lt("shift_kasir.tanggal", akhir),
    supabase.from("shift_kasir").select("tunai").gte("tanggal", awal).lt("tanggal", akhir),
  ]);

  const perChannel = new Map<string, number>();
  for (const p of (pembayaranData ?? []) as unknown as { channel: string; sub_channel: string | null; jumlah: number }[]) {
    perChannel.set(p.channel, (perChannel.get(p.channel) ?? 0) + Number(p.jumlah));
  }
  const totalTunai = (shiftData ?? []).reduce((s, r) => s + Number((r as { tunai: number }).tunai), 0);

  const totalSemua = totalTunai + Array.from(perChannel.values()).reduce((s, v) => s + v, 0);
  const maxNilai = Math.max(1, totalTunai, ...perChannel.values());

  const baris: { label: string; nilai: number }[] = [
    { label: "Tunai", nilai: totalTunai },
    ...Array.from(perChannel.entries()).map(([channel, nilai]) => ({ label: channel, nilai })),
  ].sort((a, b) => b.nilai - a.nilai);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Review Channel Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Periode {label}.</p>
        </div>
        <BulanPicker bulan={label} />
      </div>

      {error && <p className="text-sm text-destructive">Gagal memuat data: {error.message}</p>}

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="space-y-2">
          {baris.map((b) => (
            <div key={b.label} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0">{b.label}</span>
              <div className="h-4 flex-1 rounded bg-muted">
                <div className="h-4 rounded bg-primary" style={{ width: `${Math.max(2, (b.nilai / maxNilai) * 100)}%` }} />
              </div>
              <span className="w-36 shrink-0 text-right tabular-nums">
                {formatRupiah(b.nilai)}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({totalSemua > 0 ? ((b.nilai / totalSemua) * 100).toFixed(1) : "0.0"}%)
                </span>
              </span>
            </div>
          ))}
          {baris.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
        </div>
      </section>
    </div>
  );
}
