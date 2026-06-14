"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { setSession, clearSession, getSession, type Session } from "@/lib/session";

// Public-safe list of staff for the login name-picker (no PIN hashes).
export async function getStaffList() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("staff")
    .select("id, name, role")
    .eq("active", true)
    .order("name");
  return (data ?? []) as { id: string; name: string; role: string }[];
}

export async function login(
  staffId: string,
  pin: string
): Promise<{ ok: boolean; role?: string }> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("staff")
    .select("id, name, role, pin_hash, language")
    .eq("id", staffId)
    .eq("active", true)
    .single();

  if (!data) return { ok: false };
  const match = await bcrypt.compare(pin, data.pin_hash as string);
  if (!match) return { ok: false };

  const s: Session = {
    id: data.id as string,
    name: data.name as string,
    role: data.role as Session["role"],
    lang: (data.language as Session["lang"]) ?? "en",
  };
  await setSession(s);
  return { ok: true, role: s.role };
}

export async function logout() {
  await clearSession();
}

// ---------- OWNER: STAFF MANAGEMENT ----------
async function requireOwner() {
  const s = await getSession();
  if (!s || s.role !== "owner") throw new Error("Owners only");
  return s;
}

// Full staff list (owner only) — includes role + active, never PIN hashes.
export async function getAllStaff() {
  await requireOwner();
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("staff")
    .select("id, name, role, language, active")
    .order("active", { ascending: false })
    .order("name");
  return (data ?? []) as {
    id: string;
    name: string;
    role: string;
    language: string;
    active: boolean;
  }[];
}

export async function addStaff(input: {
  name: string;
  role: string;
  pin: string;
  language: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireOwner();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "name" };
  if (!/^\d{4}$/.test(input.pin)) return { ok: false, error: "pin" };
  if (!["cleaner", "supervisor", "owner"].includes(input.role))
    return { ok: false, error: "role" };
  const lang = ["en", "ta", "hi"].includes(input.language) ? input.language : "en";

  const sb = supabaseAdmin();
  const pin_hash = await bcrypt.hash(input.pin, 10);
  const { error } = await sb.from("staff").insert({
    name,
    role: input.role,
    pin_hash,
    language: lang,
    active: true,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setStaffActive(staffId: string, active: boolean) {
  await requireOwner();
  const sb = supabaseAdmin();
  await sb.from("staff").update({ active }).eq("id", staffId);
  revalidatePath("/staff");
  revalidatePath("/dashboard");
}
