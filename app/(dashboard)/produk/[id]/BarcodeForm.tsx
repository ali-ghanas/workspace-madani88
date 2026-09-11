"use client";

import { useActionState } from "react";
import { tambahBarcode, type ActionState } from "../actions";

export default function BarcodeForm({ produkId }: { produkId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    tambahBarcode.bind(null, produkId),
    null
  );

  return (
    <form action={formAction} className="flex items-end gap-2 border-t border-border pt-3">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="barcode">
          Barcode
        </label>
        <input
          id="barcode"
          name="barcode"
          required
          className="w-48 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        Tambah
      </button>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
