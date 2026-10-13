import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import LightRays from "@/components/site/light-rays";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-foreground py-20 text-center sm:py-28">
          <div className="absolute inset-0 -z-10 brightness-150 saturate-150">
            <LightRays
              raysOrigin="top-center"
              raysColor="#c2c7ff"
              raysSpeed={1.3}
              lightSpread={2.8}
              rayLength={5}
              followMouse
              mouseInfluence={0.1}
              noiseAmount={0.04}
              distortion={0.03}
              saturation={1.3}
              fadeDistance={4.2}
            />
          </div>

          <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-background sm:text-4xl">
              Bring your messiest project folder
            </h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-pretty text-background/70">
              The pipeline handles the organizing. You keep the final say at
              every gate.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-11 px-6 text-base">
                <Link href="/new">Start your case study</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
