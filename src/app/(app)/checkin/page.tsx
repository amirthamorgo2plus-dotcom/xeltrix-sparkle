import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Heading from "@/components/Heading";
import CheckInButton from "@/components/CheckInButton";
import PresentToday, { PresentPerson } from "@/components/PresentToday";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const session = await getSession();
  const sb = supabaseAdmin();
  const canSeeAll =
    session!.role === "owner" || session!.role === "supervisor";

  const [{ data: rows }, todayRes] = await Promise.all([
    sb
      .from("attendance")
      .select("id, check_in")
      .eq("staff_id", session!.id)
      .order("check_in", { ascending: false })
      .limit(10),
    canSeeAll
      ? sb
          .from("attendance")
          .select("staff_name, check_in")
          .gte("check_in", new Date(new Date().toDateString()).toISOString())
          .order("check_in", { ascending: true })
      : Promise.resolve({ data: [] as { staff_name: string; check_in: string }[] }),
  ]);

  // One entry per person (earliest check-in of the day).
  const seen = new Set<string>();
  const people: PresentPerson[] = [];
  for (const row of todayRes.data ?? []) {
    const name = (row.staff_name as string) ?? "—";
    if (seen.has(name)) continue;
    seen.add(name);
    people.push({ name, check_in: row.check_in as string });
  }

  return (
    <div>
      <Heading tkey="navCheckin" />
      <CheckInButton />

      {canSeeAll && (
        <div className="mt-5">
          <PresentToday people={people} />
        </div>
      )}

      <ul className="mt-4 space-y-1">
        {(rows ?? []).map((r) => (
          <li
            key={r.id as string}
            className="rounded-xl bg-white px-4 py-2 text-sm text-stone-600 shadow-sm"
          >
            ✅ {new Date(r.check_in as string).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
