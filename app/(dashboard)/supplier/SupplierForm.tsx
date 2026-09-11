"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";

type Supplier = {
  nama_pbf?: string;
  npwp?: string | null;
  kontak?: string | null;
  termin_pembayaran?: string | null;
};

export default function SupplierForm({
  action,
  supplier,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  supplier?: Supplier;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="nama_pbf">
          Nama PBF
        </label>
        <input
          id="nama_pbf"
          name="nama_pbf"
          required
          defaultValue={supplier?.nama_pbf}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="npwp">
          NPWP
        </label>
        <input
          id="npwp"
          name="npwp"
          defaultValue={supplier?.npwp ?? ""}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="kontak">
          Kontak
        </label>
        <input
          id="kontak"
          name="kontak"
          defaultValue={supplier?.kontak ?? ""}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="termin_pembayaran">
          Termin pembayaran
        </label>
        <input
          id="termin_pembayaran"
          name="termin_pembayaran"
          placeholder="mis. 30 hari, COD"
          defaultValue={supplier?.termin_pembayaran ?? ""}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
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
