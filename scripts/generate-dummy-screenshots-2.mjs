// Same approach as generate-dummy-screenshots.mjs, for the two newer
// synthetic dummy projects (pulsehr-approval-redesign, trailmap-onboarding).
// Usage: node --env-file=.env scripts/generate-dummy-screenshots-2.mjs
import OpenAI from "openai";
import { writeFile } from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SHOTS = [
  {
    path: "dummy/pulsehr-approval-redesign/images/before-approval-screen.png",
    prompt: `A realistic screenshot of a dated internal HR web portal showing a
buried "Pending Approvals" settings page: small dense table rows, no clear
status indicators, generic corporate enterprise-software look, light mode,
no readable body paragraph text (short label-like text only), no logos.`,
  },
  {
    path: "dummy/pulsehr-approval-redesign/images/after-approval-inbox.png",
    prompt: `A realistic screenshot of a redesigned HR web app showing an
inbox-style "Approvals" queue: card-based list, each card with a clear
status chip and a visible "time waiting" indicator, clean modern enterprise
SaaS UI, light mode, no readable body paragraph text (short label-like text
only), no logos.`,
  },
  {
    path: "dummy/trailmap-onboarding/images/before-generic-list.png",
    prompt: `A realistic screenshot of a hiking/outdoor mobile app's first
screen after signup: a plain unfiltered scrolling list of trail cards with
small thumbnails, no filters or personalization visible, generic outdoors
app UI, light mode, no readable body paragraph text (short label-like text
only), no logos.`,
  },
  {
    path: "dummy/trailmap-onboarding/images/after-skill-quiz.png",
    prompt: `A realistic screenshot of a hiking/outdoor mobile app's
onboarding screen: a single-question skill-level picker with three large
tappable cards (Beginner, Intermediate, Experienced) and a progress dots
indicator at top, clean modern mobile UI, light mode, no readable body
paragraph text (short label-like text only), no logos.`,
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
  if (!b64) throw new Error(`No image returned for ${shot.path}`);

  await writeFile(shot.path, Buffer.from(b64, "base64"));
  console.log(`Saved ${shot.path}`);
}
