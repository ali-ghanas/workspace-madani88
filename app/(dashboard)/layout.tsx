import Link from "next/link";
import { redirect } from "next/navigation";
import { getSesiPengguna } from "@/lib/auth/session";
import SignOutButton from "./SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sesi = await getSesiPengguna();

  if (!sesi) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <nav className="flex items-center gap-4">
            <Link href="/produk" className="text-sm font-semibold">
              Workspace Madani88
            </Link>
            <Link href="/produk" className="text-sm text-gray-600 hover:text-gray-900">
              Produk
            </Link>
            <Link href="/supplier" className="text-sm text-gray-600 hover:text-gray-900">
              Supplier
            </Link>
            <Link href="/pelanggan" className="text-sm text-gray-600 hover:text-gray-900">
              Pelanggan
            </Link>
            <Link href="/pegawai" className="text-sm text-gray-600 hover:text-gray-900">
              Pegawai
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>
              {sesi.nama}
              {sesi.isOwner
                ? " · Owner"
                : sesi.penugasan.length > 0
                  ? ` · ${sesi.penugasan.map((p) => `${p.peranKode}@${p.outletKode}`).join(", ")}`
                  : " · belum ditugaskan ke outlet"}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
