import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProdukForm from "../ProdukForm";
import { ubahProduk } from "../actions";
import SatuanForm from "./SatuanForm";
import BarcodeForm from "./BarcodeForm";
import HargaForm from "./HargaForm";
import NonaktifkanButton from "./NonaktifkanButton";

export default async function ProdukDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: produk }, { data: satuanList }, { data: barcodeList }, { data: hargaList }, { data: outletList }] =
    await Promise.all([
      supabase.from("produk").select("*").eq("id", id).single(),
      supabase
        .from("satuan_produk")
        .select("id, nama_satuan, faktor_konversi, adalah_satuan_dasar")
        .eq("produk_id", id)
        .eq("status_aktif", true)
        .order("faktor_konversi", { ascending: false }),
      supabase.from("barcode_produk").select("id, barcode").eq("produk_id", id).eq("status_aktif", true),
      supabase
        .from("harga_produk")
        .select("id, harga, berlaku_mulai, outlet:outlet_id(kode, nama), satuan:satuan_produk_id(nama_satuan)")
        .eq("produk_id", id)
        .order("berlaku_mulai", { ascending: false }),
      supabase.from("outlet").select("id, kode, nama").eq("status_aktif", true).order("kode"),
    ]);

  if (!produk) notFound();

  const outletOptions = (outletList ?? []).map((o) => ({ id: o.id, label: `${o.kode} — ${o.nama}` }));
  const satuanOptions = (satuanList ?? []).map((s) => ({ id: s.id, label: s.nama_satuan }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {produk.nama_dagang}{" "}
          <span className="text-sm font-normal text-gray-400">({produk.kode})</span>
        </h1>
        {produk.status_persetujuan === "pending" && (
          <p className="mt-1 text-sm text-amber-600">Perubahan terbaru menunggu persetujuan owner/APJ.</p>
        )}
      </div>

      <section className="max-w-lg">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Data produk</h2>
        <ProdukForm action={ubahProduk.bind(null, id)} produk={produk} submitLabel="Simpan perubahan" />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Satuan bertingkat</h2>
        <ul className="mb-1 text-sm text-gray-700">
          {(satuanList ?? []).map((s) => (
            <li key={s.id}>
              {s.nama_satuan} — faktor {s.faktor_konversi}
              {s.adalah_satuan_dasar && <span className="ml-1 text-xs text-gray-400">(satuan dasar)</span>}
            </li>
          ))}
          {(satuanList ?? []).length === 0 && <li className="text-gray-400">Belum ada satuan.</li>}
        </ul>
        <SatuanForm produkId={id} />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Barcode</h2>
        <ul className="mb-1 text-sm text-gray-700">
          {(barcodeList ?? []).map((b) => (
            <li key={b.id}>{b.barcode}</li>
          ))}
          {(barcodeList ?? []).length === 0 && <li className="text-gray-400">Belum ada barcode.</li>}
        </ul>
        <BarcodeForm produkId={id} />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">Harga per outlet (riwayat)</h2>
        <table className="mb-1 w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-1 font-medium">Outlet</th>
              <th className="py-1 font-medium">Satuan</th>
              <th className="py-1 font-medium">Harga</th>
              <th className="py-1 font-medium">Berlaku mulai</th>
            </tr>
          </thead>
          <tbody>
            {(hargaList ?? []).map((h) => {
              const outlet = h.outlet as unknown as { kode: string; nama: string } | null;
              const satuan = h.satuan as unknown as { nama_satuan: string } | null;
              return (
                <tr key={h.id} className="border-t border-gray-100">
                  <td className="py-1">{outlet?.kode}</td>
                  <td className="py-1">{satuan?.nama_satuan}</td>
                  <td className="py-1">Rp {Number(h.harga).toLocaleString("id-ID")}</td>
                  <td className="py-1">{h.berlaku_mulai}</td>
                </tr>
              );
            })}
            {(hargaList ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="py-2 text-gray-400">
                  Belum ada harga.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <HargaForm produkId={id} outletOptions={outletOptions} satuanOptions={satuanOptions} />
      </section>

      <section>
        <NonaktifkanButton produkId={id} statusAktif={produk.status_aktif} />
      </section>
    </div>
  );
}
