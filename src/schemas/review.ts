import { z } from "zod";

// 04_review/* — Reviewer output. Same rubric schema for every lens (§4.4).
export const lensSchema = z.enum(["technical_seo", "design_head", "product_manager", "hr"]);

export const rubricSchema = z.object({
  lens: lensSchema,
  scores: z.array(z.object({ criterion: z.string(), score: z.number().int().min(1).max(5), rationale: z.string() })),
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

export const computedChecksSchema = z.object({
  readabilityScore: z.number(),
  headingHierarchyOk: z.boolean(),
  wordCountPerSection: z.record(z.string(), z.number()),
  metaDescriptionLength: z.number(),
  keywordsPresent: z.array(z.string()),
});

export const scorecardSchema = z.object({
  lensResults: z.array(rubricSchema),
  computedChecks: computedChecksSchema,
  prioritisedFixes: z.array(z.string()),
});

export type Rubric = z.infer<typeof rubricSchema>;
export type ComputedChecks = z.infer<typeof computedChecksSchema>;
export type Scorecard = z.infer<typeof scorecardSchema>;
