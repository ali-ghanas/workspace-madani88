"use client";

import { useActionState } from "react";
import { undangPengguna, type ActionState } from "./actions";

export default function UndangForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(undangPengguna, null);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="nama">
          Nama
        </label>
        <input
          id="nama"
          name="nama"
          required
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Undangan berisi tautan untuk membuat kata sandi akan dikirim ke email ini.
        </p>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Mengirim..." : "Kirim undangan"}
      </button>
    </form>
  );
}
