"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Aksi = (id: string) => Promise<{ error?: string } | undefined>;

export default function SetujuiTolakButtons({
  id,
  setujui,
  tolak,
  tolakConfirmText,
}: {
  id: string;
  setujui: Aksi;
  tolak?: Aksi;
  tolakConfirmText?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function jalankan(aksi: Aksi) {
    setError(null);
    startTransition(async () => {
      const result = await aksi(id);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => jalankan(setujui)}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Memproses..." : "Setujui"}
        </button>
        {tolak && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(tolakConfirmText ?? "Tolak pengajuan ini?")) return;
              jalankan(tolak);
            }}
            className="rounded-lg border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            Tolak
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
