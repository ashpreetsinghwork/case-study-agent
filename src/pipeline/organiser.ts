import { getProjectFile, putProjectFile, writeStageStatus } from "@/lib/storage";
import { generateStructured } from "@/lib/llm";
import { extractUploads, type ExtractedUploads } from "@/lib/extract";
import { getSystemPrompt } from "@/lib/prompts";
import { intakeSchema, type Intake } from "@/schemas/intake";
import { organiserLlmOutputSchema } from "@/schemas/organiser-output";
import type { Asset, Claim, OpenQuestion, OrganiserContext, Source } from "@/schemas/context";
import {
  renderAssetsMd,
  renderClaimsMd,
  renderOpenQuestionsMd,
  renderSourcesMd,
  renderTimelineMd,
} from "@/lib/markdown";

// Stage 1 logic — kept plain (no Inngest) so it can run either wrapped in
// step.run (durable, production) or called directly (local scripts, no
// Inngest dev server required).

export async function loadOrganiserInputs(
  projectId: string
): Promise<{ intake: Intake; uploads: ExtractedUploads }> {
  const intakeFile = await getProjectFile(projectId, "00_intake.json");
  if (intakeFile.error || !intakeFile.data) {
    throw new Error(`Could not read intake for project ${projectId}`);
  }
  const intake = intakeSchema.parse(JSON.parse(await intakeFile.data.text()));
  const uploads = await extractUploads(projectId);
  return { intake, uploads };
}

export async function parseAndDecompose(
  intake: Intake,
  uploads: ExtractedUploads
): Promise<OrganiserContext> {
  const linkSources: Source[] = (intake.relevantLinks ?? []).map((link, i) => ({
    id: `S-${String(uploads.sources.length + i + 1).padStart(3, "0")}`,
    type: "url",
    title: link,
  }));
  const allSources: Source[] = [...uploads.sources, ...linkSources];

  const systemPrompt = await getSystemPrompt("organiser");
  const introLines = [
    `Project: ${intake.projectTitle}`,
    `Role: ${intake.studentRole}`,
    `Team: ${intake.teamSizeAndComposition}`,
    `Duration: ${intake.duration}`,
    `Problem statement: ${intake.problemStatement}`,
    intake.outcomesAndMetrics ? `Outcomes and metrics: ${intake.outcomesAndMetrics}` : "",
    `Target audience: ${intake.targetAudience}`,
    `NDA constraints: ${intake.ndaConstraints}`,
    linkSources.length
      ? `Links (not fetched, title is the URL itself): ${linkSources
          .map((s) => `${s.id} ${s.title}`)
          .join(", ")}`
      : "",
  ].filter(Boolean);

  const llmOutput = await generateStructured({
    systemPrompt,
    userPrompt: [{ type: "input_text", text: introLines.join("\n") }, ...uploads.content],
    schema: organiserLlmOutputSchema,
    schemaName: "organiser_output",
  });

  const claims: Claim[] = llmOutput.claims.map((c, i) => ({
    id: `C-${String(i + 1).padStart(3, "0")}`,
    text: c.text,
    sourceIds: c.sourceIds,
    selfReported: c.selfReported,
  }));

  const assets: Asset[] = llmOutput.assets.map((a, i) => ({
    id: `A-${String(i + 1).padStart(3, "0")}`,
    sourceId: a.sourceId,
    visionDescription: a.visionDescription,
    usable: a.usable,
  }));

  const openQuestions: OpenQuestion[] = [
    ...llmOutput.openQuestions.map((question) => ({ question })),
    ...uploads.unsupportedNotes.map((question) => ({ question })),
  ];

  return { allSources, claims, assets, timeline: llmOutput.timeline, openQuestions };
}

export async function writeContextFiles(projectId: string, result: OrganiserContext): Promise<void> {
  await Promise.all([
    putProjectFile(projectId, "01_context/sources.md", renderSourcesMd(result.allSources)),
    putProjectFile(projectId, "01_context/claims.md", renderClaimsMd(result.claims)),
    putProjectFile(projectId, "01_context/assets.md", renderAssetsMd(result.assets)),
    putProjectFile(projectId, "01_context/timeline.md", renderTimelineMd(result.timeline)),
    putProjectFile(
      projectId,
      "01_context/open_questions.md",
      renderOpenQuestionsMd(result.openQuestions)
    ),
    putProjectFile(projectId, "01_context/context.json", JSON.stringify(result, null, 2)),
  ]);
}

export async function markOrganiserDone(projectId: string): Promise<void> {
  await writeStageStatus(projectId, "organiser", "done");
}

// One-shot runner for direct/local invocation (no Inngest durability) —
// same steps the Inngest function wraps individually in step.run.
export async function runOrganiser(projectId: string) {
  await writeStageStatus(projectId, "organiser", "running");
  const { intake, uploads } = await loadOrganiserInputs(projectId);
  const result = await parseAndDecompose(intake, uploads);
  await writeContextFiles(projectId, result);
  await markOrganiserDone(projectId);
  return {
    projectId,
    stage: "organiser" as const,
    status: "done" as const,
    sourceCount: result.allSources.length,
    claimCount: result.claims.length,
  };
}
