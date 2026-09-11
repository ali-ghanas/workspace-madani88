"use client";

import { useActionState } from "react";
import { tautkanPengguna, type ActionState } from "../actions";

type Opsi = { id: string; label: string };

export default function TautkanPenggunaForm({
  pegawaiId,
  penggunaOptions,
  penggunaIdSaatIni,
}: {
  pegawaiId: string;
  penggunaOptions: Opsi[];
  penggunaIdSaatIni: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    tautkanPengguna.bind(null, pegawaiId),
    null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="pengguna_id">
          Akun login
        </label>
        <select
          id="pengguna_id"
          name="pengguna_id"
          defaultValue={penggunaIdSaatIni ?? ""}
          className="w-64 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
        >
          <option value="">Belum ditautkan</option>
          {penggunaOptions.map((o) => (
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
        Simpan
      </button>
      {state?.error && <p className="w-full text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
