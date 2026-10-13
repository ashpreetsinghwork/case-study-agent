// New hero visual for the homepage redesign — replaces the cluttered
// multi-element illustration with one clean, abstract composition in the
// brand palette. Deliberately not a literal UI/screenshot illustration,
// those read generic; this is editorial and abstract instead.
// Model: gpt-image-2.5-sunburst (this repo's established image model —
// "astra" isn't a real OpenAI model id, using the one already proven here).
// Size: 1536x1024 (3:2 landscape, matches the hero band under the headline).
// Background: transparent, so it composites directly onto the page's sand
// canvas (#f3eee2) with no visible image rectangle/edge.
// Usage: node --env-file=.env scripts/generate-hero-v2.mjs
import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = `A minimal abstract editorial composition: a handful of soft
rectangular paper-like fragments and torn-edge card shapes, in warm cream
(#f3eee2, #fdfbf7) and muted lavender-blue (#5e6ad2, #7a7fad), overlapping
at gentle angles with soft directional studio light and soft drop shadows,
as if loose pages are drifting together into one aligned stack from left to
right. No text, no icons, no logos, no screens, no UI elements, no people,
no photographs within the shapes, just abstract toned paper forms, clean
negative space, premium editorial design studio aesthetic, soft film grain
texture. Transparent background, nothing but the paper forms and their
shadows.`;

const response = await client.images.generate({
  model: "gpt-image-2.5-sunburst",
  prompt,
  size: "1536x1024",
  quality: "high",
  background: "transparent",
});

const b64 = response.data?.[0]?.b64_json;
if (!b64) throw new Error("No image returned");

await writeFile("public/generated/hero-v2.png", Buffer.from(b64, "base64"));
console.log("Saved public/generated/hero-v2.png");
