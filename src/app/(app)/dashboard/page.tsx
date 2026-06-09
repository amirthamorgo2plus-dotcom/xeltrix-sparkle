import { supabaseAdmin } from "@/lib/supabase/admin";
import Heading from "@/components/Heading";
import StatusBadge from "@/components/StatusBadge";
import RoomLabel from "@/components/RoomLabel";
import StatTile from "@/components/StatTile";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sb = supabaseAdmin();
  const [{ data: rooms }, openIssues, { data: present }] = await Promise.all([
    sb.from("rooms").select("id, room_no, status").order("room_no"),
    sb
      .from("maintenance")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    sb
      .from("attendance")
      .select("id, staff_name, check_in")
      .gte("check_in", new Date(new Date().toDateString()).toISOString())
      .order("check_in", { ascending: false }),
  ]);

  const ready = (rooms ?? []).filter((r) => r.status === "ready").length;
  const toInspect = (rooms ?? []).filter((r) => r.status === "to_inspect").length;

  return (
    <div>
      <Heading tkey="navDashboard" />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatTile value={ready} tkey="roomsReady" color="emerald" />
        <StatTile value={toInspect} tkey="awaitingInspection" color="blue" />
        <StatTile value={openIssues.count ?? 0} tkey="openIssues" color="rose" />
        <StatTile value={(present ?? []).length} tkey="presentTodayTitle" color="teal" />
      </div>

      <div className="space-y-2">
        {(rooms ?? []).map((r) => (
          <div
            key={r.id as string}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <p className="font-semibold">
              <RoomLabel no={r.room_no as string} />
            </p>
            <StatusBadge status={r.status as string} />
          </div>
        ))}
      </div>
    </div>
  );
}
