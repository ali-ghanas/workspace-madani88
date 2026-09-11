import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default 1MB terlalu kecil untuk upload file Excel impor data historis
    // (lihat app/(dashboard)/kasir/impor) — file kerja mingguan/bulanan owner
    // biasanya beberapa MB.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
