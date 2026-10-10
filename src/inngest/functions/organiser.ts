import { inngest } from "../client";
import {
  loadOrganiserInputs,
  markOrganiserDone,
  parseAndDecompose,
  writeContextFiles,
} from "@/pipeline/organiser";
import { writeStageStatus } from "@/lib/storage";

// Stage 1 — parses intake + uploads into 01_context/* (sources, claims, assets, timeline).
// Input: projectId. Output: written to storage under projects/{projectId}/01_context/.
// The actual logic lives in src/pipeline/organiser.ts, plain functions with
// no Inngest dependency — this wrapper only adds durability (step.run
// checkpoints each one so a crash mid-run resumes instead of restarting).
export const organiser = inngest.createFunction(
  { id: "organiser", triggers: [{ event: "case-study/organiser.requested" }] },
  async ({ event, step }) => {
    const { projectId } = event.data;

    await step.run("mark-running", () => writeStageStatus(projectId, "organiser", "running"));
    const { intake, uploads } = await step.run("load-inputs", () => loadOrganiserInputs(projectId));
    const result = await step.run("parse-and-decompose", () => parseAndDecompose(intake, uploads));
    await step.run("write-context-files", () => writeContextFiles(projectId, result));
    await step.run("update-manifest", () => markOrganiserDone(projectId));

    await step.sendEvent("strategist-requested", {
      name: "case-study/strategist.requested",
      data: { projectId },
    });

    return {
      projectId,
      stage: "organiser",
      status: "done",
      sourceCount: result.allSources.length,
      claimCount: result.claims.length,
    };
  }
);
