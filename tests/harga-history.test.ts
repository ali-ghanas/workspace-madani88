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

    const { data: produk } = await supabase
      .from("produk")
      .select("id")
      .eq("kode", "TEST-HARGA")
      .maybeSingle();

    const produkId =
      produk?.id ??
      (
        await supabase
          .from("produk")
          .insert({ kode: "TEST-HARGA", nama_dagang: "Produk Uji Harga", golongan_obat: "bebas" })
          .select("id")
          .single()
      ).data?.id;

    const { data: outlet } = await supabase.from("outlet").select("id").eq("kode", "GRL").single();
    const { data: satuan } = await supabase
      .from("satuan_produk")
      .select("id")
      .eq("produk_id", produkId)
      .maybeSingle();
    const satuanId =
      satuan?.id ??
      (
        await supabase
          .from("satuan_produk")
          .insert({ produk_id: produkId, nama_satuan: "Tablet", faktor_konversi: 1, adalah_satuan_dasar: true })
          .select("id")
          .single()
      ).data?.id;

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

    const { error: updateError } = await supabase
      .from("harga_produk")
      .update({ harga: 9999 })
      .eq("id", hargaLama!.id);
    expect(updateError).not.toBeNull();

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
