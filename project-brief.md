# Project Brief: Case Study Agent

**Status:** Draft v0.1
**Date:** 27 Sep 2026
**Owner:** _TBD_

---

## 1. Overview

A web-based AI agent that helps students turn scattered, mixed-format project material into polished, evidence-backed case studies. The material can include notes, images, documents, decks and links.

To the user it appears as **one agent**. Internally it runs a fixed pipeline of four specialised stages (Organiser → Strategist → Architect → Reviewer) over a single shared project state. That structure keeps outputs structurally consistent for every user and every generation.

### Goals
- Turn messy inputs into a structured, traceable project context.
- Help students choose a compelling, *honest* narrative, backed by evidence.
- Produce a publish-ready case study, a quick-screen summary and an agent-readable version.
- Give multi-perspective feedback like a real hiring panel would.
- Keep output logic stable and versioned as the product onboards users.

### Non-goals (v1)
- Hosting or publishing portfolios. The agent exports; it doesn't host.
- Real-time collaborative editing.
- Keyword-volume SEO research.

### Target users
Students and early-career professionals in design, product and tech who are building portfolio case studies.

---

## 2. Design Principles

1. **One agent, four stages.** A single orchestrator owns state. The stages are steps with strict input and output contracts, not free-roaming agents.
2. **Shared constitution prompt.** One base prompt (identity, house style, honesty rules, formatting rules) is prepended to every stage. Each stage adds only its role prompt.
3. **Structured output first, Markdown second.** Each stage returns JSON validated against a schema. Code renders the JSON into `.md` via fixed templates, so the LLM never decides file layout.
4. **Traceable IDs.** Sources (`S-001`), claims (`C-001`) and assets (`A-001`) carry IDs through every stage.
5. **Deterministic pipeline with human gates.** Agentic freedom exists only *inside* a stage, for example when the Organiser decides how to parse a file.
6. **Honesty by default.** Unsupported claims are softened or dropped. AI-generated imagery is always labelled as such.

---

## 3. System Architecture

```
Intake form + uploads
        │
   ┌────▼─────┐   ┌────────────┐   [user picks A/B]   ┌───────────┐   ┌──────────┐
   │Organiser │──▶│ Strategist │────────────────────▶│ Architect │──▶│ Reviewer │
   └──────────┘   └────────────┘                     └───────────┘   └────┬─────┘
        ▲                                                  ▲              │
        └──────────── shared Project Context (files + DB) ─┴── fix loop ◀─┘ (max 2)
```

### Project Context structure (identical for every project)

```
/projects/{id}/
  manifest.json            # pipeline version, model IDs, prompt versions, stage status, hashes
  00_intake.json           # form data
  01_context/
    sources.md             # normalised artifacts with S-IDs, extracted text, image descriptions
    claims.md              # atomic claims (C-IDs) linked to source IDs
    assets.md              # images/screens with vision descriptions + usability flag
    timeline.md
    open_questions.md      # unresolved gaps
  02_strategy/
    evidence_matrix.md     # claim → strong / weak / unsupported → evidence needed
    option_A.md
    option_B.md
    selection.json         # user's choice + edits
  03_draft/
    case_study.md
    summary.md             # ~100-word screening TL;DR
    case_study.agent.json  # agent-friendly version
    image_plan.json        # shot list: purpose, prompt, section, generated/original flag
    images/
  04_review/
    technical_seo.md
    design_head.md
    product_manager.md
    hr.md
    scorecard.json         # aggregated scores + prioritised fixes
```

---

## 4. Stage Specifications

### 4.1 Organiser

**Purpose:** Collect everything and organise it into a structured project context.

**Inputs:** intake form and uploaded artifacts (PDF, DOCX, PPTX, images, URLs, optionally Figma links).

**Intake form fields:**
| Field | Required |
|---|---|
| Project title | ✅ |
| Student's role | ✅ |
| Team size & composition | ✅ |
| Duration / dates | ✅ |
| Problem statement | ✅ |
| Outcomes & metrics | ⬜ |
| Target roles / audience (e.g. product design, PM) | ✅ |
| Confidentiality / NDA constraints | ✅ |
| Relevant links | ⬜ |
| Preferred length (short / standard / long) | ✅ |

**Process:**
1. Parse and extract text; describe images with vision; dedupe.
2. Assign `S-`, `A-` IDs.
3. Decompose into atomic claims (`C-` IDs) linked to sources.
4. Build the timeline.
5. Ask at most 3–5 clarifying questions. Log the remaining gaps in `open_questions.md`.

**Outputs:** `00_intake.json`, all files in `01_context/`.

**Done when:** every artifact is represented in `sources.md`, and every claim has at least one source ID or is explicitly marked "self-reported".

---

### 4.2 Strategist

**Purpose:** Recommend how to tell the story.

**Inputs:** `01_context/*`, `00_intake.json`.

**Process:**
1. Build the **evidence matrix**. Each claim is rated strong, weak or unsupported, with the evidence needed to strengthen it.
2. Evaluate narrative angles against the target audience. The angle library is config-driven, e.g. problem-solver, research-led, systems thinker, impact/metrics-led, craft-led.
3. Produce **exactly two options** in an identical schema:
   - Narrative angle and one-line thesis
   - Tone of voice
   - Narrative arc (section-level)
   - Hero claims carrying the story
   - Claims to soften or drop
   - Evidence the student should add (optional asks)
   - Risks and trade-offs

**Human gate:** the pipeline pauses until the user selects an option and optionally edits it.

**Outputs:** `02_strategy/*`.

---

### 4.3 Architect

**Purpose:** Build the case study from the selected direction.

**Inputs:** `selection.json`, `01_context/*`, `evidence_matrix.md`.

**Process:**
1. Generate the outline from the section template for the chosen angle and length.
2. Draft each section. Claims must cite `C-` IDs internally; only strong claims or softened claims are allowed.
3. Create the **image plan**. For each visual, record its purpose, target section, type (hero / mockup / diagram / annotated screenshot), and whether it uses an original asset or needs generation.
4. Generate images via the OpenAI image API. Every generated image is tagged `ai_generated: true` and captioned "AI-generated illustration".
5. Write the **summary**: a fixed-length TL;DR (~100 words) covering role, problem, approach and outcome.
6. Build the **agent-friendly version** (`case_study.agent.json`): sections with IDs, claims with evidence links, asset URLs with alt text, metadata and tone. Downstream agents such as portfolio-site builders can consume it without reparsing prose.

**Outputs:** `03_draft/*`.

---

### 4.4 Reviewer

**Purpose:** Evaluate the case study the way a hiring panel would.

**Inputs:** `03_draft/*`, `02_strategy/selection.json`, `00_intake.json`.

**Lenses:** run in parallel, all with the same rubric schema.

| Lens | Focus |
|---|---|
| Technical / Readability / SEO | Structure, clarity, scannability, headings, metadata, alt text |
| Design Head | Process depth, craft, decision rationale, visual storytelling |
| Product Manager | Problem framing, trade-offs, metrics, business impact |
| HR / Recruiter | Clarity of the student's role, skimmability, red flags, fit for target roles |

**Computed checks (in code, not by the LLM):** readability score, heading hierarchy, word count per section, alt-text coverage, meta description length, keyword presence, and the ratio of AI-generated to original images.

**Rubric schema for each lens:**
```json
{
  "lens": "product_manager",
  "scores": [{ "criterion": "string", "score": 1, "rationale": "string" }],
  "issues": [{ "severity": "high|medium|low", "section_id": "string", "issue": "string", "suggested_fix": "string" }],
  "overall": 1
}
```

**Fix loop:** the user can choose "Apply fixes", which sends targeted section edits back to the Architect. The loop is capped at 2 rounds.

**Outputs:** `04_review/*`.

---

## 5. Consistency & Versioning

- **Prompt registry in git:** the constitution, stage prompts, lens prompts, schemas and templates.
- **Config-driven content:** rubrics, the angle and tone libraries, section templates and form fields live in JSON config.
- **Pinned models:** use explicit model snapshot IDs, not aliases.
- **Generation stamping:** `manifest.json` records `pipeline_version`, prompt versions, model IDs and a hash for each stage output.
- **Hard guardrails in code:**
  - Schema validation on every stage output, with retry on failure.
  - Exactly two strategy options.
  - A claim cannot appear in the draft unless the matrix rates it strong or it has been softened.
  - The summary has a hard word limit.
  - Every generated image carries the AI label.
- **Golden test set:** 10–20 representative projects (messy, thin, NDA-bound, image-heavy, metrics-rich). Rerun them on every prompt or model change, and diff schema validity, scores, structure and length.

---

## 6. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js: intake form, uploads, stage progress, A/B picker, draft editor, scorecard view |
| Orchestration | Durable workflow engine (Inngest / Trigger.dev / Temporal) with resumable steps |
| LLM calls | Direct API calls with structured outputs; agent SDK only inside the Organiser |
| Database | Postgres (e.g. Supabase): projects, versions, stage status, scores |
| File storage | S3 or Cloudflare R2: uploads and generated images |
| Parsing | Native LLM PDF/image input; a parsing service for difficult DOCX/PPTX/scans |
| Observability | Langfuse or Braintrust: traces, cost, evals |

---

## 7. API Keys & Services

| Need | Service | Status |
|---|---|---|
| Image generation | OpenAI | ✅ Available |
| Reasoning & writing (all stages) | Anthropic Claude API, *or* OpenAI text models to stay single-vendor | Required |
| File storage | AWS S3 / Cloudflare R2 | Required |
| Database | Supabase / Postgres | Required |
| Auth | Clerk / Supabase Auth | Required |
| Background jobs | Inngest / Trigger.dev | Strongly recommended |
| Content moderation | OpenAI Moderation (same key) | Recommended |
| Tracing, cost, evals | Langfuse / Braintrust | Strongly recommended |
| Difficult document parsing | LlamaParse / Unstructured | Optional |
| URL ingestion | Firecrawl / Jina Reader | Optional |
| Figma artifacts | Figma token / OAuth | Optional |
| Keyword data | DataForSEO | Optional (likely unnecessary) |

---

## 8. Roadmap

| Phase | Scope | Exit criteria |
|---|---|---|
| **1. Foundation** | Organiser + Strategist (text only), project context structure, A/B gate, schemas, constitution prompt | Golden set produces valid context + two options for every project |
| **2. Creation** | Architect: draft, summary, agent JSON, image plan + generation | End-to-end draft for all golden projects; images labelled |
| **3. Review** | Reviewer (4 lenses), computed SEO checks, scorecard, fix loop | Scores stable across reruns; fix loop improves flagged issues |
| **4. Scale** | Auth, quotas and cost caps per user, eval CI, observability, moderation | Ready for user onboarding |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI mockups mistaken for real shipped work | Mandatory labelling in content + metadata; reviewer flags a high AI-image ratio |
| Inflated or fabricated claims | Evidence matrix gate; claims traceable to sources; "self-reported" tagging |
| Confidential / NDA material | NDA field in intake; redaction step; private storage; deletion on request |
| Output drift over time | Pinned models, versioned prompts, golden-set regression tests |
| Long runs failing mid-way | Durable workflows with resumable steps and retries |
| Cost per case study | Per-user quotas, image caps, caching of stage outputs |

---

## 10. Open Questions

- Single LLM vendor (OpenAI only) or Claude for writing plus OpenAI for images?
- Export formats beyond Markdown (PDF, Notion, Webflow/Framer)?
- Is there a free vs. paid tier, and what limits apply to each?
- Should students be able to edit intermediate stages (e.g. the claims list) directly?
- How long should uploaded artifacts be retained?
