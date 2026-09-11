"use client";

import { useActionState } from "react";
import { tambahPenugasan, type ActionState } from "./actions";

type Opsi = { id: string; label: string };

export default function PenugasanForm({
  penggunaId,
  outletOptions,
  peranOptions,
}: {
  penggunaId: string;
  outletOptions: Opsi[];
  peranOptions: Opsi[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    tambahPenugasan.bind(null, penggunaId),
    null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="outlet_id">
          Outlet
        </label>
        <select
          id="outlet_id"
          name="outlet_id"
          required
          className="w-44 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
        >
          {outletOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="peran_id">
          Peran
        </label>
        <select
          id="peran_id"
          name="peran_id"
          required
          className="w-40 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
        >
          {peranOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        Tambah penugasan
      </button>
      {state?.error && <p className="w-full text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
