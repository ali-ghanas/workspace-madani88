"use client";

import { useActionState } from "react";
import { imporInputKK, type ImportActionState } from "./actions";

export default function ImporForm() {
  const [state, formAction, pending] = useActionState<ImportActionState, FormData>(imporInputKK, null);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="file">
          File Excel (sheet &quot;Input KK&quot;)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".xlsx"
          required
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
        />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.hasil && <p className="text-sm text-primary">{state.hasil}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Impor"}
      </button>
    </form>
  );
}
