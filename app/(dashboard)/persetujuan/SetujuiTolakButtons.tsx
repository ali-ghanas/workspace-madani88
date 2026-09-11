"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setujuiProduk, tolakProduk } from "./actions";

export default function SetujuiTolakButtons({ produkId, bisaTolak }: { produkId: string; bisaTolak: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function jalankan(aksi: (id: string) => Promise<{ error?: string } | undefined>) {
    setError(null);
    startTransition(async () => {
      const result = await aksi(produkId);
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
          onClick={() => jalankan(setujuiProduk)}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Memproses..." : "Setujui"}
        </button>
        {bisaTolak && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Tolak pengajuan ini? Data akan dikembalikan ke nilai sebelumnya.")) return;
              jalankan(tolakProduk);
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
