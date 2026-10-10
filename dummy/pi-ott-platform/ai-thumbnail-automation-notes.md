# AI thumbnail automation — workflow notes

Pi needed thumbnails for thousands of pieces of content, way more than
Course Listing ever did, so the manual process from that project wasn't
going to scale. Built a prompt-writer script on top of an image model to
automate it.

## Demo numbers

- Generated about 30 thumbnails in just 2 minutes during the demo.
- Workflow can handle up to 700-800 generations at a time, at roughly 95%
  accuracy.

## Adoption

After deploying the prompt-writer script, integrated it with internal
tools — specifically the Slack workspace — to make it quick and easy for
the content team to use without touching any design software.

## Impact

- ~1Cr saved annually.
- 1,000 thumbnails generated per day.
- 1% error rate.

Screenshots: `thumbnail-generation-workflow.png` (the workflow diagram),
`slack-integration-adoption.png` (how the team actually uses it day to
day).
