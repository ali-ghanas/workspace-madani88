import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypass RLS sepenuhnya. Hanya untuk operasi admin yang
// memang butuh hak penuh (mis. mengundang pengguna baru lewat Auth admin API).
// JANGAN pernah diimpor dari client component atau dipakai untuk query data biasa
// (query data biasa harus lewat lib/supabase/server.ts supaya RLS tetap berlaku).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum di-set di .env.local");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
