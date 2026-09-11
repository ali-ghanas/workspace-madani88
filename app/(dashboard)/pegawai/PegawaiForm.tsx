"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";

type Pegawai = {
  nama?: string;
  nik_internal?: string | null;
  jabatan?: string | null;
  outlet_utama_id?: string;
  tanggal_masuk?: string | null;
};

type OutletOpsi = { id: string; label: string };

export default function PegawaiForm({
  action,
  pegawai,
  outletOptions,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  pegawai?: Pegawai;
  outletOptions: OutletOpsi[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="nama">
          Nama
        </label>
        <input
          id="nama"
          name="nama"
          required
          defaultValue={pegawai?.nama}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="nik_internal">
          NIK internal
        </label>
        <input
          id="nik_internal"
          name="nik_internal"
          defaultValue={pegawai?.nik_internal ?? ""}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="jabatan">
          Jabatan
        </label>
        <input
          id="jabatan"
          name="jabatan"
          defaultValue={pegawai?.jabatan ?? ""}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="outlet_utama_id">
          Outlet utama
        </label>
        <select
          id="outlet_utama_id"
          name="outlet_utama_id"
          required
          defaultValue={pegawai?.outlet_utama_id ?? ""}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        >
          <option value="" disabled>
            Pilih outlet
          </option>
          {outletOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="tanggal_masuk">
          Tanggal masuk
        </label>
        <input
          id="tanggal_masuk"
          name="tanggal_masuk"
          type="date"
          defaultValue={pegawai?.tanggal_masuk ?? ""}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
