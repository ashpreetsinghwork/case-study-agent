import { getProjectFile, putProjectFile, writeStageStatus } from "@/lib/storage";
import { generateStructured } from "@/lib/llm";
import { getLensPrompt } from "@/lib/prompts";
import { getRubrics } from "@/lib/config";
import { intakeSchema } from "@/schemas/intake";
import type { CaseStudySection } from "@/schemas/draft";
import { lensSchema, type ComputedChecks, type Rubric, type Scorecard } from "@/schemas/review";
import { lensLlmOutputSchema } from "@/schemas/reviewer-output";
import { renderRubricMd } from "@/lib/markdown";
import { applyReviewFixes, getFixRoundCount, MAX_FIX_ROUNDS } from "@/pipeline/architect";

// Stage 4 logic — kept plain (no Inngest) so it can run either wrapped in
// step.run (durable, production) or called directly (local scripts, API
// route). See src/inngest/functions/reviewer.ts for the durable wrapper.

const LENSES = lensSchema.options;

interface DraftFile {
  sections: CaseStudySection[];
  summary: string;
  tone: string;
}

export async function loadReviewerInputs(projectId: string) {
  const [intakeFile, draftFile] = await Promise.all([
    getProjectFile(projectId, "00_intake.json"),
    getProjectFile(projectId, "03_draft/draft.json"),
  ]);
  if (intakeFile.error || !intakeFile.data) throw new Error(`Could not read intake for ${projectId}`);
  if (draftFile.error || !draftFile.data) throw new Error(`Could not read draft for ${projectId}`);

  const intake = intakeSchema.parse(JSON.parse(await intakeFile.data.text()));
  const draft = JSON.parse(await draftFile.data.text()) as DraftFile;
  return { intake, draft };
}

export async function runLensReview(
  lens: (typeof LENSES)[number],
  { intake, draft }: Awaited<ReturnType<typeof loadReviewerInputs>>
): Promise<Rubric> {
  const rubrics = await getRubrics();
  const criteria = rubrics[lens];

  const systemPrompt = await getLensPrompt(lens);
  const userPrompt = [
    `Target audience: ${intake.targetAudience}`,
    `Score exactly these criteria: ${criteria.join(", ")}`,
    "",
    "Draft sections:",
    ...draft.sections.map((s) => `## ${s.heading} (id: ${s.id})\n${s.body}`),
    "",
    `Summary: ${draft.summary}`,
  ].join("\n");

  const llmOutput = await generateStructured({
    systemPrompt,
    userPrompt,
    schema: lensLlmOutputSchema,
    schemaName: "lens_output",
  });

  return { lens, ...llmOutput };
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const matches = w.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  if (w.endsWith("e") && count > 1) count -= 1;
  return Math.max(count, 1);
}

function fleschReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.trim().length > 0);
  if (sentences.length === 0 || words.length === 0) return 0;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const score =
    206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  return Math.round(score * 10) / 10;
}

export function computeChecks(intake: { targetAudience: string }, draft: DraftFile): ComputedChecks {
  const fullText = draft.sections.map((s) => s.body).join(" ");
  const wordCountPerSection: Record<string, number> = {};
  for (const s of draft.sections) {
    wordCountPerSection[s.id] = s.body.split(/\s+/).filter(Boolean).length;
  }

  const audienceKeywords = intake.targetAudience
    .toLowerCase()
    .split(/[,/]+/)
    .map((k) => k.trim())
    .filter(Boolean);
  const lowerText = fullText.toLowerCase();
  const keywordsPresent = audienceKeywords.filter((k) => lowerText.includes(k));

  return {
    readabilityScore: fleschReadingEase(fullText),
    headingHierarchyOk: draft.sections.length > 0 && draft.sections.every((s) => s.heading.trim().length > 0),
    wordCountPerSection,
    metaDescriptionLength: draft.summary.length,
    keywordsPresent,
  };
}

export function buildScorecard(lensResults: Rubric[], computedChecks: ComputedChecks): Scorecard {
  const prioritisedFixes = lensResults
    .flatMap((r) => r.issues.map((i) => ({ ...i, lens: r.lens })))
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, 5)
    .map((i) => `[${i.lens}] ${i.issue} -> ${i.suggestedFix}`);

  return { lensResults, computedChecks, prioritisedFixes };
}

function severityRank(severity: "high" | "medium" | "low"): number {
  return { high: 0, medium: 1, low: 2 }[severity];
}

export async function writeReviewFiles(projectId: string, scorecard: Scorecard): Promise<void> {
  await Promise.all([
    ...scorecard.lensResults.map((rubric) =>
      putProjectFile(projectId, `04_review/${rubric.lens}.md`, renderRubricMd(rubric))
    ),
    putProjectFile(projectId, "04_review/scorecard.json", JSON.stringify(scorecard, null, 2)),
  ]);
}

export async function markReviewerDone(projectId: string): Promise<void> {
  await writeStageStatus(projectId, "reviewer", "done");
}

export async function runReviewer(projectId: string) {
  await writeStageStatus(projectId, "reviewer", "running");
  const inputs = await loadReviewerInputs(projectId);

  const lensResults = await Promise.all(LENSES.map((lens) => runLensReview(lens, inputs)));
  const computedChecks = computeChecks(inputs.intake, inputs.draft);
  const scorecard = buildScorecard(lensResults, computedChecks);

  await writeReviewFiles(projectId, scorecard);
  await markReviewerDone(projectId);
  return { projectId, stage: "reviewer" as const, status: "done" as const, overallScores: lensResults.map((r) => r.overall) };
}

// Written false the moment the loop below starts and true only once it's
// fully settled — the scorecard file itself exists (and looks "done")
// after every single pass, including the ones mid-loop with more fixing
// still to come, so the frontend needs a separate signal for "nothing more
// is about to change" rather than gating on the scorecard's existence.
export async function markReviewIncomplete(projectId: string): Promise<void> {
  await putProjectFile(projectId, "04_review/complete.json", JSON.stringify({ complete: false }));
}

export async function markReviewComplete(projectId: string): Promise<void> {
  await putProjectFile(projectId, "04_review/complete.json", JSON.stringify({ complete: true }));
}

export async function isReviewComplete(projectId: string): Promise<boolean> {
  const file = await getProjectFile(projectId, "04_review/complete.json");
  if (file.error || !file.data) return false;
  return (JSON.parse(await file.data.text()) as { complete: boolean }).complete;
}

// Runs the reviewer, then automatically applies its fixes and re-reviews —
// up to MAX_FIX_ROUNDS times — with no manual "apply fixes" click. Stops as
// soon as a round finds no issues, fixes nothing, or the round cap is hit.
export async function runReviewWithAutoFix(projectId: string) {
  await markReviewIncomplete(projectId);
  await runReviewer(projectId);

  for (let rounds = await getFixRoundCount(projectId); rounds < MAX_FIX_ROUNDS; rounds += 1) {
    const { fixedSectionIds } = await applyReviewFixes(projectId);
    if (fixedSectionIds.length === 0) break;
    await runReviewer(projectId);
  }

  await markReviewComplete(projectId);
}
