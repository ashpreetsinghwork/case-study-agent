import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = `Premium cinematic key art on a near-pure-black background (#010102).
A tight cluster of dog-eared paper notes, torn sticky notes and photographs drifts
in darkness, lit only by rim light, slowly resolving into a single sheet of paper
that glows with a soft lavender-blue light (#5e6ad2) tracing its edges and a few
clean horizontal lines across it. Wisps of fine glowing dust connect the scattered
pages to the lit one like a constellation. Moody, high-contrast, shallow depth of
field, subtle 35mm film grain, dramatic single-source side lighting, ultra
high-quality editorial illustration, no readable text, no logos, no UI chrome,
no screenshots.`;

const response = await client.images.generate({
  model: "gpt-image-2.5-sunburst",
  prompt,
  size: "1536x1024",
  quality: "xhigh",
});

const b64 = response.data?.[0]?.b64_json;
if (!b64) {
  throw new Error("No image returned");
}

await writeFile("public/generated/hero-illustration.png", Buffer.from(b64, "base64"));
console.log("Saved public/generated/hero-illustration.png");
