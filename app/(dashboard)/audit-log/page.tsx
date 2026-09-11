import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna } from "@/lib/auth/session";
import { hitungDiff, formatNilai } from "@/lib/audit-diff";

const AKSI_LABEL: Record<string, string> = {
  insert: "tambah",
  update: "ubah",
  delete: "hapus",
};

const AKSI_BADGE: Record<string, string> = {
  insert: "bg-primary/10 text-primary",
  update: "bg-warning/10 text-warning",
  delete: "bg-destructive/10 text-destructive",
};

function formatWaktu(waktu: string): string {
  return new Date(waktu).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AuditLogPage() {
  const sesi = await getSesiPengguna();

  if (!sesi?.isOwner) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Audit log hanya bisa dilihat oleh Owner.
      </div>
    );
  }

  const supabase = await createClient();
  const { data: logList, error } = await supabase
    .from("audit_log")
    .select("id, nama_tabel, aksi, nilai_lama, nilai_baru, waktu, pengguna:pengguna_id(nama)")
    .order("waktu", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">200 perubahan terbaru di seluruh sistem (WIB).</p>
      </div>

      {error && <p className="text-sm text-destructive">Gagal memuat audit log: {error.message}</p>}

      <div className="space-y-2">
        {(logList ?? []).map((log) => {
          const pengguna = log.pengguna as unknown as { nama: string } | null;
          const diff = log.aksi === "update" ? hitungDiff(log.nilai_lama, log.nilai_baru) : [];

          return (
            <div key={log.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${AKSI_BADGE[log.aksi] ?? "bg-muted text-muted-foreground"}`}>
                  {AKSI_LABEL[log.aksi] ?? log.aksi}
                </span>
                <span className="font-medium">{log.nama_tabel}</span>
                <span className="text-muted-foreground">oleh {pengguna?.nama ?? "sistem"}</span>
                <span className="text-muted-foreground">· {formatWaktu(log.waktu)}</span>
              </div>

              {log.aksi === "update" && diff.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {diff.map((d) => (
                    <li key={d.field}>
                      <span className="font-medium text-foreground">{d.field}</span>: {formatNilai(d.lama)} →{" "}
                      {formatNilai(d.baru)}
                    </li>
                  ))}
                </ul>
              )}

              {log.aksi === "insert" && log.nilai_baru && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {Object.entries(log.nilai_baru as Record<string, unknown>)
                    .filter(([k]) => !["id", "created_at", "updated_at"].includes(k))
                    .slice(0, 4)
                    .map(([k, v]) => `${k}: ${formatNilai(v)}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          );
        })}

        {(logList ?? []).length === 0 && !error && (
          <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Belum ada aktivitas tercatat.
          </p>
        )}
      </div>
    </div>
  );
}
