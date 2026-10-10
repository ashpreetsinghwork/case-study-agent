import { Reveal } from "@/components/site/reveal";
import { PipelineAccordion, type Stage } from "@/components/site/pipeline-accordion";
import organiserImage from "../../../public/generated/stage-organiser.png";
import strategistImage from "../../../public/generated/stage-strategist.png";
import architectImage from "../../../public/generated/stage-architect.png";
import reviewerImage from "../../../public/generated/stage-reviewer.png";

const STAGES: Stage[] = [
  {
    id: "organiser",
    name: "Organiser",
    description:
      "Parses your notes, decks, screenshots and links, then decomposes them into sourced, ID-tracked claims.",
    outputs: ["sources.md", "claims.md", "assets.md", "timeline.md"],
    image: organiserImage,
    imageAlt: "Hands sorting scattered sticky notes, screenshots and photos on a desk before any document exists",
  },
  {
    id: "strategist",
    name: "Strategist",
    description:
      "Rates every claim for evidence strength, then proposes two distinct narrative directions for you to choose between.",
    outputs: ["evidence_matrix.md", "option_A.md", "option_B.md"],
    image: strategistImage,
    imageAlt: "Two printed case-study page layouts side by side on a desk, one circled and marked as chosen",
  },
  {
    id: "architect",
    name: "Architect",
    description:
      "Drafts the case study, a short summary, and an agent-readable version, citing evidence for every claim it uses.",
    outputs: ["case_study.md", "summary.md", "case_study.agent.json"],
    image: architectImage,
    imageAlt: "A case-study document card mid-assembly on a desk, with a hand placing a screenshot into it",
  },
  {
    id: "reviewer",
    name: "Reviewer",
    description: "Scores the draft through four hiring-panel lenses and flags fixes before you publish.",
    outputs: ["technical_seo.md", "design_head.md", "product_manager.md", "hr.md", "scorecard.json"],
    image: reviewerImage,
    imageAlt: "A finished case-study document surrounded by four colored feedback sticky notes, each checked off",
  },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
      <Reveal>
        <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          One agent, four disciplined stages
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-muted-foreground">
          Every generation runs the same fixed pipeline over a shared project
          state. Open a stage to see what it actually produces.
        </p>
      </Reveal>

      <PipelineAccordion stages={STAGES} />
    </section>
  );
}
