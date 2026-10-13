// Floating-card mockup images (see scripts/generate-stage-mockups.mjs) —
// replaced the earlier DOM-rendered skeleton-text versions after feedback
// that small real text wasn't readable. Transparent background, composited
// directly onto whatever panel renders them.

function MockupImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
    </div>
  );
}

export function OrganiserPreview() {
  return (
    <MockupImage
      src="/generated/mockup-organiser.png"
      alt="Three stacked claim cards, each with a claim ID badge and a short pain-point label"
    />
  );
}

export function StrategistPreview() {
  return (
    <MockupImage
      src="/generated/mockup-strategist.png"
      alt="Two option cards side by side, one highlighted and checked as chosen"
    />
  );
}

export function ArchitectPreview() {
  return (
    <MockupImage
      src="/generated/mockup-architect.png"
      alt="A document card titled Case Study with body text lines and three stat chips"
    />
  );
}

export function ReviewerPreview() {
  return (
    <MockupImage
      src="/generated/mockup-reviewer.png"
      alt="Four small scorecard tiles, each with a score out of five and a lens label"
    />
  );
}
