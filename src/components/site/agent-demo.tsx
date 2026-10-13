"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "@/components/site/reveal";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Code-rendered chat mockup, not a screenshot — sequenced with GSAP so the
// request, a typing beat, then the reply play out once the section enters
// view, instead of sitting there as a static image of a conversation.
export function AgentDemo() {
  const userRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set([userRef.current, replyRef.current], { opacity: 1, scale: 1 });
      gsap.set(typingRef.current, { opacity: 0 });
      return;
    }

    const windowEl = windowRef.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: windowEl, start: "top 75%", once: true },
      });
      tl.fromTo(
        userRef.current,
        { opacity: 0, scale: 0.9, transformOrigin: "right bottom" },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" }
      )
        .fromTo(typingRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 }, "+=0.3")
        .to(typingRef.current, { opacity: 0, duration: 0.25, delay: 0.7 })
        .fromTo(
          replyRef.current,
          { opacity: 0, scale: 0.9, transformOrigin: "left bottom" },
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" },
          "-=0.05"
        );
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === windowEl) t.kill();
      });
    };
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <h2 className="mx-auto text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ask for changes, see them applied
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-pretty text-muted-foreground">
          Once your draft is ready, ask for a change on any section. The
          agent applies it and shows which claims it used.
        </p>
      </Reveal>

      <div
        ref={windowRef}
        className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_32px_70px_-32px_color-mix(in_oklch,var(--foreground),transparent_80%)]"
      >
        <div className="flex items-center gap-1.5 border-b border-border bg-background/60 px-4 py-3">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-primary/60" />
          <span className="size-2.5 rounded-full bg-[color-mix(in_oklch,var(--primary),var(--foreground)_30%)]" />
        </div>

        <div className="flex min-h-[220px] flex-col justify-end gap-3 p-6">
          <div ref={userRef} className="flex justify-end opacity-0">
            <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-sm text-background">
              Can we make this line shorter and clearer?
            </p>
          </div>

          <div ref={typingRef} className="flex justify-start opacity-0">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>

          <div ref={replyRef} className="flex justify-start opacity-0">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
              <p>Sure, I&apos;ve tightened it and updated the phrasing.</p>
              <div className="mt-2 flex gap-1.5">
                <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                  C-004
                </span>
                <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                  C-007
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
