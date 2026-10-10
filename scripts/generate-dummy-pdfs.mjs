// Hand-rolled minimal single-page PDFs (no pdf-writing dependency needed
// for two static test fixtures) — plain Helvetica text, word-wrapped.
// Usage: node scripts/generate-dummy-pdfs.mjs
import { writeFile } from "node:fs/promises";

const PAGE_WIDTH = 612;
const MARGIN = 50;
const CHARS_PER_LINE = 92; // conservative for 11pt Helvetica within margins

function wrap(paragraph) {
  if (paragraph === "") return [""];
  const words = paragraph.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > CHARS_PER_LINE) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function escapePdfString(s) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf(paragraphs) {
  const lines = paragraphs.flatMap(wrap);
  const body = lines.map((l) => `(${escapePdfString(l)}) Tj T*`).join("\n");
  const stream = `BT /F1 11 Tf ${MARGIN} 740 Td 14 TL\n${body}\nET`;

  const objects = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /MediaBox [0 0 ${PAGE_WIDTH} 792] /Contents 4 0 R >>`,
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}

const DOCS = [
  {
    path: "dummy/pulsehr-approval-redesign/research-brief.pdf",
    paragraphs: [
      "PulseHR Internal Research Brief",
      "",
      "Topic: Leave request approval friction",
      "Prepared for: Design + PM, Q2 planning",
      "",
      "Method: 14-question survey sent to all people-managers (212 respondents, 61% response rate), plus 8 follow-up interviews with a mix of managers and employees.",
      "",
      "Key findings",
      "",
      "68% of managers said they have forgotten about a pending leave request at least once, usually because it arrived as one more email in a crowded inbox with no reminder.",
      "",
      "Average time from request submitted to request approved was 4.2 days across the sample, with wide variance: 71% were resolved within 2 days, but a long tail of 12% took over a week.",
      "",
      "Employees consistently described the current status view as unclear - the portal shows 'Pending' with no indication of who it is waiting on or how long that is likely to take.",
      "",
      "A recurring request from managers: let me approve from wherever I already look every day (email or Slack), not a separate portal I have to remember to open.",
      "",
      "Recommendation going into design",
      "",
      "Treat the approval as an inbox-style queue, not a buried settings page, and surface status (who it is with, how long they have had it) back to the employee without them needing to ask.",
    ],
  },
  {
    path: "dummy/trailmap-onboarding/competitor-scan.pdf",
    paragraphs: [
      "Trailmap Competitor Scan",
      "",
      "Topic: How other outdoor/fitness apps handle first-run onboarding",
      "Prepared by: Design (desk research, no vendor data used)",
      "",
      "General pattern observed across the category",
      "",
      "Most apps in this space ask 2-4 quick questions up front (experience level, typical distance or duration, preferred terrain) before showing any content, then use those answers to pick the first few items shown rather than a generic default list.",
      "",
      "A smaller number skip the questions entirely and rely on a generic 'browse everything' list on first open, leaning on search and filters instead of personalization.",
      "",
      "Apps that ask questions up front tend to frame them as quick taps (single choice, large touch targets) rather than free text, keeping onboarding under 30 seconds in the flows we tried.",
      "",
      "Implication for Trailmap",
      "",
      "Our current onboarding shows the same unfiltered route list to every new user regardless of fitness level, which the usability notes tie directly to early drop-off. A short skill-level question before the first list render is a well-established pattern in this category, not a novel bet.",
      "",
      "Open question for design: whether to ask preferred terrain as a second question, or hold that for a later moment once a user has saved at least one route.",
    ],
  },
];

for (const doc of DOCS) {
  await writeFile(doc.path, buildPdf(doc.paragraphs));
  console.log(`Wrote ${doc.path}`);
}
