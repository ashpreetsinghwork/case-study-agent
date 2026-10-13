import { Gauge, PenNib, Target, IdentificationBadge } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup } from "@/components/site/reveal";

const LENSES = [
  {
    icon: Gauge,
    name: "Technical / SEO",
    focus: "Structure, clarity, scannability, heading hierarchy, alt text.",
  },
  {
    icon: PenNib,
    name: "Design Head",
    focus: "Process depth, craft, decision rationale, visual storytelling.",
  },
  {
    icon: Target,
    name: "Product Manager",
    focus: "Problem framing, trade-offs, metrics, business impact.",
  },
  {
    icon: IdentificationBadge,
    name: "HR / Recruiter",
    focus: "Role clarity, skimmability, red flags, fit for target roles.",
  },
];

export function Review() {
  return (
    <section id="review" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Reviewed like a hiring panel, not a single grader
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-pretty text-muted-foreground">
          Four lenses score the same draft in parallel, alongside checks that
          run in code: readability, alt-text coverage, heading structure.
        </p>
      </Reveal>

      <RevealGroup
        className="mt-14 grid divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:border-x lg:grid-cols-4"
        stagger={0.08}
      >
        {LENSES.map((lens, i) => (
          <div
            key={lens.name}
            className="group relative px-6 py-9 text-left transition-colors duration-300 hover:bg-gradient-to-b hover:from-muted/70 hover:to-transparent"
          >
            <span
              aria-hidden
              className="absolute left-0 top-9 hidden h-6 w-0.5 -translate-x-1/2 rounded-full bg-border transition-all duration-300 group-hover:h-8 group-hover:bg-primary sm:block"
            />
            <lens.icon size={30} className="text-foreground" />
            <h3 className="mt-4 text-base font-semibold text-foreground">{lens.name}</h3>
            <p className="mt-1.5 text-pretty text-sm text-muted-foreground">{lens.focus}</p>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
