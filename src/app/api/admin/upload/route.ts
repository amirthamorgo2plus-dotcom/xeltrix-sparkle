import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/session";

// Logo upload for provisioning — gated by the super-admin cookie.
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "unauth" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `logos/${Date.now()}-${Math.round(performance.now())}.${ext}`;
  const sb = supabaseAdmin();
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage.from("photos").upload(path, buf, {
    contentType: file.type || "image/png",
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = sb.storage.from("photos").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
