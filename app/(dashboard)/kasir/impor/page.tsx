import { getSesiPengguna } from "@/lib/auth/session";
import ImporForm from "./ImporForm";

export default async function ImporPage() {
  const sesi = await getSesiPengguna();

  if (!sesi?.isOwner) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Impor data historis hanya untuk Owner.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Impor Data Tutup Shift</h1>
        <p className="text-sm text-muted-foreground">
          Upload file Excel (harus ada sheet &quot;Input KK&quot;). Aman diulang — baris yang sudah
          pernah masuk otomatis dilewati, tidak akan menduplikasi data.
        </p>
      </div>
      <ImporForm />
    </div>
  );
}
