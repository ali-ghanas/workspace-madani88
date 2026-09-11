"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nonaktifkanProduk } from "../actions";

export default function NonaktifkanButton({ produkId, statusAktif }: { produkId: string; statusAktif: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!statusAktif) {
    return <span className="text-sm text-gray-400">Produk sudah nonaktif</span>;
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Nonaktifkan produk ini? Data & riwayat tetap tersimpan.")) return;
          startTransition(async () => {
            const result = await nonaktifkanProduk(produkId);
            if (result?.error) {
              setError(result.error);
            } else {
              router.refresh();
            }
          });
        }}
        className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Nonaktifkan produk"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
