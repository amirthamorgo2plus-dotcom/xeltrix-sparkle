import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import StatusBadge from "@/components/StatusBadge";
import Heading from "@/components/Heading";
import RoomLabel from "@/components/RoomLabel";
import Empty from "@/components/Empty";

export const dynamic = "force-dynamic";

export default async function InspectPage() {
  const session = await getSession();
  const sb = supabaseAdmin();
  const { data: rooms } = await sb
    .from("rooms")
    .select("id, room_no, status")
    .eq("org_id", session!.orgId)
    .eq("status", "to_inspect")
    .order("room_no");

  return (
    <div>
      <Heading tkey="navInspect" />
      <div className="space-y-2">
        {(rooms ?? []).map((r) => (
          <Link
            key={r.id as string}
            href={`/inspect/${r.id}`}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <p className="text-lg font-semibold">
              <RoomLabel no={r.room_no as string} />
            </p>
            <StatusBadge status={r.status as string} />
          </Link>
        ))}
        {(!rooms || rooms.length === 0) && <Empty tkey="noItems" />}
      </div>
    </div>
  );
}
