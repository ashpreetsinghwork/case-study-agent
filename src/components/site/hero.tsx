"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { gsap } from "@/lib/gsap";
import GridMotion from "@/components/site/grid-motion";

// Fictional, generated portfolio-landing-page mockups (see
// scripts/generate-portfolio-tiles.mjs) — no real studio or company
// likeness, used purely as drifting background texture.
const PORTFOLIO_TILES = [
  "/generated/portfolio-tile-1.png",
  "/generated/portfolio-tile-2.png",
  "/generated/portfolio-tile-3.png",
  "/generated/portfolio-tile-4.png",
  "/generated/portfolio-tile-5.png",
  "/generated/portfolio-tile-6.png",
];

export function Hero() {
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      headRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
    );
  }, []);

  return (
    <section className="relative isolate flex min-h-[88dvh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-20">
        <GridMotion
          items={PORTFOLIO_TILES}
          rows={4}
          aspectRatio={1.5}
          gap={14}
          radius={18}
          angle={-10}
          speed={14}
          direction="alternate"
          parallax={0.3}
          spotlight={0.6}
          dim={0.3}
          grayscale
          fade={0.35}
          theme="light"
          tileColor="var(--card)"
          textColor="var(--muted-foreground)"
        />
      </div>
      {/* Soft fade at the very top/bottom so the grid meets the nav and the
          next section cleanly, without a hard edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-transparent to-background"
      />

      <div
        ref={headRef}
        className="relative mx-4 max-w-2xl rounded-3xl border border-white/50 bg-background/70 px-6 py-12 text-center shadow-[0_32px_80px_-24px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:px-14 sm:py-16"
      >
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          For design, product &amp; tech portfolios
        </span>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
          Structure your case study like the world&apos;s best designers do
        </h1>
        <p className="mx-auto mt-5 max-w-[42ch] text-lg text-pretty text-muted-foreground">
          Upload notes, decks and screenshots. The agent organizes your
          evidence, drafts the story, then reviews it like a hiring panel.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <Link href="/new">Start your case study</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
            <a href="#pipeline">See how it works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
