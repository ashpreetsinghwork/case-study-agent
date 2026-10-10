import { z } from "zod";

// manifest.json — generation stamping for versioning/regression (§5).
export const manifestSchema = z.object({
  projectId: z.string(),
  pipelineVersion: z.string(),
  stages: z.record(
    z.string(),
    z.object({
      status: z.enum(["pending", "running", "done", "failed"]),
      promptVersion: z.string().optional(),
      modelId: z.string().optional(),
      outputHash: z.string().optional(),
    })
  ),
});

export type Manifest = z.infer<typeof manifestSchema>;
