import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STYLE =
  "Bright, airy editorial photography on a light sand-toned desk (#f3eee2), " +
  "soft natural daylight from a window, minimal soft shadows, warm neutral " +
  "tones. A single lavender-blue accent (#5e6ad2) appears somewhere in the " +
  "frame. Shallow depth of field, high-quality, no readable body text, no " +
  "logos, no UI chrome, no flat icons, no screenshots.";

const STAGES = [
  {
    id: "organiser",
    prompt: `${STYLE} A single sheet of paper rests on the light desk, its
edges lightly highlighted in lavender, with a few small lavender tag-shaped
sticky notes clipped along its side. Faint out-of-focus scattered paper
scraps and photographs sit blurred in the background.`,
  },
  {
    id: "strategist",
    prompt: `${STYLE} A sheet of paper on the light desk splits into two paths
drifting apart, rendered as two soft trails of lavender light, one path
brighter and sharper, the other fading softer into the background.`,
  },
  {
    id: "architect",
    prompt: `${STYLE} A sheet of paper on the light desk is being written into
existence: thin horizontal lines of lavender light draw themselves across it
one at a time, as though a glowing thread is stitching the page together.`,
  },
  {
    id: "reviewer",
    prompt: `${STYLE} A single sheet of paper rests at the center of the light
desk, surrounded by four small soft lavender glows hovering around it at
different angles, like four quiet spotlights studying it.`,
  },
];

for (const stage of STAGES) {
  const response = await client.images.generate({
    model: "gpt-image-2.5-sunburst",
    prompt: stage.prompt,
    size: "1024x1024",
    quality: "xhigh",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`No image returned for ${stage.id}`);
  }

  await writeFile(`public/generated/stage-${stage.id}.png`, Buffer.from(b64, "base64"));
  console.log(`Saved public/generated/stage-${stage.id}.png`);
}
