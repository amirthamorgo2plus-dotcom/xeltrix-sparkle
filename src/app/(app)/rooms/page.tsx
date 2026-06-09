import Link from "next/link";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import StatusBadge from "@/components/StatusBadge";
import Heading from "@/components/Heading";
import RoomLabel from "@/components/RoomLabel";
import Empty from "@/components/Empty";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const session = await getSession();
  const sb = supabaseAdmin();
  const { data: rooms } = await sb
    .from("rooms")
    .select("id, room_no, status, check_in_time")
    .eq("assigned_to", session!.id)
    .neq("status", "ready")
    .order("room_no");

  return (
    <div>
      <Heading tkey="navRooms" />
      <div className="space-y-2">
        {(rooms ?? []).map((r) => (
          <Link
            key={r.id as string}
            href={`/rooms/${r.id}`}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-lg font-semibold">
                <RoomLabel no={r.room_no as string} />
              </p>
              {r.check_in_time && (
                <p className="text-xs text-slate-500">🕑 {r.check_in_time as string}</p>
              )}
            </div>
            <StatusBadge status={r.status as string} />
          </Link>
        ))}
        {(!rooms || rooms.length === 0) && <Empty tkey="noRooms" />}
      </div>
    </div>
  );
}
