import { MagnifyingGlass, PaintBrush, ChartLineUp, IdentificationBadge } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/site/reveal";

const LENSES = [
  {
    icon: MagnifyingGlass,
    name: "Technical / SEO",
    focus: "Structure, clarity, scannability, heading hierarchy, alt text.",
    score: 4,
  },
  {
    icon: PaintBrush,
    name: "Design Head",
    focus: "Process depth, craft, decision rationale, visual storytelling.",
    score: 4,
  },
  {
    icon: ChartLineUp,
    name: "Product Manager",
    focus: "Problem framing, trade-offs, metrics, business impact.",
    score: 3,
  },
  {
    icon: IdentificationBadge,
    name: "HR / Recruiter",
    focus: "Role clarity, skimmability, red flags, fit for target roles.",
    score: 5,
  },
];

export function Review() {
  return (
    <section id="review" className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
      <Reveal>
        <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Reviewed like a hiring panel, not a single grader
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-muted-foreground">
          Four lenses score the same draft in parallel, alongside checks that
          run in code: readability, alt-text coverage, heading structure.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {LENSES.map((lens, i) => (
          <Reveal key={lens.name} delay={i * 0.08}>
            <div
              className={`flex h-full flex-col items-center rounded-2xl border border-border p-6 ${
                i % 2 === 0 ? "bg-card" : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <lens.icon size={22} className="text-primary" />
                <p className="font-mono text-2xl font-semibold text-foreground">{lens.score}/5</p>
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{lens.name}</h3>
              <p className="mt-1.5 max-w-[30ch] text-sm text-muted-foreground">{lens.focus}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Choose to apply fixes and the Reviewer re-checks the draft, capped at
        two rounds.
      </p>
    </section>
  );
}
