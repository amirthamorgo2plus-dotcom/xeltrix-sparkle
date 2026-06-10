// Seed initial staff (with hashed PINs) + sample rooms.
// Run once:  node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import ws from "ws";
// Node < 22 has no global WebSocket; Supabase realtime needs one.
if (!globalThis.WebSocket) globalThis.WebSocket = ws;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing env. Run with: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const hash = (pin) => bcrypt.hashSync(pin, 10);

// ---- EDIT THESE for your real staff ----
const staff = [
  { name: "Anitha",  role: "owner",      pin: "1234", language: "en" },
  { name: "Harini",  role: "supervisor", pin: "1111", language: "ta" },
  { name: "Suresh",  role: "cleaner",    pin: "2222", language: "ta" },
  { name: "Kumar",   role: "cleaner",    pin: "3333", language: "hi" },
];

async function main() {
  console.log("Seeding staff…");
  for (const s of staff) {
    const { error } = await sb.from("staff").insert({
      name: s.name,
      role: s.role,
      pin_hash: hash(s.pin),
      language: s.language,
      active: true,
    });
    if (error) console.error("  staff", s.name, error.message);
    else console.log("  +", s.name, `(${s.role}) PIN ${s.pin}`);
  }

  // get cleaner ids to assign rooms
  const { data: cleaners } = await sb
    .from("staff")
    .select("id, name")
    .eq("role", "cleaner");
  const suresh = cleaners?.find((c) => c.name === "Suresh")?.id ?? null;
  const kumar = cleaners?.find((c) => c.name === "Kumar")?.id ?? null;

  console.log("Seeding rooms…");
  const rooms = [
    { room_no: "101", status: "dirty", assigned_to: suresh },
    { room_no: "102", status: "dirty", assigned_to: suresh },
    { room_no: "103", status: "dirty", assigned_to: kumar },
    { room_no: "104", status: "dirty", assigned_to: kumar },
    { room_no: "105", status: "dirty", assigned_to: suresh },
  ];
  for (const r of rooms) {
    const { error } = await sb.from("rooms").insert(r);
    if (error) console.error("  room", r.room_no, error.message);
    else console.log("  + Room", r.room_no);
  }

  console.log("\nDone! Login PINs:");
  staff.forEach((s) => console.log(`  ${s.name} (${s.role}) → ${s.pin}`));
}
main();
