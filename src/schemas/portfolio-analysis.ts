import { z } from "zod";

// Output of cross-checking a subset of the 30 checklist statements against
// uploaded portfolio pages (and optionally a resume). Only items tagged
// "portfolio"/"resume" in src/lib/portfolio-score.ts are ever sent for
// judging; "self" items never reach this schema at all, by construction
// of the prompt, not by filtering here.
export const portfolioAnalysisSchema = z.object({
  // False when the uploaded material had no real content (blank shell, page
  // saved before it loaded, login wall, unrelated content). The caller
  // ignores itemVerdicts entirely and falls back to the self-reported
  // answers, so a bad upload never reads as a uniformly "bad" portfolio.
  accessible: z.boolean(),
  itemVerdicts: z.array(
    z.object({
      // Matches a FLAT item key from src/lib/portfolio-score.ts, e.g. "0_3".
      key: z.string(),
      // False when the provided material doesn't give enough evidence to
      // judge this specific statement. The caller falls back to the
      // self-reported answer for just that one item rather than guessing.
      found: z.boolean(),
      // Only meaningful when found is true.
      isTrue: z.boolean(),
    })
  ),
  summary: z.string().max(400),
});

export type PortfolioAnalysis = z.infer<typeof portfolioAnalysisSchema>;
