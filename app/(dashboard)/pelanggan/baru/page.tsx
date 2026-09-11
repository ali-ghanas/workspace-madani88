import PelangganForm from "../PelangganForm";
import { buatPelanggan } from "../actions";

export default function PelangganBaruPage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">Tambah pelanggan</h1>
      <PelangganForm action={buatPelanggan} submitLabel="Simpan pelanggan" />
    </div>
  );
}
