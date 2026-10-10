---
title: "Designing the UI of Google Translate (\"a fish in your ear\")"
company: Google (Google Design)
author: Pendar Yousefi, UX Manager, Google Translate
source_url: https://medium.com/google-design/a-fish-in-your-ear-134deed70268
published: 2018-05-21
retrieved: 2026-10-09
note: Detailed original-wording paraphrase, not a verbatim copy — see note at bottom of CASE_STUDY_REFERENCE.md
---

## Opening

Yousefi opens on the long human fantasy of a device that instantly breaks
language barriers, and positions Google Translate's camera-translation and
real-time conversation modes as a working version of that fantasy —
features users reportedly find delightful and genuinely useful (language
learners, students, tourists).

## The problem

Despite that, usage data and research kept surfacing a gap: during user
interviews, people would ask for features the product already had. A
follow-up survey quantified it — 38% of users didn't know these tools
existed at all. The features worked; nobody could find them.

## First attempt (and why it failed)

The team's first hypothesis was straightforward: the entry points were too
small and visually hidden, so the fix was to make them bigger and more
colorful. They shipped an experimental UI built around that idea — and
usage of camera and conversation mode actually *dropped*. Digging into why,
they found people were pattern-matching the new colorful elements to feature-
promotion banners (a surface the UI had historically used for exactly that)
and tuning them out as "probably an ad," not a tool.

## Second attempt (what worked)

Rather than redesigning further, the team asked a narrower question: what's
the minimum change to the existing, already-familiar UI that would make
these tools visible? They tweaked icon styling, added plain text labels, and
split what had been one combined "voice" feature into two separately labeled
use cases — dictation and live conversation. That shipped, and all of the
features saw increased usage; handwriting input specifically rose as much as
25%. People on social media began describing the tools as brand new, even
though they'd existed for years — evidence the fix was discoverability, not
the feature itself.

## Second project — conversation-mode UI

The old conversation screen had three controls: a language button on each
side and a large central "magic mic" meant to auto-detect who was speaking,
in what language, when they stopped, and when to translate, without any
manual input. When it worked, it felt magical; but accuracy varied by
language, and because the UI visually emphasized the mic, many users never
noticed the two manual language buttons that would have given them more
reliable control — so when the mic failed, they abandoned voice mode for
typing instead.

Applying the same "smallest viable change" lesson from the discoverability
fix, the team made the manual language buttons much more visually prominent
(shape and color), kept the magic mic but demoted it to one option among
several with a clearer descriptive label, added a headset icon that appears
automatically when Pixel Buds are connected, and — based on a designer's
(Liu Liu's) observation from user studies that the actual conversation's
opening moment was the most awkward part of the interaction — introduced an
"ice breaker" screen with a standard message the user could show the other
person to kick off the exchange naturally. Combined with backend speed
improvements, this produced a further, noticeable rise in speech-translation
usage overall.

## Closing

Yousefi closes by framing this as a first step, not an end point, saying the
work on discoverability and ease-of-use continues.
