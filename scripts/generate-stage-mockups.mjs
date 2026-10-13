// Floating-card mockup images for the pipeline stages + two of the output
// previews — replaces small DOM-rendered skeleton text (user feedback: not
// readable) with an actual illustrated mockup, styled like a reference
// screenshot of stacked/rotated status cards with pill badges and
// checkmarks. Kept the JSON output preview as real code text — exact
// syntax/punctuation is exactly where AI image text rendering breaks down,
// and a small monospace code block is a reasonable, already-legible visual
// on its own.
//
// Model: gpt-image-2.5-sunburst (see generate-hero-v2.mjs for why not
// "gpt-6-astra" — real model id, but this endpoint rejects it).
// Size: 1536x1024 (3:2) each, rendered with object-contain so the floating
// card composition isn't cropped.
// Background: transparent, composites directly onto each card's own
// bg-card panel with no visible image rectangle (same approach verified
// for the hero art).
// Usage: node --env-file=.env scripts/generate-stage-mockups.mjs
import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STYLE = `Two or three overlapping rounded-corner ("squircle") cards,
softly rotated and offset from each other for a floating stacked-paper
depth effect, clean soft drop shadows tinted toward lavender-blue, white
and very light cream card surfaces, a single lavender-blue (#5e6ad2) accent
color for highlighted/active elements, modern SaaS product-UI illustration
style, crisp sans-serif UI text rendered large and perfectly legible (short
words/labels only, never a full sentence), checkmarks and small
pill-shaped status badges where noted, soft neutral drop shadow beneath
the stack, isolated on a transparent background, no browser chrome, no
logos, no photographs.

Composition: the card stack should be comfortably large within the frame
with an even margin on all sides (roughly 16-20% of the canvas), not a
tiny cluster floating in a mostly-empty square, and not cropped tight
against the edges either.`;

const SHOTS = [
  {
    path: "public/generated/mockup-organiser.png",
    prompt: `${STYLE} Content: three stacked note cards, each with a small
    rounded badge reading "C-001", "C-002", and "C-003" respectively, and
    one short label line next to each badge reading "Onboarding unclear",
    "Value unclear", and "Needs flexibility".`,
  },
  {
    path: "public/generated/mockup-strategist.png",
    prompt: `${STYLE} Content: two side-by-side cards. The front card is
    outlined in the lavender-blue accent with a checkmark badge and the
    label "Option A" plus smaller text "Chosen". The back card is faded/
    dimmed with the label "Option B".`,
  },
  {
    path: "public/generated/mockup-architect.png",
    prompt: `${STYLE} Content: one document-style card with a bold title
    "Case Study" at the top, three short horizontal line shapes below it
    representing body text (not real words), and a row of three small
    rounded stat chips near the bottom reading "4.4%", "+2.4%", and "40Cr".`,
  },
  {
    path: "public/generated/mockup-reviewer.png",
    prompt: `${STYLE} Content: minimal, not busy. One large square
    scorecard card in front, bold score "4/5" and label "Design"
    beneath it, full lavender-blue accent color. Behind it, peeking out
    at the edges only, two much smaller faded/dimmed scorecard tiles at
    low opacity with no legible text, purely as a depth cue. Do not
    render four equal tiles — exactly one card should dominate the
    composition.`,
  },
  {
    path: "public/generated/mockup-draft.png",
    prompt: `${STYLE} Content: one document-style card with a bold title
    "Outcome" at the top, a large highlighted stat reading "12% -> 61%" in
    the lavender-blue accent color, and two short horizontal line shapes
    below representing body text.`,
  },
  {
    path: "public/generated/mockup-summary.png",
    prompt: `${STYLE} Content: one compact card with a bold title "Summary"
    at the top, a small rounded badge in the corner reading "98 words", and
    three short horizontal line shapes below representing body text.`,
  },
  {
    path: "public/generated/mockup-json.png",
    prompt: `${STYLE} Content: one document-style card with a small
    bracket "{ }" glyph next to a bold title "Structured" at the top, a
    small rounded checkmark badge in the corner reading "Valid", and
    three short horizontal line shapes below representing body text.
    Do not render any real JSON syntax, punctuation, or code — labels
    and lines only, matching the style of the other output cards.`,
  },
];

// Optional: pass filenames to regenerate only those, e.g.
// `node scripts/generate-stage-mockups.mjs reviewer json`
const only = process.argv.slice(2);
const targets = only.length ? SHOTS.filter((s) => only.some((o) => s.path.includes(o))) : SHOTS;

for (const shot of targets) {
  const response = await client.images.generate({
    model: "gpt-image-2.5-sunburst",
    prompt: shot.prompt,
    size: "1536x1024",
    quality: "high",
    background: "transparent",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image returned for ${shot.path}`);

  await writeFile(shot.path, Buffer.from(b64, "base64"));
  console.log(`Saved ${shot.path}`);
}
