"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSesiPengguna } from "@/lib/auth/session";

export type ImportActionState = { error?: string; hasil?: string } | null;

const OUTLET_ALIAS: Record<string, string> = {
  GREENLAND: "GRL",
  GRL: "GRL",
  NAGOYA: "NGY",
  NGY: "NGY",
  KDA: "KDA",
};

// Kolom leaf channel (bukan sub-total "-Total") di sheet "Input KK", lihat docs/keputusan.md.
const KOLOM_CHANNEL: { header: string; channel: string; subChannel: string | null }[] = [
  { header: "BCA9096 - Transfer", channel: "BCA9096", subChannel: "Transfer" },
  { header: "BCA9096 - QR", channel: "BCA9096", subChannel: "QR" },
  { header: "BCA9096 - D/K", channel: "BCA9096", subChannel: "D/K" },
  { header: "BCA9741 - Grab", channel: "BCA9741", subChannel: "Grab" },
  { header: "Mandiri - Transfer", channel: "Mandiri", subChannel: "Transfer" },
  { header: "Mandiri - QR", channel: "Mandiri", subChannel: "QR" },
  { header: "Mandiri - D/K", channel: "Mandiri", subChannel: "D/K" },
  { header: "BRI - QR", channel: "BRI", subChannel: "QR" },
  { header: "BRI - D/K", channel: "BRI", subChannel: "D/K" },
  { header: "CCB", channel: "CCB", subChannel: null },
];

function toNumber(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  // Sel formula ExcelJS: { formula, result } — bukan angka mentah.
  if (typeof v === "object" && v !== null && "result" in v) {
    return toNumber((v as { result: unknown }).result);
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toDateString(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return null;
}

export async function imporInputKK(_prev: ImportActionState, formData: FormData): Promise<ImportActionState> {
  const sesi = await getSesiPengguna();
  if (!sesi) redirect("/login");
  if (!sesi.isOwner) return { error: "Impor data historis hanya bisa dilakukan Owner." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Pilih file Excel dulu." };

  const supabase = await createClient();
  const { data: outletList } = await supabase.from("outlet").select("id, kode");
  const outletByKode = new Map((outletList ?? []).map((o) => [o.kode, o.id]));

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());

  const ws = wb.getWorksheet("Input KK");
  if (!ws) return { error: "Sheet 'Input KK' tidak ditemukan di file ini." };

  // Baris 5 = header kolom (lihat docs/keputusan.md untuk struktur sheet).
  const headerRow = ws.getRow(5).values as unknown[];
  const kolomIndex = (nama: string) => headerRow.findIndex((h) => String(h ?? "").trim() === nama);

  const idx = {
    tanggal: kolomIndex("Tanggal"),
    outlet: kolomIndex("Outlet"),
    shift: kolomIndex("Shift"),
    nama: kolomIndex("Nama"),
    jlhTrx: kolomIndex("Jlh Trx"),
    cd: kolomIndex("CD"),
    totalNontunai: kolomIndex("Total Nontunai"),
    tunai: kolomIndex("Tunai"),
    totalPenjualan: kolomIndex("Total Penjualan"),
    setoran: kolomIndex("Setoran"),
    selisih: kolomIndex("Selisih"),
    kasBesar: kolomIndex("Kas Besar"),
    pecahan: kolomIndex("Pecahan"),
    hpp: kolomIndex("HPP"),
  };

  if (idx.tanggal < 0 || idx.outlet < 0 || idx.shift < 0 || idx.nama < 0) {
    return { error: "Struktur kolom sheet 'Input KK' tidak sesuai yang diharapkan." };
  }

  const channelIdx = KOLOM_CHANNEL.map((k) => ({ ...k, colIndex: kolomIndex(k.header) }));

  type BarisImpor = {
    tanggal: string;
    outletKode: string;
    shift: string;
    kasirNama: string;
    jumlahTransaksi: number;
    cd: number | null;
    tunai: number;
    totalNontunai: number;
    totalPenjualan: number;
    setoran: number;
    selisih: number | null;
    hpp: number | null;
    catatan: string | null;
    channels: { channel: string; sub_channel: string | null; jumlah: number }[];
  };

  const baris: BarisImpor[] = [];
  const errors: string[] = [];

  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < 6) return; // header rows
    const values = row.values as unknown[];
    const tanggalRaw = values[idx.tanggal];
    const tanggal = toDateString(tanggalRaw);
    const outletRaw = String(values[idx.outlet] ?? "").trim().toUpperCase();
    const outletKode = OUTLET_ALIAS[outletRaw];
    const shift = String(values[idx.shift] ?? "").trim().toLowerCase();
    const kasirNama = String(values[idx.nama] ?? "").trim();

    if (!tanggal || !kasirNama) return; // baris kosong/di luar tabel

    if (!outletKode) {
      errors.push(`Baris ${rowNumber}: outlet "${values[idx.outlet]}" tidak dikenali`);
      return;
    }
    if (!["pagi", "siang", "sore"].includes(shift)) {
      errors.push(`Baris ${rowNumber}: shift "${values[idx.shift]}" tidak dikenali`);
      return;
    }

    const kasBesar = idx.kasBesar >= 0 ? toNumber(values[idx.kasBesar]) : 0;
    const pecahan = idx.pecahan >= 0 ? toNumber(values[idx.pecahan]) : 0;
    const catatanBagian: string[] = [];
    if (kasBesar) catatanBagian.push(`Kas Besar: ${kasBesar}`);
    if (pecahan) catatanBagian.push(`Pecahan: ${pecahan}`);

    baris.push({
      tanggal,
      outletKode,
      shift,
      kasirNama,
      jumlahTransaksi: idx.jlhTrx >= 0 ? toNumber(values[idx.jlhTrx]) : 0,
      cd: idx.cd >= 0 ? toNumber(values[idx.cd]) : null,
      tunai: idx.tunai >= 0 ? toNumber(values[idx.tunai]) : 0,
      totalNontunai: idx.totalNontunai >= 0 ? toNumber(values[idx.totalNontunai]) : 0,
      totalPenjualan: idx.totalPenjualan >= 0 ? toNumber(values[idx.totalPenjualan]) : 0,
      setoran: idx.setoran >= 0 ? toNumber(values[idx.setoran]) : 0,
      selisih: idx.selisih >= 0 ? toNumber(values[idx.selisih]) : null,
      hpp: idx.hpp >= 0 ? toNumber(values[idx.hpp]) : null,
      catatan: catatanBagian.length > 0 ? catatanBagian.join("; ") : null,
      channels: channelIdx
        .filter((c) => c.colIndex >= 0)
        .map((c) => ({ channel: c.channel, sub_channel: c.subChannel, jumlah: toNumber(values[c.colIndex]) }))
        .filter((c) => c.jumlah > 0),
    });
  });

  if (baris.length === 0) {
    return { error: `Tidak ada baris data valid ditemukan.${errors.length ? " " + errors.slice(0, 5).join("; ") : ""}` };
  }

  // Cek baris yang sudah ada (supaya upload ulang tidak duplikat).
  const { data: existing } = await supabase
    .from("shift_kasir")
    .select("tanggal, outlet_id, shift, kasir_nama");
  const existingKeys = new Set((existing ?? []).map((e) => `${e.tanggal}|${e.outlet_id}|${e.shift}|${e.kasir_nama}`));

  let masuk = 0;
  let dilewati = 0;

  // Baris baru saja (bukan yang sudah ada) — di-insert per batch, bukan satu-satu,
  // supaya tidak timeout untuk file besar (ratusan baris = 1 request HTTP kalau
  // satu-satu, ini bisa jauh melebihi batas waktu function di Vercel).
  const barisBaru = baris.filter((b) => {
    const outletId = outletByKode.get(b.outletKode);
    if (!outletId) return false;
    const key = `${b.tanggal}|${outletId}|${b.shift}|${b.kasirNama}`;
    if (existingKeys.has(key)) {
      dilewati++;
      return false;
    }
    existingKeys.add(key); // cegah duplikat kalau file punya baris identik lebih dari satu
    return true;
  });

  const UKURAN_BATCH = 100;
  for (let i = 0; i < barisBaru.length; i += UKURAN_BATCH) {
    const batch = barisBaru.slice(i, i + UKURAN_BATCH);
    const { data: shiftBaruList, error: insertError } = await supabase
      .from("shift_kasir")
      .insert(
        batch.map((b) => ({
          tanggal: b.tanggal,
          outlet_id: outletByKode.get(b.outletKode),
          shift: b.shift,
          kasir_nama: b.kasirNama,
          jumlah_transaksi: b.jumlahTransaksi,
          cd: b.cd,
          tunai: b.tunai,
          total_nontunai: b.totalNontunai,
          total_penjualan: b.totalPenjualan,
          setoran: b.setoran,
          // Pakai nilai "Selisih" dari sumber kalau ada (rekonsiliasi setoran vs
          // tunai, bukan vs total penjualan — nontunai tidak lewat tangan kasir).
          selisih: b.selisih ?? b.setoran - b.tunai,
          hpp: b.hpp,
          catatan: b.catatan,
          dibuat_oleh: sesi!.penggunaId,
        }))
      )
      .select("id");

    if (insertError) {
      errors.push(`Batch baris ${i + 1}-${i + batch.length}: ${insertError.message}`);
      continue;
    }

    const pembayaranBatch = batch.flatMap((b, j) =>
      b.channels.map((c) => ({ ...c, shift_kasir_id: shiftBaruList[j].id }))
    );
    if (pembayaranBatch.length > 0) {
      const { error: pembayaranError } = await supabase.from("pembayaran_shift").insert(pembayaranBatch);
      if (pembayaranError) errors.push(`Breakdown channel batch ${i + 1}-${i + batch.length}: ${pembayaranError.message}`);
    }

    masuk += batch.length;
  }

  // Sheet "Rekap Pembelian Harian" (opsional — kalau ada di file yang sama).
  let pembelianMasuk = 0;
  const wsPembelian = wb.getWorksheet("Rekap Pembelian Harian");
  if (wsPembelian) {
    const headerPembelian = wsPembelian.getRow(5).values as unknown[];
    const kolomP = (nama: string) => headerPembelian.findIndex((h) => String(h ?? "").trim() === nama);
    const kolomOutletPembelian: { colIndex: number; outletKode: string }[] = [
      { colIndex: kolomP("Pembelian Greenland"), outletKode: "GRL" },
      { colIndex: kolomP("Pembelian Nagoya"), outletKode: "NGY" },
      { colIndex: kolomP("Pembelian KDA"), outletKode: "KDA" },
    ].filter((k) => k.colIndex >= 0);
    const idxTanggalP = kolomP("Tanggal");

    const pembelianRows: { tanggal: string; outletId: string; jumlah: number }[] = [];
    wsPembelian.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < 6 || idxTanggalP < 0) return;
      const values = row.values as unknown[];
      const tanggal = toDateString(values[idxTanggalP]);
      if (!tanggal) return;
      for (const k of kolomOutletPembelian) {
        const outletId = outletByKode.get(k.outletKode);
        const jumlah = toNumber(values[k.colIndex]);
        if (outletId && jumlah > 0) pembelianRows.push({ tanggal, outletId, jumlah });
      }
    });

    if (pembelianRows.length > 0) {
      const { error: pembelianError } = await supabase
        .from("pembelian_harian")
        .upsert(
          pembelianRows.map((p) => ({ tanggal: p.tanggal, outlet_id: p.outletId, jumlah: p.jumlah, dibuat_oleh: sesi!.penggunaId })),
          { onConflict: "tanggal,outlet_id" }
        );
      if (pembelianError) {
        errors.push(`Pembelian harian: ${pembelianError.message}`);
      } else {
        pembelianMasuk = pembelianRows.length;
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profitabilitas");
  revalidatePath("/kasir/impor");

  const ringkasan = `${masuk} baris shift baru dimasukkan, ${dilewati} dilewati (sudah ada). ${pembelianMasuk} baris pembelian harian ter-upsert.`;
  if (errors.length > 0) {
    return { hasil: `${ringkasan} ${errors.length} error: ${errors.slice(0, 5).join("; ")}` };
  }
  return { hasil: ringkasan };
}
