import "server-only";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
// Node < 22 has no global WebSocket; Supabase client needs one on the server.
if (!(globalThis as { WebSocket?: unknown }).WebSocket) {
  (globalThis as { WebSocket?: unknown }).WebSocket = ws;
}

// Server-only Supabase client using the SERVICE ROLE key.
// Bypasses RLS — use ONLY inside server actions / route handlers,
// never imported into client components.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
