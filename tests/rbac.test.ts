import { describe, expect, it } from "vitest";
import { statusPersetujuanUntuk } from "@/lib/auth/rbac";

function sesi(isOwner: boolean, izinKodes: string[]) {
  return { isOwner, izinKodes: new Set(izinKodes) };
}

describe("statusPersetujuanUntuk", () => {
  it("owner selalu disetujui langsung, termasuk golongan khusus", () => {
    expect(statusPersetujuanUntuk(sesi(true, []), "narkotika", "produk.tambah")).toBe("disetujui");
  });

  it("APJ dengan produk.tambah + produk.golongan_khusus: disetujui langsung untuk narkotika", () => {
    const s = sesi(false, ["produk.tambah", "produk.golongan_khusus"]);
    expect(statusPersetujuanUntuk(s, "narkotika", "produk.tambah")).toBe("disetujui");
  });

  it("Apoteker dengan produk.ajukan untuk produk golongan bebas: tetap pending (bukan izin langsung)", () => {
    const s = sesi(false, ["produk.ajukan"]);
    expect(statusPersetujuanUntuk(s, "bebas", "produk.tambah")).toBe("pending");
  });

  it("APJ punya produk.tambah tapi TIDAK punya produk.golongan_khusus: psikotropika tetap pending (aturan kontrol #2)", () => {
    const s = sesi(false, ["produk.tambah"]);
    expect(statusPersetujuanUntuk(s, "psikotropika", "produk.tambah")).toBe("pending");
  });

  it("izin langsung untuk golongan bebas: disetujui", () => {
    const s = sesi(false, ["produk.tambah"]);
    expect(statusPersetujuanUntuk(s, "bebas", "produk.tambah")).toBe("disetujui");
  });

  it("tanpa izin sama sekali: pending", () => {
    const s = sesi(false, []);
    expect(statusPersetujuanUntuk(s, "bebas", "produk.tambah")).toBe("pending");
  });
});
