// Where each statement's evidence can actually come from:
// "portfolio", observable in the homepage/case-study content itself, so an
//   uploaded-portfolio scan may answer it.
// "resume", needs the portfolio cross-referenced against a resume
//   (only the CV/LinkedIn/portfolio consistency check), so it's only ever
//   asked when a resume was uploaded.
// "self", not observable from any uploaded material (verbal skill,
//   outside recognition, LinkedIn), always the self-reported answer only,
//   an uploaded-portfolio/resume scan is never asked about these.
export const THEMES = [
  {
    name: "Building & shipping",
    why: "Hiring managers want proof you can get things out, not only draw them.",
    items: [
      { text: "Nothing in my portfolio is live, runnable or clickable beyond static screens.", source: "portfolio" },
      { text: "I can't say what shipped and what was only a mockup.", source: "portfolio" },
      { text: "No project shows a number or outcome after launch.", source: "portfolio" },
      { text: "I never mention engineering: constraints, handoff, or what changed in build.", source: "portfolio" },
      { text: "My latest project is more than a year old.", source: "portfolio" },
    ],
    fix: "Label every project shipped, prototype or concept. Add one outcome line to each.",
  },
  {
    name: "Judgment & taste",
    why: "AI makes everything look good. What you chose is what is left to hire.",
    items: [
      { text: "My case studies list process steps but not a single decision.", source: "portfolio" },
      { text: "Nothing shows what I chose not to build.", source: "portfolio" },
      { text: "No option I rejected, and why.", source: "portfolio" },
      { text: "I can't point to a moment I disagreed with a stakeholder, the data or myself.", source: "portfolio" },
      { text: 'Every project ends well. No miss, no "what I would change".', source: "portfolio" },
    ],
    fix: "Add a block to your best project: what I decided, what I dropped, what I would redo.",
  },
  {
    name: "Fluency with the new tools",
    why: "Not whether you use AI. Whether you can direct it, and judge it.",
    items: [
      { text: 'AI is missing, or appears as "used AI tools" and nothing more.', source: "portfolio" },
      { text: "I can't split what AI made from what I decided.", source: "portfolio" },
      { text: "No example of an AI output I rejected or rewrote.", source: "portfolio" },
      { text: "Only polished final screens. No rough versions or iterations.", source: "portfolio" },
      { text: "I can't name my workflow: what I generate, what I refine, what I never hand over.", source: "portfolio" },
    ],
    fix: "Show one real iteration trail. Mark what AI gave you and what you changed.",
  },
  {
    name: "Designing for AI products",
    why: "Interfaces for uncertain, probabilistic output are a different craft.",
    items: [
      { text: "No project involves AI as part of the product.", source: "portfolio" },
      { text: "None handles AI being wrong: errors, trust or fallback.", source: "portfolio" },
      { text: "No thinking on how users verify or correct the output.", source: "portfolio" },
      { text: "Nothing on latency, cost, or when AI should not be used.", source: "portfolio" },
      { text: "No view on what the user controls and what the system decides.", source: "portfolio" },
    ],
    fix: "Pick one flow you know and add an AI step. Design the failure states first.",
  },
  {
    name: "Communication & distribution",
    why: "A strong project nobody can follow, or find, scores zero.",
    items: [
      { text: "Case studies open with background and team, not the problem.", source: "portfolio" },
      { text: '"We" everywhere. My own role is unclear.', source: "portfolio" },
      { text: "A case study takes over five minutes to read, or is hard to read on a phone.", source: "portfolio" },
      { text: "No outcome stated at the top of each project.", source: "portfolio" },
      { text: "Nobody outside my portfolio has seen my work: no posts, talks or write-ups.", source: "self" },
    ],
    fix: "Rewrite the first three lines of every case study: problem, my role, result.",
  },
  {
    name: "The person, not the portfolio",
    why: "Interviews are won on how you think out loud, not on screens.",
    items: [
      { text: 'My bio says "passionate designer who loves solving problems".', source: "portfolio" },
      { text: "I can't explain my best project in two minutes, aloud.", source: "self" },
      { text: "No point of view anywhere: no writing, no talk, no stance.", source: "self" },
      { text: "I can't name what I am best at, or what I am still learning.", source: "portfolio" },
      { text: "My CV, LinkedIn and portfolio tell three different stories.", source: "resume" },
    ],
    fix: "Record yourself explaining your best project in two minutes. Rewrite the page to match.",
  },
] as const;

export type ItemSource = "portfolio" | "resume" | "self";

export const BANDS = [
  {
    max: 5,
    name: "Strong",
    msg: "Your portfolio reads as someone who thinks. Interviewers will go deeper, so sharpen how you talk about the AI parts.",
  },
  {
    max: 12,
    name: "Fixable",
    msg: "The work is there, the story is not. Two or three fixes in your highest theme change the first impression.",
  },
  {
    max: 21,
    name: "Getting skimmed",
    msg: "A hiring manager decides before page two. Fix your top two themes before you apply anywhere.",
  },
  {
    max: 30,
    name: "Scrolled past",
    msg: "Do not polish. Rebuild one project around a decision, a result and your role. Start there.",
  },
] as const;

export const FLAT = THEMES.flatMap((theme, themeIndex) =>
  theme.items.map((item, itemIndex) => ({
    key: `${themeIndex}_${itemIndex}`,
    theme,
    themeIndex,
    item,
  }))
);

export const TOTAL = FLAT.length;

// Display-only: the 0-30 "problem count" (lower is better) converted to a
// conventional 0-100 health score (higher is better). Band classification
// below still runs on the raw problem count so thresholds never shift.
function toPercent(problems: number, possible: number) {
  return Math.round(((possible - problems) / possible) * 100);
}

// Each band's problem-count range re-expressed as the percent range a
// visitor would actually see, for the progress-bar labels, computed once
// here instead of hand-maintained, so it can't drift from BANDS.
export const BAND_PERCENT_LABELS = BANDS.map((b, i) => {
  const prevMax = i === 0 ? -1 : BANDS[i - 1].max;
  const hi = toPercent(prevMax + 1, TOTAL);
  const lo = toPercent(b.max, TOTAL);
  return `${lo}–${hi}`;
});

export type Answers = Record<string, boolean>;

// Shared by both the self-reported quiz (scoreOf) and an AI-scored live
// portfolio scan (src/app/api/score/analyze): same 6 per-theme 0-5 scores
// in, same band/top-fixes/percent logic out, regardless of where the scores
// came from.
export function summarize(scores: number[]) {
  const total = scores.reduce((a, b) => a + b, 0);
  const bandIndex = BANDS.findIndex((b) => total <= b.max);
  const band = BANDS[bandIndex];
  const percent = toPercent(total, TOTAL);
  const themePercents = THEMES.map((t, i) => toPercent(scores[i], t.items.length));
  const topFixes = THEMES.map((t, i) => ({ ...t, score: scores[i], percent: themePercents[i] }))
    .sort((a, b) => b.score - a.score)
    .filter((t) => t.score > 0)
    .slice(0, 3);
  return { scores, total, band, bandIndex, percent, themePercents, topFixes };
}

export function scoreOf(answers: Answers) {
  const scores = THEMES.map((t, i) => t.items.filter((_, j) => answers[`${i}_${j}`]).length);
  return summarize(scores);
}
