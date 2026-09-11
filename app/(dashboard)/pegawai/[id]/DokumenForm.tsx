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
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="jenis">
          Jenis
        </label>
        <select id="jenis" name="jenis" required className="w-32 rounded border border-gray-300 px-2 py-1.5 text-sm">
          {JENIS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="nomor">
          Nomor
        </label>
        <input id="nomor" name="nomor" className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="tanggal_kedaluwarsa">
          Tanggal kedaluwarsa
        </label>
        <input
          id="tanggal_kedaluwarsa"
          name="tanggal_kedaluwarsa"
          type="date"
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Tambah
      </button>
      {state?.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
