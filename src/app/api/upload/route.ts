import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const bucket = (form.get("bucket") as string) || "photos";
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  if (!["photos", "voice"].includes(bucket))
    return NextResponse.json({ error: "bad bucket" }, { status: 400 });

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${session.id}/${Date.now()}-${Math.round(
    performance.now()
  )}.${ext}`;

  const sb = supabaseAdmin();
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage.from(bucket).upload(path, buf, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Tally storage usage for the org (best-effort, atomic via RPC).
  try {
    await sb.rpc("add_org_storage", { p_org: session.orgId, p_bytes: buf.length });
  } catch {
    // ignore — usage accounting must not block uploads
  }

  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
