// Tile images for the hero's GridMotion background — fictional, generic
// portfolio/case-study landing page mockups (no real studio or company
// likeness). Model: gpt-image-2.5-sunburst ("gpt-6-astra" is a real model
// id but the classic images.generate endpoint rejects it with "does not
// exist", so it must be served through a different API path — using the
// model already proven to work here instead).
// Size: 1536x1024 (3:2) each, rendered at
// GridMotion's aspectRatio={1.5} to match exactly, no cropping distortion.
// Background: opaque (these are object-fit:cover tiles, not composited
// onto the page, so no transparency needed).
// Usage: node --env-file=.env scripts/generate-portfolio-tiles.mjs
import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BASE_STYLE = `A clean, generic portfolio website landing page mockup,
screenshot framing (full browser viewport, no browser chrome), neutral
minimal design-portfolio aesthetic, plausible but entirely fictional layout
and placeholder content, no real company names or logos, no readable real
text (short label-like or lorem-style text only), soft neutral color
palette (whites, grays, one muted accent color varying per image), generous
whitespace, premium editorial UI design, no screenshots within screenshots.`;

const VARIANTS = [
  `${BASE_STYLE} Layout: large centered hero headline, small subtext, one
  hero product screenshot mockup below, accent color muted teal.`,
  `${BASE_STYLE} Layout: left-aligned bold headline with a stat number
  callout on the right side, accent color muted coral.`,
  `${BASE_STYLE} Layout: a 3-column project grid of case study thumbnail
  cards below a short intro paragraph, accent color muted indigo.`,
  `${BASE_STYLE} Layout: full-bleed hero photograph with overlaid headline
  text and a thin navigation bar, accent color muted olive.`,
  `${BASE_STYLE} Layout: split-screen hero, text on the left half, a tall
  mobile app screen mockup on the right half, accent color muted rose.`,
  `${BASE_STYLE} Layout: a vertical case-study article page with a title,
  byline, and stacked paragraph and image blocks, accent color muted
  slate blue.`,
];

for (let i = 0; i < VARIANTS.length; i++) {
  const response = await client.images.generate({
    model: "gpt-image-2.5-sunburst",
    prompt: VARIANTS[i],
    size: "1536x1024",
    quality: "medium",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image returned for tile ${i}`);

  const path = `public/generated/portfolio-tile-${i + 1}.png`;
  await writeFile(path, Buffer.from(b64, "base64"));
  console.log(`Saved ${path}`);
}
