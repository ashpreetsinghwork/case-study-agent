import { z } from "zod";
import { THEMES } from "@/lib/portfolio-score";

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
  // Personalized, evidence-grounded fix text for a theme, replacing the
  // generic static tip on the results page/PDF. Only included for a theme
  // when at least one of its asked statements came back found+true, so the
  // model is never asked to invent advice it has no evidence for.
  themeFixes: z.array(
    z.object({
      // Must exactly match one of the theme names the prompt shows in
      // brackets next to each statement, e.g. "Building & shipping" — an
      // enum of the real names, not an index the model has to compute, so
      // there's no off-by-one/mis-parse risk mapping it back to a theme.
      themeName: z.enum(THEMES.map((t) => t.name) as [string, ...string[]]),
      fix: z.string().max(300),
    })
  ),
});

export type PortfolioAnalysis = z.infer<typeof portfolioAnalysisSchema>;
