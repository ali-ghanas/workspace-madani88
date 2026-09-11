"use client";

import { useActionState } from "react";
import { tambahHarga, type ActionState } from "../actions";

type Opsi = { id: string; label: string };

export default function HargaForm({
  produkId,
  outletOptions,
  satuanOptions,
}: {
  produkId: string;
  outletOptions: Opsi[];
  satuanOptions: Opsi[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    tambahHarga.bind(null, produkId),
    null
  );

  const disabled = outletOptions.length === 0 || satuanOptions.length === 0;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="outlet_id">
          Outlet
        </label>
        <select
          id="outlet_id"
          name="outlet_id"
          required
          className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          {outletOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="satuan_produk_id">
          Satuan
        </label>
        <select
          id="satuan_produk_id"
          name="satuan_produk_id"
          required
          className="w-32 rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          {satuanOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="harga">
          Harga (Rp)
        </label>
        <input
          id="harga"
          name="harga"
          type="number"
          min="0"
          step="1"
          required
          className="w-28 rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500" htmlFor="berlaku_mulai">
          Berlaku mulai
        </label>
        <input
          id="berlaku_mulai"
          name="berlaku_mulai"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending || disabled}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Simpan harga
      </button>
      {disabled && (
        <p className="w-full text-xs text-amber-600">Tambahkan satuan produk dulu sebelum mengisi harga.</p>
      )}
      {state?.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
