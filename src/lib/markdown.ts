import type { Asset, Claim, OpenQuestion, Source, TimelineEntry } from "@/schemas/context";
import type { EvidenceMatrixEntry, StrategyOption } from "@/schemas/strategy";
import type { CalloutEntry, CaseStudySection, ChartEntry } from "@/schemas/draft";
import type { Rubric } from "@/schemas/review";

// Renders validated JSON into the fixed Markdown templates from the brief
// (§2.3: structured output first, code renders the .md — the LLM never
// decides file layout).

export function renderSourcesMd(sources: Source[]): string {
  if (sources.length === 0) return "# Sources\n\nNone yet.\n";
  const rows = sources
    .map((s) => `## ${s.id} — ${s.title}\n\n- Type: ${s.type}\n${s.extractedText ? `\n${s.extractedText}\n` : ""}${s.imageDescription ? `\n_${s.imageDescription}_\n` : ""}`)
    .join("\n");
  return `# Sources\n\n${rows}\n`;
}

export function renderClaimsMd(claims: Claim[]): string {
  if (claims.length === 0) return "# Claims\n\nNone yet.\n";
  const rows = claims
    .map(
      (c) =>
        `- **${c.id}**${c.selfReported ? " (self-reported)" : ""}: ${c.text} _(${c.sourceIds.join(", ") || "no source"})_`
    )
    .join("\n");
  return `# Claims\n\n${rows}\n`;
}

export function renderAssetsMd(assets: Asset[]): string {
  if (assets.length === 0) return "# Assets\n\nNone yet.\n";
  const rows = assets
    .map((a) => `- **${a.id}** (from ${a.sourceId}, ${a.usable ? "usable" : "not usable"}): ${a.visionDescription}`)
    .join("\n");
  return `# Assets\n\n${rows}\n`;
}

export function renderTimelineMd(entries: TimelineEntry[]): string {
  if (entries.length === 0) return "# Timeline\n\nNone yet.\n";
  const rows = entries.map((e) => `- **${e.date}** — ${e.label}`).join("\n");
  return `# Timeline\n\n${rows}\n`;
}

export function renderOpenQuestionsMd(questions: OpenQuestion[]): string {
  if (questions.length === 0) return "# Open Questions\n\nNone.\n";
  const rows = questions.map((q) => `- ${q.question}`).join("\n");
  return `# Open Questions\n\n${rows}\n`;
}

export function renderEvidenceMatrixMd(entries: EvidenceMatrixEntry[]): string {
  const rows = entries
    .map((e) => `| ${e.claimId} | ${e.rating} | ${e.evidenceNeeded || "—"} |`)
    .join("\n");
  return `# Evidence Matrix\n\n| Claim | Rating | Evidence needed |\n|---|---|---|\n${rows}\n`;
}

export function renderCaseStudyMd(
  sections: CaseStudySection[],
  callouts: CalloutEntry[] = [],
  charts: ChartEntry[] = []
): string {
  return sections
    .map((s) => {
      const parts = [`## ${s.heading}`, s.body];

      for (const chart of charts.filter((c) => c.section === s.id)) {
        const rows = chart.dataPoints.map((p) => `| ${p.label} | ${p.value}${p.unit ?? ""} |`).join("\n");
        parts.push(`**${chart.title}**\n\n| Label | Value |\n|---|---|\n${rows}`);
      }

      for (const callout of callouts.filter((c) => c.section === s.id)) {
        parts.push(`> 📌 ${callout.text}`);
      }

      parts.push(`_Claims: ${s.citedClaimIds.join(", ") || "none"}_`);
      return parts.join("\n\n");
    })
    .join("\n\n");
}

export function renderRubricMd(rubric: Rubric): string {
  const scores = rubric.scores
    .map((s) => `| ${s.criterion} | ${s.score}/5 | ${s.rationale} |`)
    .join("\n");
  const issues = rubric.issues.length
    ? rubric.issues
        .map(
          (i) =>
            `- **${i.severity}** (${i.sectionId}): ${i.issue}\n  Fix: ${i.suggestedFix}`
        )
        .join("\n")
    : "None.";

  return `# ${rubric.lens} review

**Overall:** ${rubric.overall}/5

## Scores

| Criterion | Score | Rationale |
|---|---|---|
${scores}

## Issues

${issues}
`;
}

export function renderStrategyOptionMd(label: "A" | "B", option: StrategyOption): string {
  return `# Option ${label}: ${option.angle}

**Thesis:** ${option.thesis}

**Tone of voice:** ${option.toneOfVoice}

## Narrative arc

${option.narrativeArc.map((s) => `- **${s.section}**: ${s.summary}`).join("\n")}

## Hero claims

${option.heroClaimIds.map((id) => `- ${id}`).join("\n") || "None"}

## Claims to soften or drop

${option.claimsToSoftenOrDrop.map((id) => `- ${id}`).join("\n") || "None"}

## Evidence to add

${option.evidenceToAdd.map((e) => `- ${e}`).join("\n") || "None"}

## Risks

${option.risks.map((r) => `- ${r}`).join("\n") || "None"}
`;
}
