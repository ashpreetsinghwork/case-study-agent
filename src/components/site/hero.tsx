import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import heroIllustration from "../../../public/generated/hero-illustration.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 120px)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6 sm:pt-20">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          For design, product &amp; tech portfolios
        </span>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Turn scattered project notes into one credible case study
        </h1>
        <p className="mx-auto mt-5 max-w-[42ch] text-lg text-muted-foreground">
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

      <div className="relative mx-auto mt-16 max-w-5xl px-4 pb-8 sm:px-6">
        <Image
          alt="Scattered research notes, screenshots and metrics flowing through the agent into one finished case study document"
          className="mx-auto h-auto w-full max-w-4xl"
          priority
          src={heroIllustration}
        />
      </div>
    </section>
  );
}
