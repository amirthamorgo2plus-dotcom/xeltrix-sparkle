"use client";
import { createClient } from "@supabase/supabase-js";

// Browser client using the public anon key.
// Used for READS + realtime only (RLS allows select; writes go via server).
let _client: ReturnType<typeof createClient> | null = null;

export function supabaseBrowser() {
  if (_client) return _client;
  _client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  return _client;
}
