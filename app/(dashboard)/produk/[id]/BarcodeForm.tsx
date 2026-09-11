"use client";

import { useActionState } from "react";
import { tambahBarcode, type ActionState } from "../actions";

export default function BarcodeForm({ produkId }: { produkId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    tambahBarcode.bind(null, produkId),
    null
  );

  return (
    <form action={formAction} className="flex items-end gap-2 border-t border-gray-100 pt-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="barcode">
          Barcode
        </label>
        <input
          id="barcode"
          name="barcode"
          required
          className="w-48 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Tambah
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
