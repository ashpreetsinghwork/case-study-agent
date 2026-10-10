import { inngest } from "../client";
import {
  buildEvidenceMatrixAndOptions,
  markStrategistDone,
  writeStrategyFiles,
} from "@/pipeline/strategist";
import { writeStageStatus } from "@/lib/storage";

// Stage 2 — builds the evidence matrix and exactly two narrative options, then
// pauses for the human A/B gate (selection.json) before the Architect can run.
// The actual logic lives in src/pipeline/strategist.ts — this wrapper only
// adds durability and the wait-for-selection pause, both Inngest-specific.
export const strategist = inngest.createFunction(
  { id: "strategist", triggers: [{ event: "case-study/strategist.requested" }] },
  async ({ event, step }) => {
    const { projectId } = event.data;

    await step.run("mark-running", () => writeStageStatus(projectId, "strategist", "running"));
    const result = await step.run("build-evidence-matrix-and-options", () =>
      buildEvidenceMatrixAndOptions(projectId)
    );
    await step.run("write-strategy-files", () => writeStrategyFiles(projectId, result));
    await step.run("update-manifest", () => markStrategistDone(projectId));

    // Human gate: waits for the user's selection (max 24h) instead of auto-continuing.
    const selection = await step.waitForEvent("wait-for-selection", {
      event: "case-study/strategy.selected",
      timeout: "24h",
      match: "data.projectId",
    });

    if (selection) {
      await step.sendEvent("architect-requested", {
        name: "case-study/architect.requested",
        data: { projectId },
      });
    }

    return { projectId, stage: "strategist", status: selection ? "selected" : "awaiting_selection" };
  }
);
