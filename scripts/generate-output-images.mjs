import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STYLE =
  "A clean light-mode application window mockup, flat UI design, not a " +
  "photograph. Plain sand background (#f3eee2), no props, no hands, no " +
  "desk, no photographic elements of any kind. The window is a rounded " +
  "card (background #fdfbf7, thin 1px border #e1d9c6) with a slim title bar " +
  "along the top holding three small circular dots on the left. The window " +
  "fills nearly the entire frame with only a small even margin around it. " +
  "Minimal, crisp, high resolution UI screenshot style, generous internal " +
  "padding, no logos, no browser bar.";

const OUTPUTS = [
  {
    id: "draft",
    prompt: `${STYLE} Inside the window: a rendered document preview. A bold
dark heading line at the top, a shorter grey subheading line below it, then
several grey paragraph placeholder bars of varying width forming two short
paragraphs, with one section break and a second bold subheading partway down
followed by more paragraph bars. No readable words, just clean placeholder
bars.`,
  },
  {
    id: "summary",
    prompt: `${STYLE} Inside the window: a compact summary card, vertically
centered, much shorter than a full page. Four or five short grey placeholder
text bars stacked tightly representing a short paragraph, with a small
rounded lavender-blue (#5e6ad2) pill badge above them containing a short
placeholder word shape.`,
  },
  {
    id: "agent-json",
    prompt: `${STYLE} Inside the window: a JSON code block in monospace
style. Several lines of code with indentation, using small colored tokens:
lavender-blue (#5e6ad2) for punctuation braces and brackets, dark grey bars
for string values, muted blue-grey bars for object keys. Looks like a clean
syntax-highlighted JSON snippet. No readable words, just colored placeholder
tokens shaped like real JSON syntax.`,
  },
];

for (const item of OUTPUTS) {
  const response = await client.images.generate({
    model: "gpt-image-2.5-sunburst",
    prompt: item.prompt,
    size: "1536x1024",
    quality: "xhigh",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`No image returned for ${item.id}`);
  }

  await writeFile(`public/generated/output-${item.id}.png`, Buffer.from(b64, "base64"));
  console.log(`Saved public/generated/output-${item.id}.png`);
}
