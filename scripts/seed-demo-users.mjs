// Dev-only: membuat 2 pengguna demo (via Supabase Auth admin API, sehingga
// password ikut di-hash oleh GoTrue) lalu menugaskan masing-masing ke satu
// outlet berbeda, untuk menguji isolasi RLS antar outlet (kriteria fase 1 §8).
//
// Jalankan setelah `supabase start`:
//   node scripts/seed-demo-users.mjs
//
// Butuh env SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY (lihat output `supabase start`,
// atau `supabase status`). Service role key TIDAK boleh dipakai di kode app/browser.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY belum di-set. Lihat `supabase status` untuk nilainya.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const OUTLET_GRL = "00000000-0000-0000-0000-000000000011";
const OUTLET_NGY = "00000000-0000-0000-0000-000000000012";

const demoUsers = [
  { email: "owner.demo@madani88.local", password: "Demo1234!", nama: "Owner Demo", peranKode: "owner", outletId: OUTLET_GRL },
  { email: "apoteker.grl@madani88.local", password: "Demo1234!", nama: "Apoteker Griya Legita", peranKode: "apoteker", outletId: OUTLET_GRL },
  { email: "apoteker.ngy@madani88.local", password: "Demo1234!", nama: "Apoteker Nagoya", peranKode: "apoteker", outletId: OUTLET_NGY },
];

for (const u of demoUsers) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { nama: u.nama },
  });

  if (createError && !createError.message.includes("already been registered")) {
    console.error(`Gagal membuat ${u.email}:`, createError.message);
    continue;
  }

  const penggunaId =
    created?.user?.id ??
    (await supabase.auth.admin.listUsers()).data.users.find((x) => x.email === u.email)?.id;

  if (!penggunaId) {
    console.error(`Tidak menemukan user id untuk ${u.email}`);
    continue;
  }

  const { data: peran } = await supabase.from("peran").select("id").eq("kode", u.peranKode).single();
  if (!peran) {
    console.error(`Peran '${u.peranKode}' belum ada. Jalankan 'supabase db reset' dulu.`);
    continue;
  }

  const { error: penugasanError } = await supabase.from("penugasan").upsert(
    { pengguna_id: penggunaId, outlet_id: u.outletId, peran_id: peran.id, status_aktif: true },
    { onConflict: "pengguna_id,outlet_id,peran_id" }
  );

  if (penugasanError) {
    console.error(`Gagal menugaskan ${u.email}:`, penugasanError.message);
    continue;
  }

  console.log(`OK  ${u.email} / ${u.password}  -> peran ${u.peranKode}, outlet ${u.outletId}`);
}
