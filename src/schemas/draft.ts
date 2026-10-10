import { z } from "zod";

// 03_draft/* — Architect output.
export const caseStudySectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string().min(1),
  body: z.string().min(1),
  citedClaimIds: z.array(z.string().regex(/^C-\d{3,}$/)),
});

export const calloutEntrySchema = z.object({
  section: z.string().min(1),
  text: z.string().min(1),
  citedClaimIds: z.array(z.string().regex(/^C-\d{3,}$/)),
});

export const chartEntrySchema = z.object({
  section: z.string().min(1),
  title: z.string().min(1),
  // "bars" only makes sense when every data point shares a unit and is
  // meant to be compared on one scale (a before/after of the same
  // metric). "stats" is for a handful of different-unit headline numbers
  // shown standalone — no shared axis to misrepresent.
  display: z.enum(["bars", "stats"]),
  dataPoints: z
    .array(z.object({ label: z.string().min(1), value: z.number(), unit: z.string().optional() }))
    .min(2)
    .max(5),
  citedClaimIds: z.array(z.string().regex(/^C-\d{3,}$/)),
});

// Hard limit per the brief's guardrails — enforce, don't just describe.
export const summarySchema = z.string().refine((s) => s.split(/\s+/).length <= 100, {
  message: "Summary must be ~100 words or fewer",
});

export const caseStudyAgentJsonSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      claims: z.array(
        z.object({ claimId: z.string().regex(/^C-\d{3,}$/), evidenceUrl: z.string().optional() })
      ),
    })
  ),
  tone: z.string(),
});

export type CaseStudySection = z.infer<typeof caseStudySectionSchema>;
export type CalloutEntry = z.infer<typeof calloutEntrySchema>;
export type ChartEntry = z.infer<typeof chartEntrySchema>;
export type CaseStudyAgentJson = z.infer<typeof caseStudyAgentJsonSchema>;
