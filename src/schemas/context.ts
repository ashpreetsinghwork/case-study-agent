import { z } from "zod";

// 01_context/* — Organiser output. IDs (S-, C-, A-) are traceable through
// every later stage.
export const sourceSchema = z.object({
  id: z.string().regex(/^S-\d{3,}$/),
  type: z.enum(["pdf", "docx", "pptx", "image", "url", "figma", "text"]),
  title: z.string(),
  extractedText: z.string().optional(),
  imageDescription: z.string().optional(),
});

export const claimSchema = z.object({
  id: z.string().regex(/^C-\d{3,}$/),
  text: z.string().min(1),
  sourceIds: z.array(z.string().regex(/^S-\d{3,}$/)),
  selfReported: z.boolean().default(false),
});

export const assetSchema = z.object({
  id: z.string().regex(/^A-\d{3,}$/),
  sourceId: z.string().regex(/^S-\d{3,}$/),
  visionDescription: z.string(),
  usable: z.boolean(),
});

export const openQuestionSchema = z.object({
  question: z.string().min(1),
  relatedClaimIds: z.array(z.string().regex(/^C-\d{3,}$/)).optional(),
});

export const timelineEntrySchema = z.object({
  date: z.string().min(1),
  label: z.string().min(1),
});

export type Source = z.infer<typeof sourceSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type Asset = z.infer<typeof assetSchema>;
export type OpenQuestion = z.infer<typeof openQuestionSchema>;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

// The shape written to 01_context/context.json — the machine-readable
// sibling of the *.md files, so later stages don't have to re-parse Markdown.
export interface OrganiserContext {
  allSources: Source[];
  claims: Claim[];
  assets: Asset[];
  timeline: TimelineEntry[];
  openQuestions: OpenQuestion[];
}
