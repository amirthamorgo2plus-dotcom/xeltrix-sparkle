import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import RoomCleaning from "@/components/RoomCleaning";
import RoomOverview, { RoomIssue } from "@/components/RoomOverview";

export const dynamic = "force-dynamic";

export default async function RoomDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const sb = supabaseAdmin();
  const { data: room } = await sb.from("rooms").select("*").eq("id", id).single();
  if (!room) notFound();
  const { data: photos } = await sb
    .from("room_photos")
    .select("id, url")
    .eq("room_id", id)
    .order("created_at", { ascending: false });

  const photoUrls = (photos ?? []).map((p) => p.url as string);

  // Owner / supervisor: read-only overview with photos + issues (image + audio).
  if (session && session.role !== "cleaner") {
    const { data: issues } = await sb
      .from("maintenance")
      .select("id, room_no, issue, photo_url, voice_url, reported_name, status")
      .eq("room_id", id)
      .order("created_at", { ascending: false });

    return (
      <RoomOverview
        roomNo={room.room_no as string}
        status={room.status as string}
        photos={photoUrls}
        issues={(issues ?? []) as RoomIssue[]}
        canFix={true}
        backHref={session.role === "owner" ? "/dashboard" : "/inspect"}
      />
    );
  }

  // Cleaner: the cleaning checklist + photo capture.
  return (
    <RoomCleaning
      room={{
        id: room.id as string,
        room_no: room.room_no as string,
        status: room.status as string,
        floor: room.floor_ok as boolean,
        bathroom: room.bathroom_ok as boolean,
        bed: room.bed_ok as boolean,
        bin: room.bin_ok as boolean,
        ac: room.ac_ok as boolean,
      }}
      photos={photoUrls}
    />
  );
}
