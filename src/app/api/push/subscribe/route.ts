import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const sub = await req.json().catch(() => null);
  const endpoint = sub?.endpoint as string | undefined;
  const p256dh = sub?.keys?.p256dh as string | undefined;
  const auth = sub?.keys?.auth as string | undefined;
  if (!endpoint || !p256dh || !auth)
    return NextResponse.json({ error: "bad subscription" }, { status: 400 });

  const sb = supabaseAdmin();
  // Upsert by endpoint so re-subscribing updates the owner/keys.
  await sb
    .from("push_subscriptions")
    .upsert(
      {
        endpoint,
        p256dh,
        auth,
        staff_id: session.id,
        role: session.role,
        org_id: session.orgId,
      },
      { onConflict: "endpoint" }
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const sub = await req.json().catch(() => null);
  const endpoint = sub?.endpoint as string | undefined;
  if (!endpoint) return NextResponse.json({ error: "bad" }, { status: 400 });
  const sb = supabaseAdmin();
  await sb.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}
