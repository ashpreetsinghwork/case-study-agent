import { getProjectFile, putProjectFile, writeStageStatus } from "@/lib/storage";
import { generateStructured } from "@/lib/llm";
import { getSystemPrompt } from "@/lib/prompts";
import { getAngles, getTones } from "@/lib/config";
import { intakeSchema } from "@/schemas/intake";
import type { OrganiserContext } from "@/schemas/context";
import { strategistLlmOutputSchema, type StrategistLlmOutput } from "@/schemas/strategist-output";
import { renderEvidenceMatrixMd, renderStrategyOptionMd } from "@/lib/markdown";

// Stage 2 logic — kept plain (no Inngest) so it can run either wrapped in
// step.run (durable, production) or called directly (local scripts, no
// Inngest dev server required). The human A/B gate (waitForEvent) stays
// Inngest-only — a one-shot script has nothing to wait for.

export async function buildEvidenceMatrixAndOptions(projectId: string): Promise<StrategistLlmOutput> {
  const [intakeFile, contextFile, angles, tones] = await Promise.all([
    getProjectFile(projectId, "00_intake.json"),
    getProjectFile(projectId, "01_context/context.json"),
    getAngles(),
    getTones(),
  ]);
  if (intakeFile.error || !intakeFile.data) {
    throw new Error(`Could not read intake for project ${projectId}`);
  }
  if (contextFile.error || !contextFile.data) {
    throw new Error(`Could not read context for project ${projectId}`);
  }

  const intake = intakeSchema.parse(JSON.parse(await intakeFile.data.text()));
  const context = JSON.parse(await contextFile.data.text()) as OrganiserContext;

  const systemPrompt = await getSystemPrompt("strategist");
  const userPrompt = [
    `Target audience: ${intake.targetAudience}`,
    "",
    `Angle library: ${angles.map((a) => `${a.id} (${a.description})`).join("; ")}`,
    `Tone library: ${tones.map((t) => `${t.id} (${t.description})`).join("; ")}`,
    "",
    "Claims:",
    ...context.claims.map((c) => `- ${c.id}: ${c.text}${c.selfReported ? " (self-reported)" : ""}`),
  ].join("\n");

  return generateStructured({
    systemPrompt,
    userPrompt,
    schema: strategistLlmOutputSchema,
    schemaName: "strategist_output",
  });
}

export async function writeStrategyFiles(projectId: string, result: StrategistLlmOutput): Promise<void> {
  await Promise.all([
    putProjectFile(
      projectId,
      "02_strategy/evidence_matrix.md",
      renderEvidenceMatrixMd(result.evidenceMatrix)
    ),
    putProjectFile(projectId, "02_strategy/option_A.md", renderStrategyOptionMd("A", result.optionA)),
    putProjectFile(projectId, "02_strategy/option_B.md", renderStrategyOptionMd("B", result.optionB)),
    putProjectFile(projectId, "02_strategy/strategy.json", JSON.stringify(result, null, 2)),
  ]);
}

export async function markStrategistDone(projectId: string): Promise<void> {
  await writeStageStatus(projectId, "strategist", "done");
}

// One-shot runner for direct/local invocation. Stops after writing the
// options — the real pipeline pauses here for the human A/B pick, which
// only makes sense inside the durable Inngest function.
export async function runStrategistUpToGate(projectId: string) {
  await writeStageStatus(projectId, "strategist", "running");
  const result = await buildEvidenceMatrixAndOptions(projectId);
  await writeStrategyFiles(projectId, result);
  await markStrategistDone(projectId);
  return {
    projectId,
    stage: "strategist" as const,
    status: "awaiting_selection" as const,
    evidenceCount: result.evidenceMatrix.length,
  };
}
