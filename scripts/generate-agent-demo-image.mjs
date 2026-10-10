import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = `A clean light-mode application window mockup, flat UI design,
not a photograph. Plain sand background (#f3eee2), no props, no hands, no
desk, no photographic elements of any kind.

The window is a rounded card (background #fdfbf7, thin 1px border #e1d9c6)
with a slim title bar along the top holding three small circular dots on the
left. The window fills nearly the entire frame edge to edge with only a
small, even margin of sand background around it — no large empty space
above or below the window.

Inside the window, a two-message chat thread filling most of the window's
height with balanced padding above, between, and below the two bubbles (not
concentrated in one corner):

A right-aligned solid dark bubble (background #23201a, light text) reading
"Can we make this line shorter and clearer?"

Below it, a left-aligned plain text reply in dark grey, reading "Sure, I've
tightened it and updated the phrasing." with two small rounded pill badges
next to it, each a lavender-blue (#5e6ad2) filled circle containing a small
white number, "1" and "2".

Minimal, crisp, high resolution UI screenshot style, no logos, no browser
bar.`;

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

await writeFile("public/generated/agent-demo.png", Buffer.from(b64, "base64"));
console.log("Saved public/generated/agent-demo.png");
