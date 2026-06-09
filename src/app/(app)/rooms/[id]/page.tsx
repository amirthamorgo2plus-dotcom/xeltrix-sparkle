import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import RoomCleaning from "@/components/RoomCleaning";

export const dynamic = "force-dynamic";

export default async function RoomDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = supabaseAdmin();
  const { data: room } = await sb.from("rooms").select("*").eq("id", id).single();
  if (!room) notFound();
  const { data: photos } = await sb
    .from("room_photos")
    .select("id, url")
    .eq("room_id", id)
    .order("created_at", { ascending: false });

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
      photos={(photos ?? []).map((p) => p.url as string)}
    />
  );
}
