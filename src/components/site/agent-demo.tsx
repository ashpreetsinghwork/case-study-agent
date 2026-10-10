import Image from "next/image";
import { Reveal } from "@/components/site/reveal";
import demoImage from "../../../public/generated/agent-demo.png";

export function AgentDemo() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <Reveal>
        <h2 className="mx-auto text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ask for changes, see them applied
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-muted-foreground">
          Once your draft is ready, ask for a change on any section. The
          agent applies it and shows which claims it used.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <div className="mx-auto aspect-[12/5] w-full max-w-2xl overflow-hidden rounded-2xl border border-border shadow-xl shadow-black/10">
          <Image
            alt="A chat window showing a user asking to shorten a line, and the agent's reply citing two claims"
            className="h-full w-full object-cover object-top"
            src={demoImage}
          />
        </div>
      </Reveal>
    </section>
  );
}
