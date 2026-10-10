# Case Study Reference — Structure & Storytelling Patterns

Research notes from top design-first companies' case studies, collected to
sanity-check and improve the agent's output structure (`overview → problem →
process → solution → outcome → reflection` in `prompts/architect.md`).

Sources: official design-team blogs (Meta, Google, Microsoft, Swiggy, Slack)
plus widely-cited portfolio case studies and third-party analyses (Amazon,
Razorpay, Blinkit, Uber, Airbnb) — the genre students actually write and the
one this agent produces. Links at the bottom.

**A detailed, section-by-section paraphrase of each source — every fact,
number, and decision, just not the original authors' sentences — lives
under [`sources/`](sources/), one file per case study.** This file below is
a step further removed: my own analysis of the patterns across all of them.
Nothing here is a verbatim copy of any published article — see the note at
the end for why.

---

## 1. Meta — "Evolving the Facebook News Feed to Serve You Better"

- **Opens** on scale + user voice: "two billion people," then "people told us
  News Feed had become cluttered and hard to navigate" — problem stated in
  the user's own words, not the team's.
- **Sections are the three outcomes shipped**, not the four-phase process:
  *Improving readability* / *Making comments more conversational* / *Making
  navigation easier*. Each section = one problem → what was tried → what
  shipped, repeated three times rather than one long linear narrative.
- **Shows failed attempts on the way** ("text on photos" hurt legibility)
  before the shipped fix — this is what makes it read as process, not a
  highlight reel.
- **Closes** with "design is never finished" + team credits. No reflection
  on what the team would do differently — the humility is folded into "never
  finished," not spelled out as lessons.

## 2. Meta — "Reactions: Not Everything in Life Is Likable"

- **Opens** on an emotional gap: the Like button couldn't fit grief or
  outrage — states the human problem before any UI problem.
- **Two parallel tracks named explicitly**: (1) which reactions to offer,
  (2) how to input/display them. Naming the tracks up front lets the piece
  cover both without the reader losing the thread.
- **Research is enumerated as a list of methods** (stickers, search terms,
  short comments, international surveys) rather than narrated — a fast,
  credible way to cover "how we knew" without slowing the story down.
- **Decisions get one-line rationale each**, not re-litigated: five
  reactions, specific order, a "Bling String" showing top three + count.

## 3. Google — "Designing the UI of Google Translate" (a fish in your ear)

- **Opens on a metaphor** (universal translator as an old human fantasy),
  then immediately pivots to the real number: "38% of users didn't know
  these tools existed." Metaphor earns the reader's attention; the stat
  earns their belief.
- **Tension–resolution structure**: first attempt (make it bigger/louder)
  *failed* — users read it as promo clutter. Second attempt (minimal,
  familiar changes: text labels, restructured icons) worked. The case study
  is built around one wrong turn, not a straight line to the right answer —
  this is the single most common shape across every strong case study here.
- **Outcome is a specific, surprising number** ("handwriting used 25% more"),
  not a vague "engagement improved."
- **Closes open-ended** — "we keep iterating" — no inflated claim of final
  success.

## 4. Microsoft — "Redesigning the Office App Icons"

- **Opens on a relatable admission**: "nothing is more intimidating than the
  blank page... probably never faced a redesign" — vulnerability before
  authority.
- **Problem framed in three beats**: how long since the last change, how
  much the product changed underneath the icons, how many/how varied the
  users now are. Three short, concrete reasons beat one abstract one.
- **Each design decision gets its own named section with a one-line "why"**
  (decouple letter from symbol; drop literal document/spreadsheet outlines
  for content-shaped icons) — structure mirrors "solution" in the agent's
  template: describe the thing and the selection criterion together, not
  decision history.
- **Closes by framing the work as ongoing + pointing at the team** —
  consistent with Meta's closing pattern. Official company blogs almost
  never end on a reflection/lessons-learned beat; that's a portfolio-case-study
  convention (see below), not a company-blog one.

## 5. Amazon — "Decoding Amazon UX: the One-Click Purchase"

- **Opens on friction, quantified**: late-90s checkout as a multi-step slog,
  "~70% of carts abandoned."
- **Headings are plain questions/claims** ("Why One Click Actually Worked",
  "The Bigger UI/UX Lesson") rather than generic phase names — reads more
  like an essay with a thesis than a design-process report.
- **Pulls back to a general principle** before closing ("align with user
  intent over feature accumulation") and cites the idea's later industry
  spread (Apple Pay, UPI) as retroactive validation — a technique unique to
  analysis-of-a-classic pieces, less common in first-person "I shipped this"
  case studies.

## 6. Razorpay — "Redefining Product Discovery at Razorpay" (portfolio case study)

This is the genre students in this product actually produce — useful as a
direct structural comparator.

- **Opens with scope-setting, not narrative**: a short "Definitions" section
  (Products, Features, High/Low-Intent Users) before any story starts — this
  reads as rigorous but costs momentum; the strongest company case studies
  above never do this, they fold definitions into the sentence that needs
  them.
- **Discloses constraints up front**: solo project, 2 weeks, problem
  statement handed down rather than self-discovered, no problem validation
  done. Naming the constraint *before* it becomes a gap the reader notices
  reads as credibility, not weakness.
- **Competitive analysis is its own section** (Zendesk, Freshworks, Stripe) —
  common in portfolio case studies, rare in official company ones (companies
  don't publicly benchmark competitors; portfolio authors use it to prove
  research rigor to a hiring audience).
- **Reflection is explicit and metric-shaped even without real data**:
  proposes session time / CTR / drop-off as the metrics that *would* prove
  it worked, and says plainly these are hypotheses, not measured outcomes.
  This is the opposite of this agent's `reflection` rule (zero numbers) —
  portfolio authors reach for numbers in reflection precisely because they
  have none in outcome. Worth noting as a known failure mode to design
  against, not a pattern to copy.
- **Ends with an approachable personal note + contact links** — a hiring-context
  convention, not relevant to the agent's output.

## 7. Blinkit — "Improving Blinkit's Search Flow" (portfolio case study)

- **Opens on a persona ("Jane," a busy parent)** rather than a stat — the
  most emotionally warm opening of everything reviewed, but also the
  slowest to get to the actual problem; the best official case studies above
  get to the real stat within one or two sentences instead.
- **Research is split and labeled "Secondary" vs "Primary"** with citation
  of outside stats (Adobe, Google) alongside its own five user interviews —
  a credibility move that compensates for a small sample.
- **"How Might We" framing** bridges research → ideation explicitly, naming
  the method rather than just showing the result — makes the leap from
  problem to solution feel less arbitrary.
- **Before/after screens shown with business rationale attached to each
  change** ("Recently Bought improves AOV and retention") — ties every UI
  decision back to a named business metric instead of just usability.
- **Usability testing is a distinct, late section** with quantitative
  results (task completion, heatmaps) *before* a final-iteration section —
  i.e., the solution shown isn't the final one; it gets revised on camera.
- **Closing "My Learnings" section** is explicitly skills-reflection
  ("UI skills," "communication skills") — again a hiring-portfolio
  convention not present in official company blogs.

## 8. Swiggy — "Redesigning Swiggy's New User Onboarding" (official, Swiggy Design)

- **Opens on a metaphor** (onboarding as walking into "a cozy neighbourhood
  store" that already knows you) — warmer than the stat-first opens above,
  closer to the portfolio style, but it's an official company blog, showing
  the opening-style split isn't purely official-vs-portfolio.
- **Problem framed as three named objectives up front** (match new 2021
  design language, fix usability issues, raise visibility of non-food
  verticals) rather than one single pain point — useful when a project
  genuinely has multiple drivers; `problem` in this agent's template should
  still pick the ones that actually motivated the work, not list every
  possible goal.
- **Process includes a competitive benchmarking step** ("dozens of apps"
  evaluated against structured questions) — rare in the purely-official
  Western company blogs above, common once research is cross-functional.
- **States a real A/B result with a named constraint**: "forced signup
  created friction; making email optional increased signups" — then
  explicitly flags "I'm not allowed to disclose actual numbers." This is
  the one official piece that shows how to report a real outcome
  honestly under an NDA: directional result, mechanism named, exact figure
  withheld — a legitimate pattern for `outcome` when a user genuinely
  can't share a number, rather than inventing one.
- **Closes on personal reflection** (stakeholder management, balancing
  business vs. user view) — official blog that still ends in
  lessons-learned, closer to the portfolio convention than Meta/Microsoft's
  "never finished" close.

## 9. Airbnb — "Airbnb Invites You In" (Google Design / Material Design case study)

- **Opens on the business-level tension**: convincing strangers to share
  their homes, building trust at global scale — the problem is framed as a
  trust/brand problem, not a UI problem, before any screen is shown.
- **Four design principles named up front** (unified, universal,
  conversational, iconic) act as the spine the rest of the piece hangs off
  — each subsequent section maps back to one of these words explicitly.
- **Each design decision is backed by a named team member's quote**
  ("It's important to create an app that is clearly recognizable as
  Airbnb, no matter the platform") rather than the team's own voice — a
  third-party-told case study (Google telling Airbnb's story) leans on
  attributed quotes for authority it can't claim first-person.
- **Outcome is reception, not usage metrics**: star rating, review count,
  an industry award, a platform editorial placement — a legitimate
  substitute for product metrics when the deliverable is a visual/brand
  system rather than a conversion-driving flow.

## 10. Uber — "Uber UX Case Study: Improving the Pickup Experience" (portfolio, design-fellowship project)

- **Opens on a personal anecdote** (a ride cancelled in bad weather) before
  stating the design question — same pattern as Blinkit's "Jane" persona:
  portfolio case studies reach for a lived moment, official blogs reach for
  a stat.
- **Problem is stated as a single open question** ("how can we make it
  easier for drivers and riders to find each other?") backed by three
  concrete, named failure modes (GPS drift, building confusion, street-side
  ambiguity) — a question framed problem still needs the specifics attached
  immediately or it stays abstract.
- **Personas carry direct quotes standing in for research** where real
  access wasn't possible — and the piece says so directly ("I can't access
  the Uber Driver interface"). Naming the access limitation explicitly reads
  as more credible than silently working around it.
- **Shows the sketch-to-high-fidelity-to-animation progression** as its own
  visible arc, not just a final screen — process-as-evidence, the same
  function Blinkit's wireframe section serves.
- **Ends by proposing its own next-research-steps** rather than claiming
  completion — an honest close for a project with no real usage data to
  report in `outcome`.

## 11. Slack — "Designing Teamwork: How Our Customers Shaped the Future of Slack" (official, Slack Design)

- **Problem is interface entropy, stated plainly**: "over a dozen places to
  click," duplicate search bars — specific, countable symptoms of
  complexity rather than an adjective like "cluttered."
- **Process sections are named as collaboration beats, not research
  phases**: *Assembling the team* → *Co-designing with customers* →
  *Learning from beginners* → *Getting the details just right*. Each
  heading names what happened to the relationship with users, not the
  deliverable produced — a heading style worth borrowing for `process`
  subsections when the story's spine is "who we looped in and when."
- **100 real customers co-designed in a shared channel over weeks/months**,
  described as ongoing dialogue rather than a single research round —
  contrasts with the single-sprint research typical of portfolio pieces.
- **Admits a specific internal miss** ("we weren't our favorite") about an
  interim version before the shipped one — the tension-before-resolution
  pattern again, this time about the team's own taste, not a user-testing
  failure.
- **Outcome is comparative, not absolute**: a second usability round "beat
  or tied the existing design" — an honest, modest success claim rather
  than an inflated win.
- **Closes by naming the stakes of changing a daily-use tool** ("nine hours
  every workday") and frames the release as a foundation, not an endpoint —
  the "never finished" close again, Slack's version of it.

---

<!-- feeler:start -->
## Cross-cutting patterns

**The near-universal shape is tension → resolution, not steps.** The
strongest pieces (Google Translate, Reactions, News Feed) are built around at
least one *wrong* first attempt before the shipped answer, stated plainly.
A case study that only shows the final solution reads flatter than one that
shows the dead end first — worth encouraging in `process`.

**Problem is stated in a user's voice or a number within the first 1–2
sentences** in most official company pieces (Meta, Microsoft, Slack, Amazon).
It's not a strict official-vs-portfolio split, though — Swiggy and Uber
(one official, one portfolio) both open on a metaphor/anecdote instead and
still get to a concrete, countable problem within a paragraph or two. The
actual failure mode, seen only in Razorpay and Blinkit, is delaying the
real problem behind scope definitions or persona set-dressing for several
paragraphs — the opening device (stat, metaphor, anecdote) matters less
than how fast it resolves into something specific.

**Solutions get one-line "why," attached to the decision, not narrated
separately.** "We decoupled the letter from the symbol, to keep both
familiar and simple" — the rationale and the decision are one sentence. This
matches `architect.md`'s rule that `solution` owns selection criteria
inline, not as a separate justification paragraph.

**Numbers cluster at two points: the opening problem stat, and the closing
outcome stat.** Nobody scatters numbers evenly through the middle — the
middle (process) is almost number-free, qualitative description of what was
tried. This matches the architect's claim-by-section discipline (`outcome`
owns the numbers) better than it matches typical student case studies, which
tend to front-load numbers into research sections too.

**Reflection, where it appears, is the one section that is genre-dependent.**
Meta, Microsoft, Google and Slack close on "it's never finished" + team
credit instead of a lessons-learned beat. Swiggy (official) and every
portfolio case study do add explicit reflection — and that's exactly where
number-leakage happens (Razorpay's reflection proposes metrics; Swiggy's
leans on withheld-number language instead). The agent's hard rule (zero
numbers in `reflection`) is guarding against the most common real-world
mistake in this genre, not a hypothetical one.

**When a real number can't be disclosed, name the mechanism and withhold the
figure explicitly — never invent a number to fill the gap.** Swiggy's piece
states the direction of a real A/B result ("making email optional increased
signups") and says outright that it can't share the exact figure. That's the
honest version of an outcome claim the agent can't fully evidence: specific
and directional, not padded with a plausible-sounding invented percentage.

**Headings name the outcome or the question, not the process phase.**
"Making comments more conversational," "Why One Click Actually Worked" read
better than "Research" or "Ideation" — a heading that previews the point
beats a heading that names the activity. Worth considering for how
`architect.md` labels subsections within a section (the section `id`s stay
fixed, but sub-headings inside a section are free text).
<!-- feeler:end -->

---

## Sources

Each row links the original (for reading in full) and this project's own
paraphrase under `sources/` (for reuse without a copyright concern).

- Evolving the Facebook News Feed to Serve You Better — Meta Design — [original](https://medium.com/facebook-design/evolving-the-facebook-news-feed-to-serve-you-better-f844a5cb903d) · [notes](sources/meta-news-feed-evolution.md)
- Reactions: Not Everything in Life Is Likable — Meta Design, Geoff Teehan — [original](https://medium.com/facebook-design/reactions-not-everything-in-life-is-likable-5c403de72a3f) · [notes](sources/meta-reactions.md)
- Designing the UI of Google Translate (a fish in your ear) — Google Design, Pendar Yousefi — [original](https://medium.com/google-design/a-fish-in-your-ear-134deed70268) · [notes](sources/google-translate-ui.md)
- Redesigning the Office App Icons to Embrace a New World of Work — Microsoft Design, Jon Friedman — [original](https://microsoft.design/articles/redesigning-the-office-app-icons-to-embrace-a-new-world-of-work/) · [notes](sources/microsoft-office-icons.md)
- Decoding Amazon UX: the One-Click Purchase Experience — [original](https://medium.com/@designstudiouiux/decoding-amazon-ux-behind-one-click-bfafcf6785e3) · [notes](sources/amazon-one-click.md)
- Case study: Redefining Product Discovery at Razorpay — [original](https://medium.com/design-bootcamp/case-study-redefining-product-discovery-at-razorpay-4d3377619924) · [notes](sources/razorpay-product-discovery.md)
- Enhancing Blinkit's Search Flow — [original](https://medium.com/uxm-community/aim-to-improve-the-search-flow-of-blinkit-app-da8e8338a243) · [notes](sources/blinkit-search-flow.md)
- Redesigning Swiggy's New User Onboarding — Swiggy Design — [original](https://medium.com/swiggydesign/redesigning-swiggys-new-user-onboarding-a-product-design-case-study-aed6eb564655) · [notes](sources/swiggy-onboarding.md)
- Airbnb Invites You In — Google Design, on Airbnb's Material Design system — [original](https://design.google/library/airbnb-invites-you-in) · [notes](sources/airbnb-material-design.md)
- Uber UX Case Study: Improving the Pickup Experience — Kleiner Perkins Design Fellows project — [original](https://vickyye.medium.com/uber-ux-case-study-94866f471c26) · [notes](sources/uber-pickup-experience.md)
- Designing Teamwork: How Our Customers Shaped the Future of Slack — Slack Design — [original](https://slack.design/articles/designing-teamwork-how-our-customers-shaped-the-future-of-slack/) · [notes](sources/slack-designing-teamwork.md)
- [Case Study Club](https://www.casestudy.club/case-studies) — curated index of 580+ official and portfolio case studies, useful for future sourcing

## A note on "complete" case studies

These notes are detailed, original-wording paraphrases — every section,
decision, number, and named detail from each source is covered — but they
are not verbatim copies of the published articles. Saving full copyrighted
text (even into a private local file) isn't something this assistant will
do; facts and structure aren't copyrightable, the specific published prose
is. To read a source's actual words, follow its link above.
