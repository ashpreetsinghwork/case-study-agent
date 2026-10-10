import { getProjectFile, putProjectFile, writeStageStatus } from "@/lib/storage";
import { generateStructured } from "@/lib/llm";
import { getSystemPrompt } from "@/lib/prompts";
import { getSectionTemplate } from "@/lib/config";
import { buildCaseStudyReferenceBlock, type MatchedCaseStudy } from "@/lib/case-study-match";
import { intakeSchema } from "@/schemas/intake";
import { selectionSchema, type StrategyOption } from "@/schemas/strategy";
import type { OrganiserContext } from "@/schemas/context";
import type { StrategistLlmOutput } from "@/schemas/strategist-output";
import { architectLlmOutputSchema } from "@/schemas/architect-output";
import type { CaseStudySection, CalloutEntry, ChartEntry, CaseStudyAgentJson } from "@/schemas/draft";
import type { Scorecard } from "@/schemas/review";
import { renderCaseStudyMd } from "@/lib/markdown";

// Stage 3 logic — kept plain (no Inngest) so it can run either wrapped in
// step.run (durable, production) or called directly (local scripts, API
// route). See src/inngest/functions/architect.ts for the durable wrapper.

interface DraftFile {
  sections: CaseStudySection[];
  summary: string;
  tone: string;
  callouts: CalloutEntry[];
  charts: ChartEntry[];
  matchedCaseStudy?: MatchedCaseStudy;
}

// Drafts written before a field existed won't have it in storage —
// default rather than let a later .filter()/.map() crash on undefined.
function normalizeDraft(raw: Partial<DraftFile>): DraftFile {
  return {
    sections: raw.sections ?? [],
    summary: raw.summary ?? "",
    tone: raw.tone ?? "",
    callouts: raw.callouts ?? [],
    charts: raw.charts ?? [],
    matchedCaseStudy: raw.matchedCaseStudy,
  };
}

export async function loadArchitectInputs(projectId: string) {
  const [intakeFile, contextFile, strategyFile, selectionFile] = await Promise.all([
    getProjectFile(projectId, "00_intake.json"),
    getProjectFile(projectId, "01_context/context.json"),
    getProjectFile(projectId, "02_strategy/strategy.json"),
    getProjectFile(projectId, "02_strategy/selection.json"),
  ]);

  if (intakeFile.error || !intakeFile.data) throw new Error(`Could not read intake for ${projectId}`);
  if (contextFile.error || !contextFile.data) throw new Error(`Could not read context for ${projectId}`);
  if (strategyFile.error || !strategyFile.data) throw new Error(`Could not read strategy for ${projectId}`);
  if (selectionFile.error || !selectionFile.data)
    throw new Error(`No selection made yet for ${projectId}`);

  const intake = intakeSchema.parse(JSON.parse(await intakeFile.data.text()));
  const context = JSON.parse(await contextFile.data.text()) as OrganiserContext;
  const strategy = JSON.parse(await strategyFile.data.text()) as StrategistLlmOutput;
  const selection = selectionSchema.parse(JSON.parse(await selectionFile.data.text()));

  return { intake, context, strategy, selection };
}

function truncateToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text.trim() : `${words.slice(0, maxWords).join(" ")}...`;
}

// Backstop for architect.md's "never insert a `**Label:** value` metadata
// block into a section's body" rule — the model (and reviewer-suggested
// fixes especially) doesn't reliably hold this under prompting alone, so
// strip it in code too. Matches a bold-only header line ("**Metadata:**")
// followed by one or more "- **Key:** value" bullets, anywhere in the body.
const METADATA_BLOCK = /\n?\*\*[^*\n]+:\*\*[ \t]*\n(?:[-*][ \t]*\*\*[^*\n]+:\*\*[^\n]*\n?)+/g;

function stripMetadataBlocks(body: string): string {
  return body.replace(METADATA_BLOCK, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function draftCaseStudy({
  intake,
  context,
  strategy,
  selection,
}: Awaited<ReturnType<typeof loadArchitectInputs>>) {
  const chosenOption: StrategyOption = selection.chosenOption === "A" ? strategy.optionA : strategy.optionB;

  const allowedClaimIds = new Set(
    strategy.evidenceMatrix.filter((e) => e.rating === "strong").map((e) => e.claimId)
  );
  const allowedClaims = context.claims.filter((c) => allowedClaimIds.has(c.id));

  const outline = await getSectionTemplate();
  // Tight enough to force bullets/subsections over prose, loose enough
  // that a bullet can be a full point instead of a bare label — too low
  // and a section split into subsections has nothing left to say.
  const wordsPerSection = 150;

  const { matched, referenceBlock } = await buildCaseStudyReferenceBlock(
    `${intake.problemStatement}\n${chosenOption.angle}\n${chosenOption.thesis}`
  );

  const systemPrompt = [await getSystemPrompt("architect"), "---", referenceBlock].join("\n\n");
  const userPrompt = [
    `Angle: ${chosenOption.angle}`,
    `Thesis: ${chosenOption.thesis}`,
    `Tone of voice: ${chosenOption.toneOfVoice}`,
    selection.edits ? `User edits to the direction: ${selection.edits}` : "",
    "",
    `Required sections, in order: ${outline.join(", ")}`,
    `Cap each section's body at roughly ${wordsPerSection} words of prose — people skim, not read, so let structure (headings, bullets, bold, callouts, charts) carry the weight instead of more paragraphs. Pull the concrete numbers, quotes and named details out of the cited claims directly into the prose you do write.`,
    "",
    "Claims you may cite (only these, copy the ID exactly):",
    ...allowedClaims.map((c) => `- ${c.id}: ${c.text}`),
  ]
    .filter(Boolean)
    .join("\n");

  const llmOutput = await generateStructured({
    systemPrompt,
    userPrompt,
    schema: architectLlmOutputSchema,
    schemaName: "architect_output",
  });

  const sections: CaseStudySection[] = llmOutput.sections.map((s) => ({
    id: s.id,
    heading: s.heading,
    body: stripMetadataBlocks(s.body),
    // Guardrail in code, not just prompt (brief §5): drop any claim the
    // model cited that isn't in the allowed (strong-rated) set.
    citedClaimIds: s.citedClaimIds.filter((id) => allowedClaimIds.has(id)),
  }));

  const callouts: CalloutEntry[] = llmOutput.callouts.map((c) => ({
    ...c,
    citedClaimIds: c.citedClaimIds.filter((id) => allowedClaimIds.has(id)),
  }));

  const charts: ChartEntry[] = llmOutput.charts.map((c) => ({
    ...c,
    citedClaimIds: c.citedClaimIds.filter((id) => allowedClaimIds.has(id)),
  }));

  const summary = truncateToWords(llmOutput.summary, 100);

  return {
    sections,
    callouts,
    charts,
    summary,
    tone: llmOutput.tone,
    matchedCaseStudy: matched,
  };
}

export async function writeDraftFiles(projectId: string, data: DraftFile) {
  const agentJson: CaseStudyAgentJson = {
    sections: data.sections.map((s) => ({
      id: s.id,
      claims: s.citedClaimIds.map((claimId) => ({ claimId })),
    })),
    tone: data.tone,
  };

  await Promise.all([
    putProjectFile(projectId, "03_draft/case_study.md", renderCaseStudyMd(data.sections, data.callouts, data.charts)),
    putProjectFile(projectId, "03_draft/summary.md", data.summary),
    putProjectFile(projectId, "03_draft/case_study.agent.json", JSON.stringify(agentJson, null, 2)),
    putProjectFile(projectId, "03_draft/draft.json", JSON.stringify(data, null, 2)),
  ]);
}

// Powers the reader's double-click-to-edit text boxes — a direct,
// no-LLM save of whatever the student typed. citedClaimIds are left as-is:
// a manual prose edit doesn't change which claims the section still draws
// on closely enough to bother re-deriving them.
export async function updateSectionManually(
  projectId: string,
  sectionId: string,
  updates: { heading?: string; body?: string }
): Promise<CaseStudySection> {
  const draftFile = await getProjectFile(projectId, "03_draft/draft.json");
  if (draftFile.error || !draftFile.data) throw new Error(`No draft yet for ${projectId}`);

  const draft = normalizeDraft(JSON.parse(await draftFile.data.text()) as Partial<DraftFile>);
  const target = draft.sections.find((s) => s.id === sectionId);
  if (!target) throw new Error(`Section ${sectionId} not found in draft for ${projectId}`);

  const heading = updates.heading?.trim();
  const body = updates.body !== undefined ? stripMetadataBlocks(updates.body) : undefined;
  if (updates.body !== undefined && body!.length === 0) {
    throw new Error("Section body cannot be empty");
  }

  const updatedSection: CaseStudySection = {
    ...target,
    heading: heading || target.heading,
    body: body ?? target.body,
  };

  const sections = draft.sections.map((s) => (s.id === sectionId ? updatedSection : s));
  await writeDraftFiles(projectId, { ...draft, sections });

  return updatedSection;
}

// Powers the reader's per-section "Improve" button — rewrites one section
// in place using the same claims/angle/tone the original draft used, then
// persists it back through the same writeDraftFiles path so every draft
// file (md, agent json, draft.json) stays in sync. Runs as a plain direct
// call (no Inngest) since it's one quick LLM call triggered by a click.
export async function improveSection(projectId: string, sectionId: string) {
  const [{ context, strategy, selection }, draftFile] = await Promise.all([
    loadArchitectInputs(projectId),
    getProjectFile(projectId, "03_draft/draft.json"),
  ]);
  if (draftFile.error || !draftFile.data) throw new Error(`No draft yet for ${projectId}`);

  const draft = normalizeDraft(JSON.parse(await draftFile.data.text()) as Partial<DraftFile>);
  const target = draft.sections.find((s) => s.id === sectionId);
  if (!target) throw new Error(`Section ${sectionId} not found in draft for ${projectId}`);

  const chosenOption: StrategyOption = selection.chosenOption === "A" ? strategy.optionA : strategy.optionB;
  const allowedClaimIds = new Set(
    strategy.evidenceMatrix.filter((e) => e.rating === "strong").map((e) => e.claimId)
  );
  const allowedClaims = context.claims.filter((c) => allowedClaimIds.has(c.id));

  const systemPrompt = await getSystemPrompt("architect");
  const userPrompt = [
    `Angle: ${chosenOption.angle}`,
    `Tone of voice: ${chosenOption.toneOfVoice}`,
    "",
    "Rewrite ONLY the section below so it reads with clearer structure: 1-3 sentence paragraphs, a `- ` bulleted list whenever there are 2+ parallel points, `### ` sub-headings if it covers more than one distinct beat, and the single most important metric or outcome wrapped in **bold**. Tight is not the same as bare — every bullet needs the detail that makes it worth reading (the thing AND why it mattered), never a bare label; cut a whole bullet before you hollow one out into a fragment. Keep it honest — only use the claims listed below, and only state what they support.",
    "",
    `Current heading: ${target.heading}`,
    `Current body:\n${target.body}`,
    "",
    "Claims you may cite (only these, copy the ID exactly):",
    ...allowedClaims.map((c) => `- ${c.id}: ${c.text}`),
  ].join("\n");

  const improved = await generateStructured({
    systemPrompt,
    userPrompt,
    schema: architectLlmOutputSchema.shape.sections.element,
    schemaName: "improved_section",
  });

  const updatedSection: CaseStudySection = {
    id: target.id,
    heading: improved.heading,
    body: stripMetadataBlocks(improved.body),
    citedClaimIds: improved.citedClaimIds.filter((id) => allowedClaimIds.has(id)),
  };

  const sections = draft.sections.map((s) => (s.id === sectionId ? updatedSection : s));
  await writeDraftFiles(projectId, { ...draft, sections });

  return updatedSection;
}

export const MAX_FIX_ROUNDS = 2;

export async function getFixRoundCount(projectId: string): Promise<number> {
  const file = await getProjectFile(projectId, "04_review/fix_rounds.json");
  if (file.error || !file.data) return 0;
  return (JSON.parse(await file.data.text()) as { count: number }).count;
}

export async function resetFixRoundCount(projectId: string): Promise<void> {
  await putProjectFile(projectId, "04_review/fix_rounds.json", JSON.stringify({ count: 0 }));
}

// Runs automatically after every reviewer pass (brief §4.4's fix loop,
// capped at 2 rounds) — no manual click: groups every lens's issues by the
// section they flagged, and rewrites just those sections to address the
// feedback — everything else in the draft (callouts, charts, untouched
// sections) passes through unchanged.
export async function applyReviewFixes(projectId: string) {
  const fixRoundsUsed = await getFixRoundCount(projectId);
  if (fixRoundsUsed >= MAX_FIX_ROUNDS) {
    throw new Error("Fix loop limit reached");
  }

  const [{ context, strategy, selection }, draftFile, scorecardFile] = await Promise.all([
    loadArchitectInputs(projectId),
    getProjectFile(projectId, "03_draft/draft.json"),
    getProjectFile(projectId, "04_review/scorecard.json"),
  ]);
  if (draftFile.error || !draftFile.data) throw new Error(`No draft yet for ${projectId}`);
  if (scorecardFile.error || !scorecardFile.data) throw new Error(`No review yet for ${projectId}`);

  const draft = normalizeDraft(JSON.parse(await draftFile.data.text()) as Partial<DraftFile>);
  const scorecard = JSON.parse(await scorecardFile.data.text()) as Scorecard;

  const issuesBySection = new Map<string, { issue: string; suggestedFix: string }[]>();
  for (const rubric of scorecard.lensResults) {
    for (const issue of rubric.issues) {
      const list = issuesBySection.get(issue.sectionId) ?? [];
      list.push({ issue: issue.issue, suggestedFix: issue.suggestedFix });
      issuesBySection.set(issue.sectionId, list);
    }
  }

  const fixableEntries = Array.from(issuesBySection.entries()).filter(([sectionId]) =>
    draft.sections.some((s) => s.id === sectionId)
  );

  if (fixableEntries.length === 0) {
    return { sections: draft.sections, fixedSectionIds: [] as string[] };
  }

  const chosenOption: StrategyOption = selection.chosenOption === "A" ? strategy.optionA : strategy.optionB;
  const allowedClaimIds = new Set(
    strategy.evidenceMatrix.filter((e) => e.rating === "strong").map((e) => e.claimId)
  );
  const allowedClaims = context.claims.filter((c) => allowedClaimIds.has(c.id));
  const systemPrompt = await getSystemPrompt("architect");

  const fixedSections = await Promise.all(
    fixableEntries.map(async ([sectionId, issues]) => {
      const target = draft.sections.find((s) => s.id === sectionId)!;
      const userPrompt = [
        `Angle: ${chosenOption.angle}`,
        `Tone of voice: ${chosenOption.toneOfVoice}`,
        "",
        "A hiring-panel review flagged the section below. Revise it to address every issue listed — keep it tight (1-3 sentence paragraphs, bulleted lists for parallel points, `### ` sub-headings for multi-beat sections, bold for the key metric) but every bullet still needs the detail that makes it worth reading, never a bare label. Stay honest, and only use the claims given.",
        "",
        `Current heading: ${target.heading}`,
        `Current body:\n${target.body}`,
        "",
        "Reviewer feedback to address:",
        ...issues.map((i) => `- ${i.issue} -> ${i.suggestedFix}`),
        "",
        "Claims you may cite (only these, copy the ID exactly):",
        ...allowedClaims.map((c) => `- ${c.id}: ${c.text}`),
      ].join("\n");

      const improved = await generateStructured({
        systemPrompt,
        userPrompt,
        schema: architectLlmOutputSchema.shape.sections.element,
        schemaName: "fixed_section",
      });

      const updated: CaseStudySection = {
        id: target.id,
        heading: improved.heading,
        body: stripMetadataBlocks(improved.body),
        citedClaimIds: improved.citedClaimIds.filter((id) => allowedClaimIds.has(id)),
      };
      return updated;
    })
  );

  const updatedById = new Map(fixedSections.map((s) => [s.id, s]));
  const sections = draft.sections.map((s) => updatedById.get(s.id) ?? s);

  await writeDraftFiles(projectId, { ...draft, sections });
  await putProjectFile(projectId, "04_review/fix_rounds.json", JSON.stringify({ count: fixRoundsUsed + 1 }));

  return { sections, fixedSectionIds: Array.from(updatedById.keys()) };
}

export async function markArchitectDone(projectId: string): Promise<void> {
  await writeStageStatus(projectId, "architect", "done");
}

export async function runArchitect(projectId: string) {
  await writeStageStatus(projectId, "architect", "running");
  const inputs = await loadArchitectInputs(projectId);
  const draft = await draftCaseStudy(inputs);
  await writeDraftFiles(projectId, draft);
  await markArchitectDone(projectId);
  return {
    projectId,
    stage: "architect" as const,
    status: "done" as const,
    sectionCount: draft.sections.length,
    matchedCaseStudy: draft.matchedCaseStudy,
  };
}
