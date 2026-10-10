import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic-link landing target — exchanges the one-time code for a session
// cookie, then sends the user on to wherever they were headed.
export async function GET(request: Request) {
  const { searchParams, origin: internalOrigin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Behind a reverse proxy (Railway, etc.), request.url's origin is the
  // internal address the Node process sees (e.g. localhost:8080), not the
  // public domain — use the known-good public URL instead when it's set.
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? internalOrigin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
