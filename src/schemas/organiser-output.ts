import { z } from "zod";

// What the Organiser's LLM call returns. Deliberately thin: source IDs are
// assigned by us before the call (we already own the upload list), so the
// model only ever copies an S-id, never invents an S-/C-/A- pattern itself.
// We assign C- and A- ids ourselves afterwards, from array order.
export const organiserLlmOutputSchema = z.object({
  claims: z.array(
    z.object({
      text: z.string().min(1),
      sourceIds: z.array(z.string()),
      selfReported: z.boolean(),
    })
  ),
  assets: z.array(
    z.object({
      sourceId: z.string(),
      visionDescription: z.string(),
      usable: z.boolean(),
    })
  ),
  timeline: z.array(z.object({ date: z.string(), label: z.string() })),
  openQuestions: z.array(z.string()),
});

export type OrganiserLlmOutput = z.infer<typeof organiserLlmOutputSchema>;
