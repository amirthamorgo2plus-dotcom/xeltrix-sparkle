"use server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

async function requireSession() {
  const s = await getSession();
  if (!s) throw new Error("Not logged in");
  return s;
}

// ---------- CLEANER ----------
export async function markCleaned(
  roomId: string,
  checklist: { floor: boolean; bathroom: boolean; bed: boolean; bin: boolean; ac: boolean }
) {
  await requireSession();
  const sb = supabaseAdmin();
  await sb
    .from("rooms")
    .update({
      status: "to_inspect",
      floor_ok: checklist.floor,
      bathroom_ok: checklist.bathroom,
      bed_ok: checklist.bed,
      bin_ok: checklist.bin,
      ac_ok: checklist.ac,
      last_cleaned: new Date().toISOString(),
    })
    .eq("id", roomId);
  revalidatePath("/rooms");
  revalidatePath("/inspect");
}

export async function addRoomPhoto(roomId: string, url: string) {
  const s = await requireSession();
  const sb = supabaseAdmin();
  await sb.from("room_photos").insert({ room_id: roomId, url, uploaded_by: s.id });
  revalidatePath(`/rooms/${roomId}`);
}

// ---------- SUPERVISOR ----------
export async function approveRoom(roomId: string) {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  // safety: block approval while an open maintenance issue exists
  const { count } = await sb
    .from("maintenance")
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)
    .eq("status", "open");
  if ((count ?? 0) > 0) throw new Error("Open maintenance — cannot approve");
  await sb.from("rooms").update({ status: "ready" }).eq("id", roomId);
  revalidatePath("/inspect");
  revalidatePath("/dashboard");
}

export async function redoRoom(roomId: string) {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  await sb.from("rooms").update({ status: "cleaning" }).eq("id", roomId);
  revalidatePath("/inspect");
}

// ---------- ISSUES ----------
export async function reportIssue(input: {
  roomId: string | null;
  roomNo: string;
  issue: string;
  photoUrl: string | null;
  voiceUrl: string | null;
}) {
  const s = await requireSession();
  const sb = supabaseAdmin();
  await sb.from("maintenance").insert({
    room_id: input.roomId,
    room_no: input.roomNo,
    issue: input.issue,
    photo_url: input.photoUrl,
    voice_url: input.voiceUrl,
    reported_by: s.id,
    reported_name: s.name,
    status: "open",
  });
  if (input.roomId)
    await sb.from("rooms").update({ status: "maintenance" }).eq("id", input.roomId);
  revalidatePath("/issues");
  revalidatePath("/dashboard");
}

export async function markFixed(issueId: string) {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  await sb
    .from("maintenance")
    .update({ status: "fixed", fixed_at: new Date().toISOString() })
    .eq("id", issueId);
  revalidatePath("/issues");
}

// ---------- ATTENDANCE ----------
export async function checkIn() {
  const s = await requireSession();
  const sb = supabaseAdmin();
  await sb.from("attendance").insert({ staff_id: s.id, staff_name: s.name, status: "present" });
  revalidatePath("/checkin");
  revalidatePath("/dashboard");
}

// ---------- OWNER / SUPERVISOR: ASSIGNMENT ----------
export async function getCleaners() {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("staff")
    .select("id, name")
    .eq("role", "cleaner")
    .eq("active", true)
    .order("name");
  return (data ?? []) as { id: string; name: string }[];
}

export async function assignRoom(roomId: string, staffId: string | null) {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  await sb.from("rooms").update({ assigned_to: staffId }).eq("id", roomId);
  revalidatePath("/dashboard");
  revalidatePath("/rooms");
}
