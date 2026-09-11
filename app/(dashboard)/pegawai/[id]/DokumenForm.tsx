"use client";

import { useActionState } from "react";
import { tambahDokumen, type ActionState } from "../actions";

const JENIS_OPTIONS = [
  ["ktp", "KTP"],
  ["str", "STR"],
  ["sipa", "SIPA"],
  ["siptt", "SIPTTK"],
  ["kontrak", "Kontrak"],
  ["lainnya", "Lainnya"],
] as const;

export default function DokumenForm({ pegawaiId }: { pegawaiId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    tambahDokumen.bind(null, pegawaiId),
    null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="jenis">
          Jenis
        </label>
        <select id="jenis" name="jenis" required className="w-32 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2">
          {JENIS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="nomor">
          Nomor
        </label>
        <input id="nomor" name="nomor" className="w-40 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground" htmlFor="tanggal_kedaluwarsa">
          Tanggal kedaluwarsa
        </label>
        <input
          id="tanggal_kedaluwarsa"
          name="tanggal_kedaluwarsa"
          type="date"
          className="rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>
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
