// Integration test — butuh Supabase lokal yang jalan (`supabase start`) dan
// data demo (`node scripts/seed-demo-users.mjs`). Di-skip otomatis kalau env
// belum di-set (mis. Docker belum terpasang), supaya `npm test` tetap hijau
// di komputer yang belum siap Docker.
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = process.env.SUPABASE_ANON_KEY;
const canRun = Boolean(anonKey);

describe.skipIf(!canRun)("harga_produk — riwayat harga append-only", () => {
  it("harga baru menambah baris baru, bukan menimpa baris lama; UPDATE ditolak RLS", async () => {
    const supabase = createClient(url, anonKey!);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: "owner.demo@madani88.local",
      password: "Demo1234!",
    });
    expect(signInError).toBeNull();

    // Kode unik per run: tabel produk/harga_produk tidak punya cara dihapus lewat
    // RLS (soft-delete only), jadi memakai kode tetap akan membuat riwayat harga
    // dari run sebelumnya menumpuk dan bikin assertion di bawah gagal.
    const kodeUnik = `TEST-HARGA-${Date.now()}`;

    const { data: produk } = await supabase
      .from("produk")
      .insert({ kode: kodeUnik, nama_dagang: "Produk Uji Harga", golongan_obat: "bebas" })
      .select("id")
      .single();
    const produkId = produk!.id;

    const { data: outlet } = await supabase.from("outlet").select("id").eq("kode", "GRL").single();
    const { data: satuan } = await supabase
      .from("satuan_produk")
      .insert({ produk_id: produkId, nama_satuan: "Tablet", faktor_konversi: 1, adalah_satuan_dasar: true })
      .select("id")
      .single();
    const satuanId = satuan!.id;

    const { data: hargaLama } = await supabase
      .from("harga_produk")
      .insert({
        produk_id: produkId,
        outlet_id: outlet!.id,
        satuan_produk_id: satuanId,
        harga: 1000,
        berlaku_mulai: "2026-01-01",
      })
      .select("id")
      .single();

    // Tidak ada policy UPDATE untuk harga_produk (lihat migrasi 0008_rls.sql),
    // jadi Postgres/PostgREST tidak melempar error — baris yang tidak lolos
    // klausa RLS cuma tidak ikut ter-update (affected rows = 0). Yang penting
    // diverifikasi adalah nilainya tetap utuh, bukan ada-tidaknya error.
    await supabase.from("harga_produk").update({ harga: 9999 }).eq("id", hargaLama!.id);
    const { data: hargaSetelahUpdate } = await supabase
      .from("harga_produk")
      .select("harga")
      .eq("id", hargaLama!.id)
      .single();
    expect(hargaSetelahUpdate?.harga).toBe(1000);

    await supabase.from("harga_produk").insert({
      produk_id: produkId,
      outlet_id: outlet!.id,
      satuan_produk_id: satuanId,
      harga: 1500,
      berlaku_mulai: "2026-06-01",
    });

    const { data: riwayat } = await supabase
      .from("harga_produk")
      .select("harga, berlaku_mulai")
      .eq("produk_id", produkId)
      .order("berlaku_mulai", { ascending: true });

    expect(riwayat).toEqual([
      { harga: 1000, berlaku_mulai: "2026-01-01" },
      { harga: 1500, berlaku_mulai: "2026-06-01" },
    ]);
  });
});
