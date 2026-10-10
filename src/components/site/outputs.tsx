import Image from "next/image";
import { Reveal } from "@/components/site/reveal";
import draftImage from "../../../public/generated/output-draft.png";
import summaryImage from "../../../public/generated/output-summary.png";
import agentJsonImage from "../../../public/generated/output-agent-json.png";

const ITEMS = [
  {
    name: "Case study draft",
    description:
      "A publish-ready Markdown document, structured section by section from your chosen narrative.",
    image: draftImage,
    imageAlt: "A document preview with a heading and paragraph placeholder lines",
  },
  {
    name: "Screening summary",
    description: "A fixed-length TL;DR covering your role, the problem, approach and outcome.",
    image: summaryImage,
    imageAlt: "A short summary card with a word-count badge and a few placeholder lines",
  },
  {
    name: "Agent-readable JSON",
    description:
      "Sections, claims and asset alt text with IDs intact, so other agents can consume it without reparsing prose.",
    image: agentJsonImage,
    imageAlt: "A syntax-highlighted JSON code block",
  },
];

export function Outputs() {
  return (
    <section id="outputs" className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
      <Reveal>
        <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Three things you walk away with
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-muted-foreground">
          Every run produces the same set of deliverables, rendered from
          validated JSON, not left to the model to lay out freely.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <div className="grid divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {ITEMS.map((item) => (
            <div key={item.name} className="flex flex-col text-left">
              <div className="aspect-[3/2] w-full overflow-hidden bg-background">
                <Image alt={item.imageAlt} className="h-full w-full object-cover" src={item.image} />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
