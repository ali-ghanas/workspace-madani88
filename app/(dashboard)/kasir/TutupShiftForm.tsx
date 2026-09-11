"use client";

import { useActionState, useState } from "react";
import { tutupShift, type ActionState } from "./actions";

type Opsi = { id: string; label: string };
type BarisChannel = { channel: string; subChannel: string; jumlah: string };

const CHANNEL_UMUM = ["BCA9096", "BCA9741", "Mandiri", "BRI", "CCB", "CD"];

export default function TutupShiftForm({ outletOptions }: { outletOptions: Opsi[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(tutupShift, null);
  const [baris, setBaris] = useState<BarisChannel[]>([{ channel: "", subChannel: "", jumlah: "" }]);

  function updateBaris(index: number, field: keyof BarisChannel, value: string) {
    setBaris((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="tanggal">
            Tanggal
          </label>
          <input
            id="tanggal"
            name="tanggal"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="outlet_id">
            Outlet
          </label>
          <select
            id="outlet_id"
            name="outlet_id"
            required
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          >
            {outletOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="shift">
            Shift
          </label>
          <select
            id="shift"
            name="shift"
            required
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          >
            <option value="pagi">Pagi</option>
            <option value="siang">Siang</option>
            <option value="sore">Sore</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="kasir_nama">
            Nama kasir
          </label>
          <input
            id="kasir_nama"
            name="kasir_nama"
            required
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="jumlah_transaksi">
            Jumlah transaksi
          </label>
          <input
            id="jumlah_transaksi"
            name="jumlah_transaksi"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="tunai">
            Tunai (Rp)
          </label>
          <input
            id="tunai"
            name="tunai"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="setoran">
            Setoran (Rp)
          </label>
          <input
            id="setoran"
            name="setoran"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="hpp">
            HPP (Rp, opsional)
          </label>
          <input
            id="hpp"
            name="hpp"
            type="number"
            min="0"
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Breakdown channel pembayaran nontunai</label>
          <button
            type="button"
            onClick={() => setBaris((prev) => [...prev, { channel: "", subChannel: "", jumlah: "" }])}
            className="rounded-lg border border-border px-2 py-1 text-xs font-medium hover:bg-accent"
          >
            + Tambah baris
          </button>
        </div>
        <div className="space-y-2">
          {baris.map((b, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                name="channel"
                list="channel-umum"
                placeholder="Channel (mis. BCA9096)"
                value={b.channel}
                onChange={(e) => updateBaris(i, "channel", e.target.value)}
                className="w-40 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
              <input
                name="sub_channel"
                placeholder="Sub-channel (mis. QR)"
                value={b.subChannel}
                onChange={(e) => updateBaris(i, "subChannel", e.target.value)}
                className="w-40 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
              <input
                name="channel_jumlah"
                type="number"
                min="0"
                placeholder="Jumlah (Rp)"
                value={b.jumlah}
                onChange={(e) => updateBaris(i, "jumlah", e.target.value)}
                className="w-36 rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
              {baris.length > 1 && (
                <button
                  type="button"
                  onClick={() => setBaris((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-xs text-destructive hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
        </div>
        <datalist id="channel-umum">
          {CHANNEL_UMUM.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-muted-foreground">
          Total nontunai & selisih dihitung otomatis dari baris ini + tunai + setoran.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="catatan">
          Catatan (opsional)
        </label>
        <input
          id="catatan"
          name="catatan"
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan tutup shift"}
      </button>
    </form>
  );
}
