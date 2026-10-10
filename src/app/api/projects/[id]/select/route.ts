import { NextResponse } from "next/server";
import { putProjectFile, writeStageStatus } from "@/lib/storage";
import { selectionSchema } from "@/schemas/strategy";
import { runArchitect } from "@/pipeline/architect";
import { runReviewWithAutoFix } from "@/pipeline/reviewer";
import { notifyCaseStudyReady } from "@/pipeline/notify";
import { markProjectStatus } from "@/lib/projects";

// TODO: send "case-study/strategy.selected" to Inngest instead, once local
// invocation (or a real Inngest Cloud account) is sorted — see
// src/app/api/projects/route.ts for the same interim tradeoff.
async function runRestOfPipelineInBackground(projectId: string) {
  try {
    await runArchitect(projectId);
  } catch (err) {
    console.error(`Architect failed for project ${projectId}:`, err);
    await writeStageStatus(projectId, "architect", "failed").catch(() => {});
    await markProjectStatus(projectId, "failed");
    return;
  }

  try {
    // Reviews, then auto-applies fixes and re-reviews (capped) — the
    // student never has to click "apply fixes" themselves.
    await runReviewWithAutoFix(projectId);
  } catch (err) {
    console.error(`Reviewer failed for project ${projectId}:`, err);
    await writeStageStatus(projectId, "reviewer", "failed").catch(() => {});
    await markProjectStatus(projectId, "failed");
    return;
  }

  await markProjectStatus(projectId, "ready");
  await notifyCaseStudyReady(projectId);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const body = await request.json().catch(() => null);

  const parsed = selectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await putProjectFile(projectId, "02_strategy/selection.json", JSON.stringify(parsed.data, null, 2));

  void runRestOfPipelineInBackground(projectId);

  return NextResponse.json({ ok: true });
}
