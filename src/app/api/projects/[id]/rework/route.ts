import { NextResponse } from "next/server";
import { writeStageStatus } from "@/lib/storage";
import { runArchitect, resetFixRoundCount } from "@/pipeline/architect";
import { runReviewWithAutoFix } from "@/pipeline/reviewer";
import { notifyCaseStudyReady } from "@/pipeline/notify";

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
    return;
  }

  try {
    await runReviewWithAutoFix(projectId);
  } catch (err) {
    console.error(`Rework (reviewer) failed for project ${projectId}:`, err);
    await writeStageStatus(projectId, "reviewer", "failed").catch(() => {});
    return;
  }

  await notifyCaseStudyReady(projectId);
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  void reworkInBackground(projectId);

  return NextResponse.json({ ok: true });
}
