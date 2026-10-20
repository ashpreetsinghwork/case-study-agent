import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Invite-only gate: every request except /login, the auth callback, and
// static/marketing assets must have a Supabase session. Also refreshes the
// session cookie on every request, per @supabase/ssr's documented pattern
// (the server client in src/lib/supabase/server.ts otherwise sees a stale
// token once the access token expires mid-session).
const PUBLIC_PATHS = ["/login", "/auth/callback", "/api/score", "/api/community"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // "/" and "/score" are marketing/lead-gen pages, so stay public so an
  // invite link's recipient (or anyone else) can see what this is, and so
  // the scorer can be shared and used without signing in.
  if (pathname === "/" || pathname === "/score" || isPublic) {
    return response;
  }

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|dummy/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
