import "server-only";
import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase/admin";

let configured = false;
function ensureConfigured(): boolean {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@example.com",
      pub,
      priv
    );
    configured = true;
  }
  return true;
}

type Payload = { title: string; body: string; url?: string; tag?: string };
type Target = { roles?: string[]; staffId?: string };

// Fire-and-forget push to staff by role(s) and/or a specific staff id.
// Never throws — push must not break the core action.
export async function sendPush(target: Target, payload: Payload) {
  try {
    if (!ensureConfigured()) return;
    const sb = supabaseAdmin();
    let q = sb.from("push_subscriptions").select("id, endpoint, p256dh, auth");
    if (target.staffId) {
      q = q.eq("staff_id", target.staffId);
    } else if (target.roles && target.roles.length) {
      q = q.in("role", target.roles);
    } else {
      return;
    }
    const { data } = await q;
    if (!data?.length) return;

    const body = JSON.stringify(payload);
    await Promise.all(
      data.map(async (s) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: s.endpoint as string,
              keys: { p256dh: s.p256dh as string, auth: s.auth as string },
            },
            body
          );
        } catch (err: unknown) {
          const code = (err as { statusCode?: number })?.statusCode;
          // Subscription gone — clean it up.
          if (code === 404 || code === 410) {
            await sb.from("push_subscriptions").delete().eq("id", s.id as string);
          }
        }
      })
    );
  } catch {
    // swallow — never break the caller
  }
}
