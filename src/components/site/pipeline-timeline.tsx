"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  OrganiserPreview,
  StrategistPreview,
  ArchitectPreview,
  ReviewerPreview,
} from "@/components/site/stage-previews";

export type TimelineStage = {
  id: string;
  name: string;
  heading: string;
  description: string;
};

// Looked up by id inside this client component — a component reference
// can't cross the server/client boundary from pipeline.tsx (a server
// component), only serializable data can.
const PREVIEWS: Record<string, React.ComponentType> = {
  organiser: OrganiserPreview,
  strategist: StrategistPreview,
  architect: ArchitectPreview,
  reviewer: ReviewerPreview,
};

export function PipelineTimeline({ stages }: { stages: TimelineStage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const lineFill = lineFillRef.current;
    const rows = rowRefs.current.filter((r): r is HTMLDivElement => !!r);
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      if (lineFill) gsap.set(lineFill, { scaleY: 1 });
      rows.forEach((row) => {
        gsap.set(row.querySelectorAll("[data-timeline-text], [data-timeline-media]"), {
          opacity: 1,
          x: 0,
        });
        const dot = row.querySelector("[data-timeline-dot]");
        if (dot) gsap.set(dot, { scale: 1 });
      });
      return;
    }

    const ctx = gsap.context(() => {
      // The center line fills top-to-bottom tracking scroll progress
      // through the whole timeline, not any single step.
      if (lineFill) {
        gsap.fromTo(
          lineFill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top 60%",
              end: "bottom 55%",
              scrub: 0.4,
            },
          }
        );
      }

      // Each step reveals independently once it scrolls into view — text
      // sliding in from the left, its media sliding in from the right.
      rows.forEach((row) => {
        const textEl = row.querySelector("[data-timeline-text]");
        const mediaEl = row.querySelector("[data-timeline-media]");
        const dotEl = row.querySelector("[data-timeline-dot]");
        const trigger = { trigger: row, start: "top 78%", once: true };

        if (textEl) {
          gsap.fromTo(
            textEl,
            { opacity: 0, x: -48 },
            { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", scrollTrigger: trigger }
          );
        }
        if (mediaEl) {
          gsap.fromTo(
            mediaEl,
            { opacity: 0, x: 48 },
            { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", scrollTrigger: trigger }
          );
        }
        if (dotEl) {
          gsap.fromTo(
            dotEl,
            { scale: 0 },
            { scale: 1, duration: 0.5, ease: "back.out(2.5)", scrollTrigger: trigger }
          );
        }
      });
    }, container);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === container || rows.includes(t.trigger as HTMLDivElement)) t.kill();
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="relative mt-20">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border sm:block"
      />
      <div
        ref={lineFillRef}
        aria-hidden
        className="absolute left-1/2 top-0 hidden h-full w-px origin-top -translate-x-1/2 bg-primary sm:block"
      />

      <div className="flex flex-col gap-20 sm:gap-28">
        {stages.map((stage, i) => {
          const Preview = PREVIEWS[stage.id];
          return (
            <div
              key={stage.id}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="relative grid items-center gap-8 sm:grid-cols-2 sm:gap-16"
            >
              <span
                data-timeline-dot
                aria-hidden
                className="absolute left-1/2 top-1/2 z-10 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-background sm:block"
              />

              <div data-timeline-text className="text-left sm:pr-10">
                <span className="text-xs font-semibold tracking-wider text-primary">
                  {stage.name.toUpperCase()}
                </span>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">{stage.heading}</h3>
                <p className="mt-2 max-w-[38ch] text-pretty text-muted-foreground">
                  {stage.description}
                </p>
              </div>

              <div data-timeline-media className="sm:pl-10">
                <div className="aspect-[3/2] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[0_32px_70px_-32px_color-mix(in_oklch,var(--foreground),transparent_78%)]">
                  <Preview />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
