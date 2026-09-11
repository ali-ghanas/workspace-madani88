"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NonaktifkanButton({
  id,
  statusAktif,
  action,
  confirmText,
  label = "Nonaktifkan",
}: {
  id: string;
  statusAktif: boolean;
  action: (id: string) => Promise<{ error?: string } | undefined>;
  confirmText: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!statusAktif) {
    return <span className="text-sm text-muted-foreground">Sudah nonaktif</span>;
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(confirmText)) return;
          startTransition(async () => {
            const result = await action(id);
            if (result?.error) {
              setError(result.error);
            } else {
              router.refresh();
            }
          });
        }}
        className="rounded-lg border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
      >
        {pending ? "Memproses..." : label}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
