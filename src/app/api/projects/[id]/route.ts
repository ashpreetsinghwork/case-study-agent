import { NextResponse } from "next/server";
import { getProjectFile, listProjectFiles, readStageStatus } from "@/lib/storage";
import { intakeSchema } from "@/schemas/intake";
import { selectionSchema } from "@/schemas/strategy";
import type { OrganiserContext } from "@/schemas/context";
import type { StrategistLlmOutput } from "@/schemas/strategist-output";
import type { Scorecard } from "@/schemas/review";
import type { CalloutEntry, CaseStudySection, ChartEntry } from "@/schemas/draft";
import { getFixRoundCount } from "@/pipeline/architect";
import { isReviewComplete } from "@/pipeline/reviewer";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  const [intakeFile, organiser, strategist, architect, reviewer] = await Promise.all([
    getProjectFile(projectId, "00_intake.json"),
    readStageStatus(projectId, "organiser"),
    readStageStatus(projectId, "strategist"),
    readStageStatus(projectId, "architect"),
    readStageStatus(projectId, "reviewer"),
  ]);

  if (intakeFile.error || !intakeFile.data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const intake = intakeSchema.parse(JSON.parse(await intakeFile.data.text()));

  // Strip the "{index}-" prefix putProjectFile stores uploads under, so
  // this reads back as the filename the student actually picked.
  const uploadedFiles = (await listProjectFiles(projectId, "uploads")).map((f) =>
    f.name.replace(/^\d+-/, "")
  );

  // From here down: gate on whether the actual output file exists, not on
  // the separate stage-status marker. The marker and the content file are
  // two independent writes to Supabase Storage, and the SDK's own
  // eventual-consistency lag (see the comment on writeStageStatus) means a
  // GET can race and see e.g. "reviewer: done" before "architect: done" is
  // visible yet, even though architect genuinely finished first — which
  // would otherwise blank out sections that do exist. Reading the content
  // file directly sidesteps that race entirely.
  let claims: OrganiserContext["claims"] = [];
  let sources: OrganiserContext["allSources"] = [];
  const contextFile = await getProjectFile(projectId, "01_context/context.json");
  if (contextFile.data) {
    const context = JSON.parse(await contextFile.data.text()) as OrganiserContext;
    claims = context.claims;
    sources = context.allSources;
  }

  let strategy: StrategistLlmOutput | null = null;
  const strategyFile = await getProjectFile(projectId, "02_strategy/strategy.json");
  if (strategyFile.data) {
    strategy = JSON.parse(await strategyFile.data.text()) as StrategistLlmOutput;
  }

  let selection: { chosenOption: "A" | "B" } | null = null;
  const selectionFile = await getProjectFile(projectId, "02_strategy/selection.json");
  if (selectionFile.data) {
    selection = selectionSchema.parse(JSON.parse(await selectionFile.data.text()));
  }

  let draftSummary: string | null = null;
  let caseStudySections: CaseStudySection[] = [];
  let caseStudyCallouts: CalloutEntry[] = [];
  let caseStudyCharts: ChartEntry[] = [];
  const [summaryFile, draftFile] = await Promise.all([
    getProjectFile(projectId, "03_draft/summary.md"),
    getProjectFile(projectId, "03_draft/draft.json"),
  ]);
  if (summaryFile.data) draftSummary = await summaryFile.data.text();
  if (draftFile.data) {
    const draft = JSON.parse(await draftFile.data.text()) as {
      sections: CaseStudySection[];
      callouts: CalloutEntry[];
      charts: ChartEntry[];
    };
    caseStudySections = draft.sections;
    // Drafts written before these fields existed won't have them —
    // default rather than let the reader crash on .filter(undefined).
    caseStudyCallouts = draft.callouts ?? [];
    caseStudyCharts = draft.charts ?? [];
  }

  let scorecard: Scorecard | null = null;
  const [scorecardFile, fixRoundsUsed, reviewComplete] = await Promise.all([
    getProjectFile(projectId, "04_review/scorecard.json"),
    getFixRoundCount(projectId),
    isReviewComplete(projectId),
  ]);
  if (scorecardFile.data) scorecard = JSON.parse(await scorecardFile.data.text()) as Scorecard;

  return NextResponse.json({
    projectId,
    projectTitle: intake.projectTitle,
    studentRole: intake.studentRole,
    teamSizeAndComposition: intake.teamSizeAndComposition,
    duration: intake.duration,
    targetAudience: intake.targetAudience,
    stages: { organiser, strategist, architect, reviewer },
    uploadedFiles,
    claims,
    sources,
    strategy,
    selection,
    draftSummary,
    caseStudySections,
    caseStudyCallouts,
    caseStudyCharts,
    scorecard,
    fixRoundsUsed,
    reviewComplete,
  });
}
