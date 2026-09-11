import SupplierForm from "../SupplierForm";
import { buatSupplier } from "../actions";

export default function SupplierBaruPage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">Tambah supplier</h1>
      <SupplierForm action={buatSupplier} submitLabel="Simpan supplier" />
    </div>
  );
}
