import { NextResponse } from "next/server";
import { writeStageStatus } from "@/lib/storage";
import { runArchitect, resetFixRoundCount } from "@/pipeline/architect";
import { runReviewWithAutoFix } from "@/pipeline/reviewer";
import { notifyCaseStudyReady } from "@/pipeline/notify";
import { markProjectStatus } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";
import { isProjectOwner } from "@/lib/ownership";

// "Rework entire case study" — regenerates the draft from the same chosen
// strategy (doesn't re-ask the A/B pick), then reviews + auto-fixes again.
// Same in-process, fire-and-forget pattern as select/route.ts.
async function reworkInBackground(projectId: string) {
  await resetFixRoundCount(projectId);

  try {
    await runArchitect(projectId);
  } catch (err) {
    console.error(`Rework (architect) failed for project ${projectId}:`, err);
    await writeStageStatus(projectId, "architect", "failed").catch(() => {});
    await markProjectStatus(projectId, "failed");
    return;
  }

  try {
    await runReviewWithAutoFix(projectId);
  } catch (err) {
    console.error(`Rework (reviewer) failed for project ${projectId}:`, err);
    await writeStageStatus(projectId, "reviewer", "failed").catch(() => {});
    await markProjectStatus(projectId, "failed");
    return;
  }

  await markProjectStatus(projectId, "ready");
  await notifyCaseStudyReady(projectId);
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isProjectOwner(projectId, user.id))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  void reworkInBackground(projectId);

  return NextResponse.json({ ok: true });
}
