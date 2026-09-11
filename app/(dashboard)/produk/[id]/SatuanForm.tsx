"use client";

import { useActionState } from "react";
import { tambahSatuan, type ActionState } from "../actions";

export default function SatuanForm({ produkId }: { produkId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    tambahSatuan.bind(null, produkId),
    null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="nama_satuan">
          Nama satuan
        </label>
        <input
          id="nama_satuan"
          name="nama_satuan"
          required
          placeholder="mis. Box, Strip, Tablet"
          className="w-40 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="faktor_konversi">
          Faktor konversi
        </label>
        <input
          id="faktor_konversi"
          name="faktor_konversi"
          type="number"
          step="0.0001"
          min="0"
          required
          defaultValue={1}
          className="w-28 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <label className="flex items-center gap-1.5 pb-2 text-xs text-muted-foreground">
        <input type="checkbox" name="adalah_satuan_dasar" className="h-3.5 w-3.5" />
        Satuan dasar
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        Tambah
      </button>
      {state?.error && <p className="w-full text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
