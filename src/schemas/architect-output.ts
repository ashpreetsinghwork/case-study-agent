import { z } from "zod";

// What the Architect's LLM call returns. Claim IDs are copied from the
// allowed set we hand it (strong-rated claims only) — never invented — and
// filtered again in code afterward as a second guardrail. The ~100-word
// summary cap is enforced in code too (brief §5: "hard guardrails in
// code"), not trusted to the model, so there's no schema refine here that
// could hard-fail the whole call over a few extra words.
export const architectLlmOutputSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().min(1),
      heading: z.string().min(1),
      body: z.string().min(1),
      citedClaimIds: z.array(z.string()),
    })
  ),
  callouts: z.array(
    z.object({
      section: z.string().min(1),
      text: z.string().min(1),
      citedClaimIds: z.array(z.string()),
    })
  ),
  charts: z.array(
    z.object({
      section: z.string().min(1),
      title: z.string().min(1),
      display: z.enum(["bars", "stats"]),
      dataPoints: z
        .array(
          z.object({
            label: z.string().min(1),
            value: z.number(),
            // Required (not optional) for OpenAI structured-output strict
            // mode — empty string when the value has no unit suffix.
            unit: z.string(),
          })
        )
        .min(2)
        .max(5),
      citedClaimIds: z.array(z.string()),
    })
  ),
  summary: z.string().min(1),
  tone: z.string().min(1),
});

export type ArchitectLlmOutput = z.infer<typeof architectLlmOutputSchema>;
