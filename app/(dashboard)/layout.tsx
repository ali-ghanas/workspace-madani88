import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSesiPengguna, punyaIzin } from "@/lib/auth/session";
import SignOutButton from "./SignOutButton";
import SidebarNav, { type NavItem } from "./SidebarNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sesi = await getSesiPengguna();

  if (!sesi) {
    redirect("/login");
  }

  const navItems: NavItem[] = [
    { href: "/produk", label: "Produk" },
    { href: "/supplier", label: "Supplier" },
    { href: "/pelanggan", label: "Pelanggan" },
    { href: "/pegawai", label: "Pegawai" },
  ];

  if (sesi.isOwner || punyaIzin(sesi, "persetujuan.setujui")) {
    navItems.push({ href: "/persetujuan", label: "Persetujuan" });
  }
  if (sesi.isOwner) {
    navItems.push({ href: "/pengguna", label: "Pengguna" });
    navItems.push({ href: "/audit-log", label: "Audit Log" });
  }

  const labelPeran = sesi.isOwner
    ? "Owner"
    : sesi.penugasan.length > 0
      ? sesi.penugasan.map((p) => `${p.peranKode}@${p.outletKode}`).join(", ")
      : "belum ditugaskan ke outlet";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <Image src="/icons/icon-mark.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
          <div className="text-sm font-bold leading-tight">Workspace Madani88</div>
        </div>
        <SidebarNav items={navItems} className="flex-1 space-y-1 px-3 py-4" />
        <div className="border-t border-border px-4 py-3">
          <div className="mb-2 text-xs leading-tight text-muted-foreground">
            <div className="font-medium text-foreground">{sesi.nama}</div>
            <div>{labelPeran}</div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <Link href="/produk" className="flex items-center gap-2">
            <Image src="/icons/icon-mark.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold">Workspace Madani88</span>
          </Link>
          <SignOutButton />
        </header>
        <div className="border-b border-border bg-card px-2 py-2 md:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
