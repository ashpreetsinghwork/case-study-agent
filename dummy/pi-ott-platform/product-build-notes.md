# Product build notes

## Subscription page — two rounds of problems

**Round 1 issue:** Price takes too much dominance on the page without
actually explaining what the subscription offers. Students would see the
number before understanding the value.

**Round 2 issue:** Since the plans are sticky (pinned while scrolling),
there isn't enough scrolling area left on the page for the rest of the
content to breathe.

Screenshots: `subscription-price-dominant-iteration.png` (round 1),
`subscription-sticky-plans-issue.png` (round 2), and
`subscription-final-bento-1.png` / `subscription-final-bento-2.png` for
where the page landed after fixing both.

## Ask AI — "the pen wala doubt feature"

Built a feature that lets students doubt-solve mid-class by basically
writing/drawing their doubt and getting it resolved by AI, pen-first
instead of typing a question out. Internally we just call it "the pen
wala doubt feature" — it's one of the most-loved things we shipped.

## Practice & Test Arena

Added a dedicated space for practice and test attempts, decoupled from
the live-class schedule, so students can self-test on their own time
instead of waiting for a scheduled test window. Screenshot:
`practice-test-arena.png`.
