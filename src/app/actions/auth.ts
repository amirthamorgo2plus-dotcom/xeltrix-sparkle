"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  setSession,
  clearSession,
  getSession,
  setAdminCookie,
  clearAdminCookie,
  isAdmin,
  type Session,
} from "@/lib/session";

// Look up an org by its slug (for the per-hotel login page).
export async function getOrgBySlug(slug: string) {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("orgs")
    .select("id, name, slug, logo_url")
    .eq("slug", slug)
    .maybeSingle();
  return (
    (data as { id: string; name: string; slug: string; logo_url: string | null } | null) ??
    null
  );
}

// Public-safe staff list for one org's login name-picker (no PIN hashes).
export async function getStaffList(orgId: string) {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("staff")
    .select("id, name, role")
    .eq("org_id", orgId)
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
    .select("id, name, role, pin_hash, language, org_id, orgs(slug)")
    .eq("id", staffId)
    .eq("active", true)
    .single();

  if (!data) return { ok: false };
  const match = await bcrypt.compare(pin, data.pin_hash as string);
  if (!match) return { ok: false };

  const org = data.orgs as unknown as { slug: string } | null;
  const s: Session = {
    id: data.id as string,
    name: data.name as string,
    role: data.role as Session["role"],
    lang: (data.language as Session["lang"]) ?? "en",
    orgId: data.org_id as string,
    orgSlug: org?.slug ?? "",
  };
  await setSession(s);
  // Track last activity per hotel (for the super-admin dashboard).
  await sb
    .from("orgs")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", s.orgId);
  return { ok: true, role: s.role };
}

export async function logout() {
  await clearSession();
}

// ---------- OWNER: STAFF MANAGEMENT (scoped to the owner's org) ----------
async function requireOwner() {
  const s = await getSession();
  if (!s || s.role !== "owner") throw new Error("Owners only");
  return s;
}

export async function getAllStaff() {
  const s = await requireOwner();
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("staff")
    .select("id, name, role, language, active")
    .eq("org_id", s.orgId)
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
  const s = await requireOwner();
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
    org_id: s.orgId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateStaff(input: {
  id: string;
  name: string;
  role: string;
  language: string;
  pin?: string; // optional — only set to reset
}): Promise<{ ok: boolean; error?: string }> {
  const s = await requireOwner();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "name" };
  if (!["cleaner", "supervisor", "owner"].includes(input.role))
    return { ok: false, error: "role" };
  const lang = ["en", "ta", "hi"].includes(input.language) ? input.language : "en";

  const patch: Record<string, unknown> = { name, role: input.role, language: lang };
  if (input.pin && input.pin.length > 0) {
    if (!/^\d{4}$/.test(input.pin)) return { ok: false, error: "pin" };
    patch.pin_hash = await bcrypt.hash(input.pin, 10);
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("staff")
    .update(patch)
    .eq("id", input.id)
    .eq("org_id", s.orgId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/staff");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setStaffActive(staffId: string, active: boolean) {
  const s = await requireOwner();
  const sb = supabaseAdmin();
  await sb
    .from("staff")
    .update({ active })
    .eq("id", staffId)
    .eq("org_id", s.orgId);
  revalidatePath("/staff");
  revalidatePath("/dashboard");
}

// ---------- SUPER ADMIN: PROVISION A NEW HOTEL ----------
export async function createOrg(input: {
  orgName: string;
  slug: string;
  ownerName: string;
  ownerPin: string;
  logoUrl?: string | null;
  address?: string | null;
}): Promise<{ ok: boolean; error?: string; slug?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "auth" };

  const orgName = input.orgName.trim();
  const slug = input.slug.trim().toLowerCase();
  const ownerName = input.ownerName.trim();
  if (!orgName || !ownerName) return { ok: false, error: "fields" };
  if (!/^[a-z0-9-]{2,30}$/.test(slug)) return { ok: false, error: "slug" };
  if (!/^\d{4}$/.test(input.ownerPin)) return { ok: false, error: "pin" };

  const sb = supabaseAdmin();
  const { data: exists } = await sb
    .from("orgs")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (exists) return { ok: false, error: "slugExists" };

  const { data: org, error: orgErr } = await sb
    .from("orgs")
    .insert({
      name: orgName,
      slug,
      logo_url: input.logoUrl ?? null,
      address: input.address?.trim() || null,
    })
    .select("id")
    .single();
  if (orgErr || !org) return { ok: false, error: orgErr?.message ?? "org" };

  const pin_hash = await bcrypt.hash(input.ownerPin, 10);
  const { error: staffErr } = await sb.from("staff").insert({
    name: ownerName,
    role: "owner",
    pin_hash,
    language: "en",
    active: true,
    org_id: org.id,
  });
  if (staffErr) return { ok: false, error: staffErr.message };

  return { ok: true, slug };
}

export type AdminHotel = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  lastLoginAt: string | null;
  storageBytes: number;
  members: number;
  logoUrl: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
};
export type AdminFeedback = {
  id: string;
  orgName: string;
  staffName: string | null;
  message: string;
  resolved: boolean;
  createdAt: string;
};

function checkAdmin(key: string): boolean {
  const expected = process.env.ADMIN_KEY;
  return !!expected && key === expected;
}

// Verify the admin key once and set a signed admin cookie.
export async function adminLogin(key: string): Promise<{ ok: boolean }> {
  if (!checkAdmin(key)) return { ok: false };
  await setAdminCookie();
  return { ok: true };
}

export async function adminLogout() {
  await clearAdminCookie();
}

// Super-admin dashboard data (gated by the admin cookie).
export async function getAdminData(): Promise<{
  ok: boolean;
  hotels?: AdminHotel[];
  feedback?: AdminFeedback[];
}> {
  if (!(await isAdmin())) return { ok: false };
  const sb = supabaseAdmin();

  const [{ data: orgs }, { data: staff }, { data: fb }] = await Promise.all([
    sb
      .from("orgs")
      .select(
        "id, name, slug, created_at, last_login_at, storage_bytes, logo_url, address, lat, lng"
      ),
    sb.from("staff").select("org_id").eq("active", true),
    sb
      .from("app_feedback")
      .select("id, message, resolved, staff_name, created_at, orgs(name)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const counts = new Map<string, number>();
  for (const s of (staff ?? []) as { org_id: string }[])
    counts.set(s.org_id, (counts.get(s.org_id) ?? 0) + 1);

  const hotels: AdminHotel[] = ((orgs ?? []) as Record<string, unknown>[])
    .map((o) => ({
      id: o.id as string,
      name: o.name as string,
      slug: o.slug as string,
      createdAt: o.created_at as string,
      lastLoginAt: (o.last_login_at as string) ?? null,
      storageBytes: Number(o.storage_bytes ?? 0),
      members: counts.get(o.id as string) ?? 0,
      logoUrl: (o.logo_url as string) ?? null,
      address: (o.address as string) ?? null,
      lat: (o.lat as number) ?? null,
      lng: (o.lng as number) ?? null,
    }))
    .sort((a, b) => (b.lastLoginAt ?? "").localeCompare(a.lastLoginAt ?? ""));

  const feedback: AdminFeedback[] = ((fb ?? []) as Record<string, unknown>[]).map(
    (f) => ({
      id: f.id as string,
      orgName: (f.orgs as { name?: string } | null)?.name ?? "—",
      staffName: (f.staff_name as string) ?? null,
      message: f.message as string,
      resolved: !!f.resolved,
      createdAt: f.created_at as string,
    })
  );

  return { ok: true, hotels, feedback };
}

export async function resolveFeedback(id: string) {
  if (!(await isAdmin())) return { ok: false };
  const sb = supabaseAdmin();
  await sb.from("app_feedback").update({ resolved: true }).eq("id", id);
  return { ok: true };
}

// ---------- OWNER: HOTEL PROFILE (logo + location) ----------
export async function getMyOrg(): Promise<{
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
} | null> {
  const s = await requireOwner();
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("orgs")
    .select("name, slug, logo_url, address, lat, lng")
    .eq("id", s.orgId)
    .single();
  if (!data) return null;
  return {
    name: data.name as string,
    slug: data.slug as string,
    logoUrl: (data.logo_url as string) ?? null,
    address: (data.address as string) ?? null,
    lat: (data.lat as number) ?? null,
    lng: (data.lng as number) ?? null,
  };
}

export async function updateOrgProfile(input: {
  logoUrl?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}): Promise<{ ok: boolean }> {
  const s = await requireOwner();
  const sb = supabaseAdmin();
  const patch: Record<string, unknown> = {
    address: input.address?.trim() || null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  };
  if (input.logoUrl !== undefined) patch.logo_url = input.logoUrl;
  await sb.from("orgs").update(patch).eq("id", s.orgId);
  revalidatePath("/hotel");
  revalidatePath("/dashboard");
  return { ok: true };
}
