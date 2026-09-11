"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

export default function SidebarNav({ items, className = "" }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
              (active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
