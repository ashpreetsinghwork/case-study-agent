"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Accordion } from "radix-ui";
import { Plus } from "@phosphor-icons/react";

const CONTENT_STYLES = `
.pipeline-accordion-content {
  overflow: hidden;
}
.pipeline-accordion-content[data-state="open"] {
  animation: pipeline-accordion-down 250ms ease-out;
}
.pipeline-accordion-content[data-state="closed"] {
  animation: pipeline-accordion-up 200ms ease-in;
}
@keyframes pipeline-accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}
@keyframes pipeline-accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .pipeline-accordion-content[data-state="open"],
  .pipeline-accordion-content[data-state="closed"] {
    animation: none;
  }
}
`;

export type Stage = {
  id: string;
  name: string;
  description: string;
  outputs: string[];
  image: StaticImageData;
  imageAlt: string;
};

export function PipelineAccordion({ stages }: { stages: Stage[] }) {
  const [active, setActive] = useState(stages[0].id);
  const activeStage = stages.find((s) => s.id === active) ?? stages[0];

  return (
    <div className="mt-16 grid gap-10 text-left lg:grid-cols-2 lg:items-start lg:gap-16">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static local stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: CONTENT_STYLES }} />

      <Accordion.Root
        type="single"
        value={active}
        onValueChange={(value) => value && setActive(value)}
        className="flex flex-col gap-3"
      >
        {stages.map((stage) => (
          <Accordion.Item
            key={stage.id}
            value={stage.id}
            className="rounded-2xl border border-border bg-card"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center gap-3 px-5 py-4 text-left outline-none">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform group-data-[state=open]:rotate-45 group-data-[state=open]:border-primary group-data-[state=open]:text-primary">
                  <Plus size={14} weight="bold" />
                </span>
                <span className="text-base font-medium text-foreground">{stage.name}</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pipeline-accordion-content">
              <div className="px-5 pb-5 pl-15">
                <p className="text-sm text-muted-foreground">{stage.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {stage.outputs.map((file) => (
                    <span
                      key={file}
                      className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>

      <div className="lg:sticky lg:top-24">
        <div className="aspect-[3/2] w-full overflow-hidden rounded-2xl border border-border bg-background shadow-xl shadow-black/10">
          <Image
            alt={activeStage.imageAlt}
            className="h-full w-full object-cover"
            src={activeStage.image}
          />
        </div>
      </div>
    </div>
  );
}
