import { Reveal, RevealGroup } from "@/components/site/reveal";

// Floating-card mockup images (see scripts/generate-stage-mockups.mjs) —
// real text at small DOM sizes tested unreadable, these read as an actual
// illustrated preview instead. JSON below stays real code text on
// purpose — exact syntax is exactly where AI image text rendering breaks.
function DraftPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/generated/mockup-draft.png"
        alt="A document card titled Outcome with a highlighted 12% to 61% stat and body text lines"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

function SummaryPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/generated/mockup-summary.png"
        alt="A compact card titled Summary with a 98 words badge and body text lines"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

function JsonPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/generated/mockup-json.png"
        alt="A document card titled Structured with a Valid badge and body text lines"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

const ITEMS = [
  {
    name: "A full case study draft to kickstart your portfolio write-up",
    preview: DraftPreview,
    offset: "",
  },
  {
    name: "A short summary built for quick recruiter skimming",
    preview: SummaryPreview,
    offset: "sm:-translate-y-6",
  },
  {
    name: "Structured JSON you can feed into other tools",
    preview: JsonPreview,
    offset: "",
  },
];

export function Outputs() {
  return (
    <section id="outputs" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Three things you walk away with
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-pretty text-muted-foreground">
          Every run produces the same set of deliverables, rendered from
          validated JSON, not left to the model to lay out freely.
        </p>
      </Reveal>

      <RevealGroup className="mt-16 grid gap-6 sm:grid-cols-3" stagger={0.1}>
        {ITEMS.map((item) => (
          <div
            key={item.name}
            className={`flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_24px_60px_-28px_color-mix(in_oklch,var(--foreground),transparent_82%)] ${item.offset}`}
          >
            <div className="relative h-96 bg-card">
              <item.preview />
              {/* Fade the media out into the card's own background,
                  instead of a hard seam between media and caption. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-card backdrop-blur-[2px]"
              />
            </div>
            <h3 className="px-6 pb-6 text-pretty text-lg font-medium text-foreground">{item.name}</h3>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
