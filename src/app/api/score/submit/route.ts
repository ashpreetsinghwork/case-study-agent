import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { scoreOf, summarize, type Answers } from "@/lib/portfolio-score";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const sessionId = body?.sessionId;
  const answers = body?.answers;

  if (
    typeof sessionId !== "string" ||
    !sessionId ||
    typeof answers !== "object" ||
    answers === null
  ) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const scanScores: number[] | undefined = Array.isArray(body?.scores) ? body.scores : undefined;
  const result = scanScores ? summarize(scanScores) : scoreOf(answers as Answers);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const db = getDb();

  const { count } = await db
    .from("community_clicks")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);

  const { error } = await db.from("scorecard_submissions").insert({
    session_id: sessionId,
    user_id: user?.id ?? null,
    answers,
    scores: result.scores,
    total: result.total,
    percent: result.percent,
    band: result.band.name,
    summary: typeof body?.summary === "string" ? body.summary : null,
    theme_fixes: Array.isArray(body?.themeFixes) ? body.themeFixes : null,
    analyze_error: typeof body?.analyzeError === "string" ? body.analyzeError : null,
    joined_community: (count ?? 0) > 0,
  });

  if (error) {
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
