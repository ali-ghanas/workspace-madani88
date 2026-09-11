"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BulanPicker({ bulan }: { bulan: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <input
      type="month"
      defaultValue={bulan}
      onChange={(e) => {
        if (e.target.value) router.push(`${pathname}?bulan=${e.target.value}`);
      }}
      className="rounded-lg border border-border bg-input px-3 py-1.5 text-sm outline-none ring-primary/30 focus:ring-2"
    />
  );
}
