"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";

const GOLONGAN_OPTIONS = [
  ["bebas", "Bebas"],
  ["bebas_terbatas", "Bebas Terbatas"],
  ["keras", "Keras"],
  ["psikotropika", "Psikotropika"],
  ["narkotika", "Narkotika"],
  ["prekursor", "Prekursor"],
  ["alkes", "Alkes"],
  ["non_obat", "Non-Obat"],
] as const;

type Produk = {
  kode?: string;
  nama_dagang?: string;
  zat_aktif?: string | null;
  kategori?: string | null;
  golongan_obat?: string;
  wajib_resep?: boolean;
};

export default function ProdukForm({
  action,
  produk,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  produk?: Produk;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-5">
      {!produk && (
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="kode">
            Kode produk
          </label>
          <input
            id="kode"
            name="kode"
            required
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="nama_dagang">
          Nama dagang
        </label>
        <input
          id="nama_dagang"
          name="nama_dagang"
          required
          defaultValue={produk?.nama_dagang}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="zat_aktif">
          Zat aktif
        </label>
        <input
          id="zat_aktif"
          name="zat_aktif"
          defaultValue={produk?.zat_aktif ?? ""}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="kategori">
          Kategori
        </label>
        <input
          id="kategori"
          name="kategori"
          defaultValue={produk?.kategori ?? ""}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="golongan_obat">
          Golongan obat
        </label>
        <select
          id="golongan_obat"
          name="golongan_obat"
          required
          defaultValue={produk?.golongan_obat ?? ""}
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        >
          <option value="" disabled>
            Pilih golongan
          </option>
          {GOLONGAN_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="wajib_resep"
          name="wajib_resep"
          type="checkbox"
          defaultChecked={produk?.wajib_resep}
          className="h-4 w-4"
        />
        <label htmlFor="wajib_resep" className="text-sm">
          Wajib resep
        </label>
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
