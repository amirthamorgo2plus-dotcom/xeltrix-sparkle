"use server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { setSession, clearSession, type Session } from "@/lib/session";

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
