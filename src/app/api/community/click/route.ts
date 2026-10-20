import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const SOURCES = ["homepage", "score"] as const;
const CTAS = ["join", "already_in"] as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const source = body?.source;
  const cta = body?.cta;
  const sessionId = body?.sessionId;

  if (
    !SOURCES.includes(source) ||
    !CTAS.includes(cta) ||
    typeof sessionId !== "string" ||
    !sessionId
  ) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await getDb()
    .from("community_clicks")
    .insert({ source, cta, session_id: sessionId, user_id: user?.id ?? null });

  if (error) {
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
