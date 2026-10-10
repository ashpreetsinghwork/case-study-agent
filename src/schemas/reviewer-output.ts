import { z } from "zod";

// What each lens's LLM call returns — same shape as rubricSchema minus
// `lens`, which we attach ourselves in code rather than trust the model to
// echo back correctly.
export const lensLlmOutputSchema = z.object({
  scores: z.array(
    z.object({ criterion: z.string().min(1), score: z.number().int().min(1).max(5), rationale: z.string() })
  ),
  issues: z.array(
    z.object({
      severity: z.enum(["high", "medium", "low"]),
      sectionId: z.string(),
      issue: z.string(),
      suggestedFix: z.string(),
    })
  ),
  overall: z.number().int().min(1).max(5),
});

export type LensLlmOutput = z.infer<typeof lensLlmOutputSchema>;
