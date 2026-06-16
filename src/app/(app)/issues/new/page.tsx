import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import ReportIssueForm from "@/components/ReportIssueForm";

export const dynamic = "force-dynamic";

export default async function NewIssue({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; no?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const sb = supabaseAdmin();
  const { data: rooms } = await sb
    .from("rooms")
    .select("id, room_no")
    .eq("org_id", session!.orgId)
    .order("room_no");

  return (
    <ReportIssueForm
      rooms={(rooms ?? []).map((r) => ({
        id: r.id as string,
        room_no: r.room_no as string,
      }))}
      prefillRoomId={sp.room ?? null}
    />
  );
}
