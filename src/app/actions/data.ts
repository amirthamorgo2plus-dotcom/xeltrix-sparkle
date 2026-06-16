"use server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { sendPush } from "@/lib/push";

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
  const s = await requireSession();
  const sb = supabaseAdmin();

  // Time taken = from when the room was assigned to now.
  const { data: room } = await sb
    .from("rooms")
    .select("room_no, assigned_at")
    .eq("id", roomId)
    .eq("org_id", s.orgId)
    .single();
  const now = new Date();
  const durationSecs = room?.assigned_at
    ? Math.max(0, Math.round((now.getTime() - new Date(room.assigned_at as string).getTime()) / 1000))
    : null;

  await sb
    .from("rooms")
    .update({
      status: "to_inspect",
      floor_ok: checklist.floor,
      bathroom_ok: checklist.bathroom,
      bed_ok: checklist.bed,
      bin_ok: checklist.bin,
      ac_ok: checklist.ac,
      last_cleaned: now.toISOString(),
    })
    .eq("id", roomId)
    .eq("org_id", s.orgId);

  await sb.from("cleaning_events").insert({
    org_id: s.orgId,
    room_id: roomId,
    room_no: (room?.room_no as string) ?? null,
    cleaner_id: s.id,
    cleaner_name: s.name,
    event: "cleaned",
    duration_secs: durationSecs,
  });

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
// Look up the cleaner currently assigned to a room (for event attribution).
async function assignedCleaner(roomId: string, orgId: string) {
  const sb = supabaseAdmin();
  const { data: room } = await sb
    .from("rooms")
    .select("room_no, assigned_to")
    .eq("id", roomId)
    .eq("org_id", orgId)
    .single();
  let name: string | null = null;
  if (room?.assigned_to) {
    const { data: st } = await sb
      .from("staff")
      .select("name")
      .eq("id", room.assigned_to as string)
      .single();
    name = (st?.name as string) ?? null;
  }
  return {
    roomNo: (room?.room_no as string) ?? null,
    cleanerId: (room?.assigned_to as string) ?? null,
    cleanerName: name,
  };
}

export async function approveRoom(roomId: string) {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  // safety: block approval while an open maintenance issue exists
  const { count } = await sb
    .from("maintenance")
    .select("*", { count: "exact", head: true })
    .eq("org_id", s.orgId)
    .eq("room_id", roomId)
    .eq("status", "open");
  if ((count ?? 0) > 0) throw new Error("Open maintenance — cannot approve");

  const who = await assignedCleaner(roomId, s.orgId);
  await sb.from("rooms").update({ status: "ready" }).eq("id", roomId).eq("org_id", s.orgId);
  await sb.from("cleaning_events").insert({
    org_id: s.orgId,
    room_id: roomId,
    room_no: who.roomNo,
    cleaner_id: who.cleanerId,
    cleaner_name: who.cleanerName,
    event: "approved",
  });
  await sendPush(
    { orgId: s.orgId, roles: ["owner"] },
    {
      title: "✅ Room ready",
      body: `Room ${who.roomNo ?? ""} is guest-ready`,
      url: "/dashboard",
      tag: "ready",
    }
  );
  revalidatePath("/inspect");
  revalidatePath("/dashboard");
}

export async function redoRoom(roomId: string) {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();

  const who = await assignedCleaner(roomId, s.orgId);
  // Reset the clock so the re-clean is timed from now.
  await sb
    .from("rooms")
    .update({ status: "cleaning", assigned_at: new Date().toISOString() })
    .eq("id", roomId)
    .eq("org_id", s.orgId);
  await sb.from("cleaning_events").insert({
    org_id: s.orgId,
    room_id: roomId,
    room_no: who.roomNo,
    cleaner_id: who.cleanerId,
    cleaner_name: who.cleanerName,
    event: "redo",
  });
  revalidatePath("/inspect");
}

// ---------- ISSUES ----------
export async function reportIssue(input: {
  roomId: string | null;
  roomNo: string;
  issue: string;
  category: string | null;
  urgent: boolean;
  photoUrl: string | null;
  voiceUrl: string | null;
}) {
  const s = await requireSession();
  const sb = supabaseAdmin();
  await sb.from("maintenance").insert({
    org_id: s.orgId,
    room_id: input.roomId,
    room_no: input.roomNo,
    issue: input.issue,
    category: input.category,
    urgent: input.urgent,
    photo_url: input.photoUrl,
    voice_url: input.voiceUrl,
    reported_by: s.id,
    reported_name: s.name,
    status: "open",
  });
  if (input.roomId)
    await sb
      .from("rooms")
      .update({ status: "maintenance" })
      .eq("id", input.roomId)
      .eq("org_id", s.orgId);

  await sendPush(
    { orgId: s.orgId, roles: ["supervisor", "owner"] },
    {
      title: input.urgent ? "⚠️ Urgent issue" : "🔧 New issue",
      body: `Room ${input.roomNo}: ${input.issue}`,
      url: "/issues",
      tag: "issue",
    }
  );

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
    .eq("id", issueId)
    .eq("org_id", s.orgId);
  revalidatePath("/issues");
}

// ---------- ATTENDANCE ----------
export async function checkIn() {
  const s = await requireSession();
  const sb = supabaseAdmin();
  await sb
    .from("attendance")
    .insert({ org_id: s.orgId, staff_id: s.id, staff_name: s.name, status: "present" });
  revalidatePath("/checkin");
  revalidatePath("/dashboard");
}

// ---------- OWNER / SUPERVISOR: ROOMS ----------
export async function addRoom(
  roomNo: string
): Promise<{ ok: boolean; error?: string }> {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const no = roomNo.trim();
  if (!no) return { ok: false, error: "empty" };
  const sb = supabaseAdmin();

  const { data: existing } = await sb
    .from("rooms")
    .select("id")
    .eq("org_id", s.orgId)
    .eq("room_no", no)
    .maybeSingle();
  if (existing) return { ok: false, error: "exists" };

  const { error } = await sb
    .from("rooms")
    .insert({ room_no: no, status: "ready", org_id: s.orgId });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

// Guest checked out → room needs cleaning again. Resets checklist and
// assignment so the supervisor consciously assigns a cleaner.
export async function markVacated(roomId: string) {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  await sb
    .from("rooms")
    .update({
      status: "dirty",
      floor_ok: false,
      bathroom_ok: false,
      bed_ok: false,
      bin_ok: false,
      ac_ok: false,
      assigned_to: null,
      assigned_at: null,
      last_cleaned: null,
    })
    .eq("id", roomId)
    .eq("org_id", s.orgId);
  revalidatePath("/dashboard");
  revalidatePath("/rooms");
  revalidatePath("/inspect");
}

// ---------- OWNER / SUPERVISOR: ASSIGNMENT ----------
export async function getCleaners() {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("staff")
    .select("id, name")
    .eq("org_id", s.orgId)
    .eq("role", "cleaner")
    .eq("active", true)
    .order("name");
  return (data ?? []) as { id: string; name: string }[];
}

export async function assignRoom(roomId: string, staffId: string | null) {
  const s = await requireSession();
  if (s.role === "cleaner") throw new Error("Not allowed");
  const sb = supabaseAdmin();
  await sb
    .from("rooms")
    .update({
      assigned_to: staffId,
      assigned_at: staffId ? new Date().toISOString() : null,
    })
    .eq("id", roomId)
    .eq("org_id", s.orgId);

  if (staffId) {
    const { data: room } = await sb
      .from("rooms")
      .select("room_no")
      .eq("id", roomId)
      .eq("org_id", s.orgId)
      .single();
    await sendPush(
      { orgId: s.orgId, staffId },
      {
        title: "🛏️ New room assigned",
        body: `Room ${(room?.room_no as string) ?? ""}`,
        url: "/rooms",
        tag: "assigned",
      }
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/rooms");
}

// Star-performer score: reward clean work, penalise redos.
function starScore(cleaned: number, redos: number): number {
  return cleaned * 10 - redos * 15;
}

// Top cleaner for the current month (for the dashboard badge).
export async function getStarPerformer(): Promise<
  { name: string; cleaned: number; redos: number } | null
> {
  const s = await requireSession();
  if (s.role === "cleaner") return null;
  const sb = supabaseAdmin();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data } = await sb
    .from("cleaning_events")
    .select("cleaner_name, event")
    .eq("org_id", s.orgId)
    .gte("created_at", start);

  const agg = new Map<string, { cleaned: number; redos: number }>();
  for (const e of (data ?? []) as { cleaner_name: string; event: string }[]) {
    const name = e.cleaner_name ?? "—";
    if (!agg.has(name)) agg.set(name, { cleaned: 0, redos: 0 });
    if (e.event === "cleaned") agg.get(name)!.cleaned++;
    else if (e.event === "redo") agg.get(name)!.redos++;
  }
  let best: { name: string; cleaned: number; redos: number } | null = null;
  for (const [name, v] of agg) {
    if (v.cleaned === 0) continue;
    if (!best || starScore(v.cleaned, v.redos) > starScore(best.cleaned, best.redos)) {
      best = { name, cleaned: v.cleaned, redos: v.redos };
    }
  }
  return best;
}
