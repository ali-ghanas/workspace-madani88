import ProdukForm from "../ProdukForm";
import { buatProduk } from "../actions";

export default function ProdukBaruPage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">Tambah produk</h1>
      <ProdukForm action={buatProduk} submitLabel="Simpan produk" />
    </div>
  );
}
