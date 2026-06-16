import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Heading, { SubHeading } from "@/components/Heading";
import StatusBadge from "@/components/StatusBadge";
import RoomLabel from "@/components/RoomLabel";
import StatTile from "@/components/StatTile";
import PresentToday, { PresentPerson } from "@/components/PresentToday";
import AssignSelect from "@/components/AssignSelect";
import AddRoom from "@/components/AddRoom";
import VacateButton from "@/components/VacateButton";
import StarBadge from "@/components/StarBadge";
import TLabel from "@/components/TLabel";
import { getCleaners, getStarPerformer } from "@/app/actions/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  const orgId = session.orgId;
  const sb = supabaseAdmin();
  const [{ data: rooms }, openIssues, { data: present }, cleaners, star] = await Promise.all([
    sb
      .from("rooms")
      .select("id, room_no, status, assigned_to")
      .eq("org_id", orgId)
      .order("room_no"),
    sb
      .from("maintenance")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("status", "open"),
    sb
      .from("attendance")
      .select("id, staff_name, check_in")
      .eq("org_id", orgId)
      .gte("check_in", new Date(new Date().toDateString()).toISOString())
      .order("check_in", { ascending: true }),
    getCleaners(),
    getStarPerformer(),
  ]);

  const ready = (rooms ?? []).filter((r) => r.status === "ready").length;
  const toInspect = (rooms ?? []).filter((r) => r.status === "to_inspect").length;

  // One entry per person (earliest check-in of the day).
  const seen = new Set<string>();
  const people: PresentPerson[] = [];
  for (const row of present ?? []) {
    const name = (row.staff_name as string) ?? "—";
    if (seen.has(name)) continue;
    seen.add(name);
    people.push({ name, check_in: row.check_in as string });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading tkey="navDashboard" />
        {session?.role === "owner" && (
          <div className="mb-3 flex gap-2">
            <Link
              href="/feedback"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700"
            >
              💬
            </Link>
            <Link
              href="/staff"
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700"
            >
              👥 <TLabel tkey="manageStaff" />
            </Link>
          </div>
        )}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatTile value={ready} tkey="roomsReady" color="emerald" />
        <StatTile value={toInspect} tkey="awaitingInspection" color="blue" />
        <StatTile value={openIssues.count ?? 0} tkey="openIssues" color="rose" />
        <StatTile value={people.length} tkey="presentTodayTitle" color="teal" />
      </div>

      <StarBadge star={star} />

      <PresentToday people={people} />

      <div className="mb-2 flex items-center justify-between">
        <SubHeading tkey="roomBoard" />
        <AddRoom />
      </div>
      <div className="space-y-2">
        {(rooms ?? []).map((r) => (
          <div
            key={r.id as string}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="min-w-0">
              <Link
                href={`/rooms/${r.id}`}
                className="font-semibold text-stone-800 underline-offset-2 hover:underline"
              >
                <RoomLabel no={r.room_no as string} />
              </Link>
              <div className="mt-1.5">
                <AssignSelect
                  roomId={r.id as string}
                  cleaners={cleaners}
                  assignedTo={(r.assigned_to as string) ?? null}
                />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Link href={`/rooms/${r.id}`}>
                <StatusBadge status={r.status as string} />
              </Link>
              {r.status === "ready" && <VacateButton roomId={r.id as string} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
