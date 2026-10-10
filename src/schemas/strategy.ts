import { z } from "zod";

// 02_strategy/* — Strategist output. Exactly two options, identical schema.
// IDs here are always copied from claims we already assigned (never
// invented by the model), and left as plain strings rather than
// regex-constrained — OpenAI's strict structured-output mode doesn't
// reliably enforce JSON Schema "pattern".
export const evidenceMatrixEntrySchema = z.object({
  claimId: z.string().min(1),
  rating: z.enum(["strong", "weak", "unsupported"]),
  evidenceNeeded: z.string(),
});

export const strategyOptionSchema = z.object({
  angle: z.string().min(1),
  thesis: z.string().min(1),
  toneOfVoice: z.string().min(1),
  narrativeArc: z.array(z.object({ section: z.string(), summary: z.string() })),
  heroClaimIds: z.array(z.string().min(1)),
  claimsToSoftenOrDrop: z.array(z.string().min(1)),
  evidenceToAdd: z.array(z.string()),
  risks: z.array(z.string()),
});

export const selectionSchema = z.object({
  chosenOption: z.enum(["A", "B"]),
  edits: z.string().optional(),
});

export type EvidenceMatrixEntry = z.infer<typeof evidenceMatrixEntrySchema>;
export type StrategyOption = z.infer<typeof strategyOptionSchema>;
export type Selection = z.infer<typeof selectionSchema>;
