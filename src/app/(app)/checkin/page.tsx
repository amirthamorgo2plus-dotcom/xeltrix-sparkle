import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Heading from "@/components/Heading";
import CheckInButton from "@/components/CheckInButton";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const session = await getSession();
  const sb = supabaseAdmin();
  const { data: rows } = await sb
    .from("attendance")
    .select("id, check_in")
    .eq("staff_id", session!.id)
    .order("check_in", { ascending: false })
    .limit(10);

  return (
    <div>
      <Heading tkey="navCheckin" />
      <CheckInButton />
      <ul className="mt-4 space-y-1">
        {(rows ?? []).map((r) => (
          <li
            key={r.id as string}
            className="rounded-xl bg-white px-4 py-2 text-sm text-slate-600 shadow-sm"
          >
            ✅ {new Date(r.check_in as string).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
