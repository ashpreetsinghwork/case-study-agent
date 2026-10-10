import { inngest } from "../client";
import {
  loadReviewerInputs,
  runLensReview,
  computeChecks,
  buildScorecard,
  writeReviewFiles,
  markReviewerDone,
} from "@/pipeline/reviewer";
import { writeStageStatus } from "@/lib/storage";
import { lensSchema } from "@/schemas/review";

const LENSES = lensSchema.options;

// Stage 4 — runs the four review lenses in parallel plus computed (non-LLM)
// checks, aggregates a scorecard, and offers a fix loop capped at 2 rounds.
// The actual logic lives in src/pipeline/reviewer.ts — this wrapper only
// adds durability.
export const reviewer = inngest.createFunction(
  { id: "reviewer", triggers: [{ event: "case-study/reviewer.requested" }] },
  async ({ event, step }) => {
    const { projectId } = event.data;

    await step.run("mark-running", () => writeStageStatus(projectId, "reviewer", "running"));
    const inputs = await step.run("load-inputs", () => loadReviewerInputs(projectId));

    const lensResults = await Promise.all(
      LENSES.map((lens) => step.run(`lens-${lens}`, () => runLensReview(lens, inputs)))
    );

    const scorecard = await step.run("build-scorecard", () => {
      const computedChecks = computeChecks(inputs.intake, inputs.draft);
      return buildScorecard(lensResults, computedChecks);
    });

    await step.run("write-review-files", () => writeReviewFiles(projectId, scorecard));
    await step.run("mark-done", () => markReviewerDone(projectId));

    return { projectId, stage: "reviewer", status: "done" };
  }
);
