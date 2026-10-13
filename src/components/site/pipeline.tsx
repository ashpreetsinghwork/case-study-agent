import { Reveal } from "@/components/site/reveal";
import { PipelineTimeline, type TimelineStage } from "@/components/site/pipeline-timeline";

const STAGES: TimelineStage[] = [
  {
    id: "organiser",
    name: "Organiser",
    heading: "Turn raw material into structured claims",
    description:
      "Parses your notes, decks, screenshots and links, then decomposes them into sourced, ID-tracked claims.",
  },
  {
    id: "strategist",
    name: "Strategist",
    heading: "Pick the story your evidence actually supports",
    description:
      "Rates every claim for evidence strength, then proposes two distinct narrative directions for you to choose between.",
  },
  {
    id: "architect",
    name: "Architect",
    heading: "Draft every deliverable in one pass",
    description:
      "Drafts the case study, a short summary, and an agent-readable version, citing evidence for every claim it uses.",
  },
  {
    id: "reviewer",
    name: "Reviewer",
    heading: "Catch issues before you publish",
    description: "Scores the draft through four hiring-panel lenses and flags fixes before you publish.",
  },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
      <Reveal>
        <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-pretty text-muted-foreground">
          Every generation runs the same fixed pipeline, in order, over a
          shared project state.
        </p>
      </Reveal>

      <PipelineTimeline stages={STAGES} />
    </section>
  );
}
