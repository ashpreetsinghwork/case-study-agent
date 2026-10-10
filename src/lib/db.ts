import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Postgres access (projects, versions, stage status, scores) via Supabase.
// Created lazily so importing this module doesn't crash build/dev when
// SUPABASE_URL isn't set yet — it only throws once actually called.
let client: SupabaseClient | undefined;

export function getDb(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return client;
}
