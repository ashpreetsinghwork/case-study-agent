import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="rounded-2xl border border-border bg-card px-8 py-12 text-center sm:py-16">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Bring your messiest project folder
          </h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-muted-foreground">
            The pipeline handles the organizing. You keep the final say at
            every gate.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-11 px-6 text-base">
              <Link href="/new">Start your case study</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
