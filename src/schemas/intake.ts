import { z } from "zod";

// 00_intake.json — matches the intake form fields in the brief (§4.1).
export const intakeSchema = z.object({
  projectTitle: z.string().min(1),
  studentRole: z.string().min(1),
  teamSizeAndComposition: z.string().min(1),
  duration: z.string().min(1),
  problemStatement: z.string().min(1),
  outcomesAndMetrics: z.string().optional(),
  targetAudience: z.string().min(1),
  ndaConstraints: z.string().min(1),
  relevantLinks: z.array(z.string().url()).optional(),
});

export type Intake = z.infer<typeof intakeSchema>;
