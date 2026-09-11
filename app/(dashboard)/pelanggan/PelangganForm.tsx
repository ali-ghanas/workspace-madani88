"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";

type Pelanggan = {
  nama?: string;
  no_hp?: string | null;
  tanggal_lahir?: string | null;
  persetujuan_data?: boolean;
};

export default function PelangganForm({
  action,
  pelanggan,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  pelanggan?: Pelanggan;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="nama">
          Nama
        </label>
        <input
          id="nama"
          name="nama"
          required
          defaultValue={pelanggan?.nama}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="no_hp">
          No. HP
        </label>
        <input
          id="no_hp"
          name="no_hp"
          defaultValue={pelanggan?.no_hp ?? ""}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="tanggal_lahir">
          Tanggal lahir
        </label>
        <input
          id="tanggal_lahir"
          name="tanggal_lahir"
          type="date"
          defaultValue={pelanggan?.tanggal_lahir ?? ""}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="persetujuan_data"
          name="persetujuan_data"
          type="checkbox"
          defaultChecked={pelanggan?.persetujuan_data}
          className="h-4 w-4"
        />
        <label htmlFor="persetujuan_data" className="text-sm">
          Setuju data disimpan
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
