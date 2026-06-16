import Link from "next/link";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Heading from "@/components/Heading";
import Empty from "@/components/Empty";
import IssueCard from "@/components/IssueCard";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const session = await getSession();
  const sb = supabaseAdmin();
  const { data: issues } = await sb
    .from("maintenance")
    .select("id, room_no, issue, category, urgent, photo_url, voice_url, reported_name, status, created_at")
    .eq("org_id", session!.orgId)
    .order("status", { ascending: true })
    .order("urgent", { ascending: false })
    .order("created_at", { ascending: false });

  const canFix = session!.role !== "cleaner";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Heading tkey="navIssues" />
      </div>

      <Link
        href="/issues/new"
        className="mb-4 block w-full rounded-2xl bg-rose-600 py-3 text-center font-semibold text-white"
      >
        🔧 ＋
      </Link>

      <div className="space-y-2">
        {(issues ?? []).map((m) => (
          <IssueCard
            key={m.id as string}
            issue={{
              id: m.id as string,
              room_no: (m.room_no as string) ?? "",
              issue: m.issue as string,
              category: (m.category as string) ?? null,
              urgent: (m.urgent as boolean) ?? false,
              photo_url: (m.photo_url as string) ?? null,
              voice_url: (m.voice_url as string) ?? null,
              reported_name: (m.reported_name as string) ?? "",
              status: m.status as string,
            }}
            canFix={canFix}
          />
        ))}
        {(!issues || issues.length === 0) && <Empty tkey="noItems" />}
      </div>
    </div>
  );
}
