import { inngest } from "../client";
import { loadArchitectInputs, draftCaseStudy, writeDraftFiles, markArchitectDone } from "@/pipeline/architect";
import { writeStageStatus } from "@/lib/storage";

// Stage 3 — builds the draft case study, summary and agent JSON from the
// selected strategy option. The actual logic lives in
// src/pipeline/architect.ts — this wrapper only adds durability.
export const architect = inngest.createFunction(
  { id: "architect", triggers: [{ event: "case-study/architect.requested" }] },
  async ({ event, step }) => {
    const { projectId } = event.data;

    await step.run("mark-running", () => writeStageStatus(projectId, "architect", "running"));
    const inputs = await step.run("load-inputs", () => loadArchitectInputs(projectId));
    const draft = await step.run("draft-sections", () => draftCaseStudy(inputs));
    await step.run("write-draft-files", () => writeDraftFiles(projectId, draft));
    await step.run("mark-done", () => markArchitectDone(projectId));

    await step.sendEvent("reviewer-requested", {
      name: "case-study/reviewer.requested",
      data: { projectId },
    });

    return { projectId, stage: "architect", status: "done", sectionCount: draft.sections.length };
  }
);
