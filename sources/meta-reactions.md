---
title: "Reactions: Not Everything in Life Is Likable"
company: Meta (Facebook Design)
author: Geoff Teehan, Product Design Director
source_url: https://medium.com/facebook-design/reactions-not-everything-in-life-is-likable-5c403de72a3f
published: 2016-02-24
retrieved: 2026-10-09
note: Detailed original-wording paraphrase, not a verbatim copy — see note at bottom of CASE_STUDY_REFERENCE.md
---

## Opening

Teehan opens personally — describing the range of things people share on
Facebook, from celebrations to grief — then recounts that Like launched in
2009 and worked well because it was simple and low-friction, before landing
on the line the piece is titled after: not everything in life is likable.
About a year before publishing, Mark Zuckerberg assembled a team to make Like
more expressive, and Teehan lists the real constraints going in: it had to
work across old and new devices/platforms, and any change to Like/Comment/
Share — surfaces already refined over years and used by a billion people —
risked disrupting understandability at massive scale.

## Splitting the problem

The team split the work into two parallel tracks: (1) deciding what the
actual reaction options would be, and (2) deciding how people would input and
consume them. For each track they set guiding principles meant to narrow the
solution space rather than dictate the answer outright. The team itself
included researchers, content strategists, engineers, and Teehan's core
design group (Andy Chung, Brandon Walkin, Brian Frick).

## Choosing the reactions

Two guiding principles: reactions must be universally understood across
cultures, and must be expressive/widely usable enough to reflect how people
actually react in life (plain binary like/dislike wasn't enough, but
emoji-scale variety would be unusable in a feed context and harder to
translate globally). Research drew on: aggregate top sticker/emoji usage,
common sticker-search terms, and anonymized short comment text by country,
plus international surveys and work with an internationalization team. The
shortlist got narrowed to the familiar five plus two that didn't make launch:
"Confused" (used too rarely to justify the added cognitive load) and "Yay"
(hard to translate, and overlapped too much with Haha/Like). Illustration
work went through several passes because early versions didn't read clearly
at small size and because adjacent reactions (e.g. Wow vs. Yay vs. Haha)
kept visually blurring into each other with small changes to a smile curve
or eye shape. The team tested labeled vs. unlabeled versions and ran studies
in multiple countries to confirm cross-cultural legibility. Animation came
later, built by an animator and then hand-coded by designers via pseudocode
for engineers to replicate precisely; notably, the team originally planned
to animate only the one reaction under the user's finger at a time, until a
review with Zuckerberg revealed that scrubbing quickly made all of them
animate at once — and the team, and Zuckerberg, preferred that, so all
reactions ended up animating simultaneously once the dock opens.

## Designing the system

Two more principles governed the mechanics: reactions should feel like a
natural extension of Like rather than a disruptive fourth option, and must
not make existing (liking) behavior any harder than it already was. For
input, the team initially prototyped a scrubbable dock sized for up to
fifteen reactions (deliberately oversized, since trimming down is easier
than expanding later) — using placeholder, fictional reactions since the
final set wasn't decided yet. That prototype taught them several concrete
problems: it could get clipped at the top of the screen, people's fingers
slid over the text labels while scrubbing, reading labels during the gesture
was slow and complicated translation, the linear illustration style didn't
read well at small size, lifting a finger to tap sometimes dismissed the
whole interface, and too many options risked redundancy. An even earlier
prototype showed only one illustration at a time, changing based on finger
position — which created a wish to preview each option up front rather than
page through them, so the team abandoned it in favor of the final "dock"
that shows every reaction at once, repositions on-screen to avoid clipping,
moves labels clear of the finger, and supports both scrubbing and direct tap.

For the consumption side, the existing "Bling String" (the "17 Likes" text
above the buttons) needed to communicate which reactions were used, not just
a count. The first redesign listed every reaction type individually with its
own count — fine for lightly-reacted posts but visually overwhelming on
high-engagement or public content. The final version instead surfaces the
top three reactions on a post plus a total count, and separately still shows
when a user's close friends reacted, tapping the string reveals the complete
breakdown.

## Closing

Teehan calls Reactions "the final product" only in quotes, immediately
undercutting it with the same "nothing is ever done, final, or finished"
sentiment as the News Feed piece, and closes with a long list of credited
teammates and cross-functional teams (internationalization, reliability,
feed platform, accessibility).
