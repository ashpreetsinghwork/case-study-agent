import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client, scoped to the anon key (RLS-governed) —
// used only for auth (magic-link sign-in, sign-out). Never use this for
// project data; that stays server-side via src/lib/db.ts's service-role
// client, same as before auth was added.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
