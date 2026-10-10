import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { intakeSchema } from "@/schemas/intake";
import { manifestSchema } from "@/schemas/manifest";
import { putProjectFile, writeStageStatus } from "@/lib/storage";
import { runOrganiser } from "@/pipeline/organiser";
import { runStrategistUpToGate } from "@/pipeline/strategist";
import { createClient } from "@/lib/supabase/server";
import { consumeQuota } from "@/lib/quota";

// TODO: send the "case-study/organiser.requested" Inngest event here instead,
// once local Inngest invocation (or a real Inngest Cloud account) is sorted.
// For now this runs the pipeline in-process, fire-and-forget, right after
// responding — fine for local dev on a long-running Node server, not safe
// for a serverless deploy (the process can be frozen before it finishes).
async function runPipelineInBackground(projectId: string) {
  try {
    await runOrganiser(projectId);
  } catch (err) {
    console.error(`Organiser failed for project ${projectId}:`, err);
    await writeStageStatus(projectId, "organiser", "failed").catch(() => {});
    return;
  }

  try {
    await runStrategistUpToGate(projectId);
  } catch (err) {
    console.error(`Strategist failed for project ${projectId}:`, err);
    await writeStageStatus(projectId, "strategist", "failed").catch(() => {});
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  // One "use" is one new case study started (reworks/improves on an
  // existing one don't cost more) — checked and incremented atomically so
  // two near-simultaneous submits can't both slip through.
  const granted = await consumeQuota(supabase, user.id);
  if (!granted) {
    return NextResponse.json(
      { error: "You've used all your case study attempts. Ask for more if you need them." },
      { status: 403 }
    );
  }

  const formData = await request.formData();

  const relevantLinks = formData
    .getAll("relevantLinks")
    .map(String)
    .map((link) => link.trim())
    .filter(Boolean);

  const parsed = intakeSchema.safeParse({
    projectTitle: formData.get("projectTitle"),
    studentRole: formData.get("studentRole"),
    teamSizeAndComposition: formData.get("teamSizeAndComposition"),
    duration: formData.get("duration"),
    problemStatement: formData.get("problemStatement"),
    outcomesAndMetrics: formData.get("outcomesAndMetrics") || undefined,
    targetAudience: formData.get("targetAudience"),
    ndaConstraints: formData.get("ndaConstraints"),
    relevantLinks: relevantLinks.length ? relevantLinks : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const projectId = randomUUID();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  const manifest = manifestSchema.parse({
    projectId,
    pipelineVersion: "0.1.0",
    stages: {
      organiser: { status: "pending" },
      strategist: { status: "pending" },
      architect: { status: "pending" },
      reviewer: { status: "pending" },
    },
  });

  await Promise.all([
    putProjectFile(projectId, "00_intake.json", JSON.stringify(parsed.data, null, 2)),
    putProjectFile(projectId, "manifest.json", JSON.stringify(manifest, null, 2)),
    // Who to email once the case study is ready (notify.ts reads this).
    putProjectFile(projectId, "owner.json", JSON.stringify({ userId: user.id, email: user.email })),
    ...files.map((file, i) => putProjectFile(projectId, `uploads/${i}-${file.name}`, file)),
  ]);

  void runPipelineInBackground(projectId);

  return NextResponse.json({ projectId });
}
