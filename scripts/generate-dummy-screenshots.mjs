import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SHOTS = [
  {
    id: "before-screenshot",
    prompt: `A realistic screenshot of a cluttered online course catalog web app.
Dense grid of course cards with small thumbnails, a search bar at top, and a
"More options" collapsed dropdown hiding the filters. Busy, slightly
overwhelming layout, generic app UI, light mode, no readable body paragraph
text (short label-like text only), no logos.`,
  },
  {
    id: "after-screenshot",
    prompt: `A realistic screenshot of a clean, redesigned online course
catalog web app. Visible filter panel on the left (skill level, duration,
topic), a "Recommended for you" row of personalized course cards at the top,
generous whitespace, light mode, no readable body paragraph text (short
label-like text only), no logos.`,
  },
];

for (const shot of SHOTS) {
  const response = await client.images.generate({
    model: "gpt-image-2.5-sunburst",
    prompt: shot.prompt,
    size: "1536x1024",
    quality: "medium",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image returned for ${shot.id}`);

  await writeFile(`dummy/${shot.id}.png`, Buffer.from(b64, "base64"));
  console.log(`Saved dummy/${shot.id}.png`);
}
