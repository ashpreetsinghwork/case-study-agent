# Dummy test files

Six sample projects, covering different project shapes a student might
actually bring in: a redesign, a 0-to-1 build, a small value-add feature,
a small growth experiment, and two more covering enterprise B2B and
consumer-mobile shapes. The first two are grounded in real, published case
studies (so you can compare the agent's output against the real thing);
the rest are realistic-but-synthetic test fixtures with no real source to
compare against — see the breakdown below.

The last two (`pulsehr-approval-redesign/`, `trailmap-onboarding/`) are
also the only ones covering the full realistic upload-format mix — typed
notes, a PDF, a spreadsheet export, and screenshots — rather than just
notes + images like the four above.

## `course-listing-redesign/` — redesign (real source)

Raw research materials recreated from a real, published case study — PW's
course listing redesign
(https://ashpreetsingh.com/projects/course-listing-redesign). Run these
through the pipeline and compare the output against the real, human-written
case study at that URL — numbers, quotes and screenshots are taken from the
published page.

Files:

- `survey-and-interview-notes.md` — empathize-phase research: survey stats
  (30% / 25% / 45%) and the per-exam-category decision criteria (UPSC /
  JEE-NEET / CA). Tests markdown extraction.
- `card-variant-feedback.md` — design-crit notes on the four batch-card
  directions explored, referencing the four `card-variant-*.png` screens.
- `usability-testing-notes.md` — the 9-student (3 per exam category)
  Google Meet testing round: primary question, follow-ups, and the three
  synthesized key takeaways.
- `metrics-and-shipping-notes.md` — project facts (4 months, Android/iOS/
  Web), the post-launch business metrics (+2.42% ARPU, +4.4% conversion,
  ~40Cr revenue impact), the AI-thumbnail-generator side project, and the
  three closing learnings.
- `images/` — 14 real screenshots from the published case study: the
  annotated gap analysis of the old card, all four card variants, the
  final card iterations, and the shipped bento-grid screens. Tests the
  vision path — these get sent to the model as images, not parsed as text.

The intake form's dev-only "Autofill" button (`/new`, non-production builds)
wires up a representative subset of this set automatically — all four
`.md` files plus 7 of the 14 images, chosen to keep the vision-input
payload reasonable rather than sending all 14 on every test run. The rest
of `images/` is there for manual upload if you want the full picture.

## `pi-ott-platform/` — 0-to-1 build (real source)

Same idea, for PW's Pi — an OTT-style learning platform built from scratch
(https://ashpreetsingh.com/projects/pw-pi). Covers a different project
shape than the redesign above: positioning against competitors, naming/
branding rationale, and a from-zero product build rather than iterating on
an existing screen.

Files:

- `positioning-research-notes.md` — why the product needed to exist, the
  constraints of PW's existing live-course model, and the Seekho/YouTube/
  Netflix competitive scan that shaped the positioning.
- `branding-notes.md` — the naming rationale (including the founder's Pi
  tattoo and the circle/infinity logic) behind the name "Pi."
- `product-build-notes.md` — the subscription page's two rounds of
  problems, the "Ask AI" doubt-solving feature, and the Practice & Test
  Arena.
- `ai-thumbnail-automation-notes.md` — the prompt-writer workflow built to
  scale thumbnail generation, its demo numbers, and Slack adoption.
- `metrics-and-reviews.md` — project facts, the headline numbers (5.57L
  paid subscribers, 50K+ DAU, 30Cr revenue), real user review quotes, and
  the three closing takeaways.
- `images/` — 13 real screenshots: the three competitor positioning shots,
  branding/naming artifacts, onboarding sketches, both subscription-page
  problem iterations and two final screens, the test arena, and the
  thumbnail workflow + Slack adoption shots. (The one GIF on the source
  page — the Ask AI demo — was skipped; at 9MB+ it's disproportionate to
  a test fixture, and `product-build-notes.md` covers what it shows.)

Not wired into the "Autofill" button — upload manually to test with this
set instead of the course-listing one.

## `quickbite-reorder-feature/` — small value-add feature (synthetic)

A fictional food-delivery app (QuickBite) shipping a single "Reorder my
usual" button — deliberately small in scope (not a redesign, one button
and the flow behind it), shipped in under 4 weeks. No real source exists
for this shape of project on the reference portfolio, so this one is
written to be realistic and internally consistent, not scraped from a
real company — there's nothing here to "compare against," it's a fixture
for exercising the pipeline on a small-scope project.

Files: `user-notes.md` (intercept interviews on repeat-order friction),
`metrics-summary.md` (pilot metrics). No images — there's no real product
to screenshot.

## `flowly-pricing-growth-test/` — small growth experiment (synthetic)

A fictional SaaS product (Flowly) running a 2-week A/B test adding social
proof (customer count + testimonials) to its pricing page. Same caveat as
above: synthetic, realistic, nothing to compare against — built to give
the pipeline a tight, single-metric growth-experiment shape to work with
alongside the bigger redesign/build projects.

Files: `experiment-notes.md` (hypothesis and what shipped),
`results-summary.md` (A/B results — a 4.8% → 6.1% signup-conversion lift).
No images, same reasoning as above.

## `pulsehr-approval-redesign/` — enterprise B2B feature (synthetic)

A fictional internal HR tool (PulseHR) redesigning its leave-request
approval queue. Chosen to cover a B2B/enterprise shape (manager + employee
dual-sided problem) and, more importantly, to exercise every upload format
a student might realistically bring in at once.

Files: `interview-notes.md` (typed notes — manager/employee quotes),
`research-brief.pdf` (a one-page survey write-up — tests the native PDF
input path), `approval-metrics.csv` (a baseline-vs-pilot metrics export —
see the note below on why this is `.csv` and not `.xlsx`), and two
screenshots (`before-approval-screen.png`, `after-approval-inbox.png`).

## `trailmap-onboarding/` — consumer mobile feature (synthetic)

A fictional hiking app (Trailmap) adding a skill-level question to its
onboarding flow. Same four-format coverage as `pulsehr-approval-redesign/`,
for a consumer-mobile project shape instead of B2B.

Files: `user-research-notes.md` (typed notes — usability session
observations), `competitor-scan.pdf` (a short desk-research PDF), a funnel
spreadsheet export (`onboarding-funnel.csv`), and two screenshots
(`before-generic-list.png`, `after-skill-quiz.png`).

## Not included

A `.docx`/`.pptx` sample, for any of the six. That path isn't implemented
yet — uploading one just gets logged to `open_questions.md` instead of
parsed, which you can test by dropping in a real one if you want to see
that behavior.

A real `.xlsx` binary. `src/lib/extract.ts` doesn't special-case
spreadsheets at all yet — `.xlsx` and `.csv` both currently fall into the
same unparsed path as `.docx`/`.pptx` (logged to `open_questions.md`, not
read). The two spreadsheet fixtures above are `.csv` rather than true
`.xlsx` binaries since generating a real `.xlsx` needs a zip/OOXML-writing
dependency this repo doesn't otherwise have a use for — `.csv` exercises
the identical "unsupported, please convert" code path today, so nothing is
lost for testing purposes. If real `.xlsx` parsing becomes a feature, these
are the two fixtures to extend first.
