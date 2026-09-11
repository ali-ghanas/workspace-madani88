"use client";

import { useActionState } from "react";
import { tambahSatuan, type ActionState } from "../actions";

export default function SatuanForm({ produkId }: { produkId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    tambahSatuan.bind(null, produkId),
    null
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="nama_satuan">
          Nama satuan
        </label>
        <input
          id="nama_satuan"
          name="nama_satuan"
          required
          placeholder="mis. Box, Strip, Tablet"
          className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="faktor_konversi">
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
          className="w-28 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <label className="flex items-center gap-1.5 pb-2 text-xs text-gray-600">
        <input type="checkbox" name="adalah_satuan_dasar" className="h-3.5 w-3.5" />
        Satuan dasar
      </label>
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
