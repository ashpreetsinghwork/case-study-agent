import { z } from "zod";
import { evidenceMatrixEntrySchema, strategyOptionSchema } from "./strategy";

// What the Strategist's LLM call returns — the evidence matrix plus exactly
// two narrative options in an identical schema (guardrail: no more, no
// fewer, enforced by this being a fixed object shape, not an array).
export const strategistLlmOutputSchema = z.object({
  evidenceMatrix: z.array(evidenceMatrixEntrySchema),
  optionA: strategyOptionSchema,
  optionB: strategyOptionSchema,
});

export type StrategistLlmOutput = z.infer<typeof strategistLlmOutputSchema>;
