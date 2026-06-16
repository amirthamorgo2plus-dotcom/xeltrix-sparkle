import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import InspectActions from "@/components/InspectActions";

export const dynamic = "force-dynamic";

export default async function InspectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const sb = supabaseAdmin();
  const { data: room } = await sb
    .from("rooms")
    .select("*")
    .eq("id", id)
    .eq("org_id", session!.orgId)
    .single();
  if (!room) notFound();
  const { data: photos } = await sb
    .from("room_photos")
    .select("url")
    .eq("room_id", id)
    .order("created_at", { ascending: false });
  const { count: openIssues } = await sb
    .from("maintenance")
    .select("*", { count: "exact", head: true })
    .eq("org_id", session!.orgId)
    .eq("room_id", id)
    .eq("status", "open");

  return (
    <InspectActions
      room={{
        id: room.id as string,
        room_no: room.room_no as string,
        floor: room.floor_ok as boolean,
        bathroom: room.bathroom_ok as boolean,
        bed: room.bed_ok as boolean,
        bin: room.bin_ok as boolean,
        ac: room.ac_ok as boolean,
      }}
      photos={(photos ?? []).map((p) => p.url as string)}
      openIssues={openIssues ?? 0}
    />
  );
}
