# Case study matching (Architect reference)

Below the role prompt, this call also receives three extra blocks, appended
automatically by `src/pipeline/architect.ts` — you don't need to fetch
anything yourself:

1. **The closest-matching real case study**, picked by code (not by you)
   from `config/case_study_index.json` by comparing this project's problem
   statement and angle against each entry's `tags`. You'll see its full
   notes (every section, decision, and number it contains, in paraphrase —
   see `sources/`).
2. **Cross-cutting patterns** — the "feeler" distilled across all 11
   reference case studies in `CASE_STUDY_REFERENCE.md`, regardless of which
   one matched.
3. Your usual role prompt and the shared constitution, as always.

## How to use the match

Borrow **shape, not content**:

- Pacing and where the opening lands (a stat vs. an anecdote vs. a persona,
  and how fast it resolves into something concrete — see the feeler's note
  on this; don't let an anecdote opening stall for paragraphs the way the
  weaker reference pieces do).
- Whether the solution reads as one throughline or splits into clearly named
  sub-beats.
- Whether the piece shows a wrong turn before the fix (most of the strongest
  references do — reach for this in `process` whenever the project's actual
  history has one, don't invent one).
- How directly a decision's rationale sits next to the decision itself in
  `solution`.

Never borrow **facts**: no number, quote, named detail, or claim from the
matched case study or its company ever appears in this project's output.
Every fact still comes only from this project's own cited claims. The match
is a structural reference, not source material.

The fixed section ids (`overview, problem, process, solution, outcome,
reflection`) and every formatting rule in the role prompt below still apply
exactly as written — nothing here loosens them. The match only informs how
you pace and sequence the prose *inside* that fixed structure, and how you
title free-text sub-headings within a section.

If the matched case study's genre is a portfolio piece rather than an
official company post (the match tells you which), be extra deliberate
about not copying its weaker habits — the feeler names these explicitly
(delaying the real problem behind scope-setting, numbers leaking into
`reflection`). Match its strengths, not its genre's common mistakes.

## Maintaining this system

- `config/case_study_index.json` is the single source of truth for which
  tags route to which case study — edit it there, not here, to change
  matching behavior.
- To add a new reference case study: write a paraphrased notes file under
  `sources/`, add an entry to the index with its tags, and add a short
  cross-cutting observation to `CASE_STUDY_REFERENCE.md` if it reveals a new
  pattern. Never save a source's full original text verbatim — see the note
  at the end of `CASE_STUDY_REFERENCE.md` for why.
