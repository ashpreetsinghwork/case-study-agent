"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowsClockwise, CaretDown, DownloadSimple, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { MarkdownBody } from "@/components/projects/markdown-body";
import { ChartBlock } from "@/components/projects/chart-block";
import { StickyNote } from "@/components/projects/sticky-note";
import { renderCaseStudyMd } from "@/lib/markdown";
import type { CalloutEntry, CaseStudySection, ChartEntry } from "@/schemas/draft";
import type { Rubric, Scorecard } from "@/schemas/review";

export type CaseStudyMetadata = {
  role: string;
  team: string;
  duration: string;
  audience: string;
};

const LENS_LABEL: Record<Rubric["lens"], string> = {
  technical_seo: "Technical / SEO",
  design_head: "Design Head",
  product_manager: "Product Manager",
  hr: "HR / Recruiter",
};

const SEVERITY_STYLE: Record<"high" | "medium" | "low", string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "case-study";
}

function downloadFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function CaseStudyReader({
  projectId,
  title,
  summary,
  metadata,
  initialSections,
  callouts,
  charts,
  scorecard,
  onRework,
}: {
  projectId: string;
  title: string;
  summary: string | null;
  metadata: CaseStudyMetadata;
  initialSections: CaseStudySection[];
  callouts: CalloutEntry[];
  charts: ChartEntry[];
  scorecard: Scorecard;
  onRework: () => void;
}) {
  const [sections, setSections] = useState(initialSections);
  const [improvingId, setImprovingId] = useState<string | null>(null);

  async function handleImprove(sectionId: string) {
    setImprovingId(sectionId);
    try {
      const res = await fetch(`/api/projects/${projectId}/sections/${sectionId}/improve`, {
        method: "POST",
      });
      if (res.ok) {
        const { section } = (await res.json()) as { section: CaseStudySection };
        setSections((prev) => prev.map((s) => (s.id === sectionId ? section : s)));
      }
    } finally {
      setImprovingId(null);
    }
  }

  // Powers the double-click-to-edit text boxes — a direct save, no LLM
  // involved. Throws on failure so the text box stays open with the
  // student's typed text rather than silently discarding it.
  async function handleManualSave(sectionId: string, updates: { heading?: string; body?: string }) {
    const res = await fetch(`/api/projects/${projectId}/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Save failed");
    const { section } = (await res.json()) as { section: CaseStudySection };
    setSections((prev) => prev.map((s) => (s.id === sectionId ? section : s)));
  }

  function handleDownloadMd() {
    const md = `# ${title}\n\n${summary ? `${summary}\n\n` : ""}${renderCaseStudyMd(sections, callouts, charts)}\n`;
    downloadFile(`${slugify(title)}.md`, md, "text/markdown");
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 print:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Back to homepage"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </Link>
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadMd}>
            <DownloadSimple size={14} />
            .md
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <DownloadSimple size={14} />
            .pdf
          </Button>
        </div>
      </div>

      <article className="mx-auto max-w-2xl py-10">
        <ScorecardHeader projectId={projectId} scorecard={scorecard} onRework={onRework} />

        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {summary && <p className="mt-3 text-lg text-muted-foreground">{summary}</p>}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>
            <strong className="font-medium text-foreground">Role</strong> · {metadata.role}
          </span>
          <span>
            <strong className="font-medium text-foreground">Team</strong> · {metadata.team}
          </span>
          <span>
            <strong className="font-medium text-foreground">Duration</strong> · {metadata.duration}
          </span>
          <span>
            <strong className="font-medium text-foreground">For</strong> · {metadata.audience}
          </span>
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              improving={improvingId === section.id}
              onImprove={() => handleImprove(section.id)}
              onManualSave={(updates) => handleManualSave(section.id, updates)}
              callouts={callouts.filter((c) => c.section === section.id)}
              charts={charts.filter((c) => c.section === section.id)}
            />
          ))}
        </div>
      </article>
    </div>
  );
}

// Ratings strip + rework/recheck-feedback controls, always visible at the
// top of the finished case study — fixes already applied automatically by
// the pipeline before the student ever reaches this screen, so "recheck
// feedback" is a read-only reveal of what was found, not a new action.
function ScorecardHeader({
  projectId,
  scorecard,
  onRework,
}: {
  projectId: string;
  scorecard: Scorecard;
  onRework: () => void;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [reworking, setReworking] = useState(false);

  const issues = scorecard.lensResults.flatMap((r) => r.issues.map((i) => ({ ...i, lens: r.lens })));

  async function handleRework() {
    setReworking(true);
    try {
      await fetch(`/api/projects/${projectId}/rework`, { method: "POST" });
    } finally {
      onRework();
    }
  }

  return (
    <div className="mb-8 print:hidden">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {scorecard.lensResults.map((r) => (
          <div key={r.lens} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="font-mono text-xl font-semibold text-foreground">{r.overall}/5</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{LENS_LABEL[r.lens]}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleRework} disabled={reworking}>
          <ArrowsClockwise size={14} className={reworking ? "animate-spin" : ""} />
          {reworking ? "Reworking..." : "Rework entire case study"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowFeedback((v) => !v)}>
          <CaretDown size={14} className={showFeedback ? "rotate-180 transition-transform" : "transition-transform"} />
          Recheck feedback
        </Button>
      </div>

      {showFeedback && (
        <div className="mt-3 rounded-lg border border-border bg-card p-4">
          {issues.length > 0 ? (
            <>
              <p className="text-sm font-medium text-foreground">
                {issues.length} issue{issues.length === 1 ? "" : "s"} found and addressed automatically
              </p>
              <ul className="mt-2 space-y-2">
                {issues.map((issue, i) => (
                  <li key={i} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_STYLE[issue.severity]}`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">{LENS_LABEL[issue.lens]}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-foreground">{issue.issue}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Fix: {issue.suggestedFix}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No issues found — the draft is in good shape.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SectionBlock({
  section,
  improving,
  onImprove,
  onManualSave,
  callouts,
  charts,
}: {
  section: CaseStudySection;
  improving: boolean;
  onImprove: () => void;
  onManualSave: (updates: { heading?: string; body?: string }) => Promise<void>;
  callouts: CalloutEntry[];
  charts: ChartEntry[];
}) {
  return (
    <section className="group relative -mx-4 rounded-xl p-4 ring-1 ring-transparent transition hover:ring-2 hover:ring-primary/50 print:ring-0">
      <button
        type="button"
        onClick={onImprove}
        disabled={improving}
        className="absolute right-3 top-3 hidden items-center gap-1.5 rounded-full border border-primary/40 bg-background px-3 py-1 text-xs font-medium text-primary shadow-sm group-hover:flex disabled:opacity-80 print:hidden"
      >
        <Sparkle size={13} weight="fill" className={improving ? "animate-spin" : ""} />
        {improving ? "Improving..." : "Improve"}
      </button>

      {improving ? (
        <>
          <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
          <SectionSkeleton />
        </>
      ) : (
        <>
          <EditableHeading
            value={section.heading}
            onSave={(heading) => onManualSave({ heading })}
          />
          <EditableBody value={section.body} onSave={(body) => onManualSave({ body })} />
        </>
      )}

      {!improving && charts.length > 0 && (
        <div className="mt-5 space-y-3 print:hidden">
          {charts.map((chart) => (
            <ChartBlock key={chart.title} title={chart.title} display={chart.display} dataPoints={chart.dataPoints} />
          ))}
        </div>
      )}

      {!improving && callouts.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 print:hidden">
          {callouts.map((callout, i) => (
            <StickyNote key={i} text={callout.text} />
          ))}
        </div>
      )}
    </section>
  );
}

// Double-click a heading or body to turn it into a plain text box, word-doc
// style. Saves on blur; Escape reverts without saving. Stays in edit mode
// (rather than reverting) if the save call throws, so a failed PATCH never
// silently discards what the student typed.
function EditableHeading({ value, onSave }: { value: string; onSave: (value: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <h2
        className="cursor-text text-lg font-semibold text-foreground"
        onDoubleClick={() => {
          setDraft(value);
          setEditing(true);
        }}
      >
        {value}
      </h2>
    );
  }

  async function commit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch {
      // stay open — the student's edit is still in `draft`, ready to retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <input
      autoFocus
      value={draft}
      disabled={saving}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      className="w-full rounded-md border border-primary/50 bg-background px-2 py-1 text-lg font-semibold text-foreground outline-none disabled:opacity-70 print:hidden"
    />
  );
}

function EditableBody({ value, onSave }: { value: string; onSave: (value: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <div
        className="cursor-text"
        onDoubleClick={() => {
          setDraft(value);
          setEditing(true);
        }}
      >
        <MarkdownBody text={value} className="mt-3" />
      </div>
    );
  }

  async function commit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch {
      // stay open — the student's edit is still in `draft`, ready to retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <textarea
      autoFocus
      value={draft}
      disabled={saving}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      rows={Math.max(6, draft.split("\n").length + 1)}
      className="mt-3 w-full resize-y rounded-md border border-primary/50 bg-background p-3 font-mono text-[0.9rem] leading-relaxed text-foreground outline-none disabled:opacity-70 print:hidden"
    />
  );
}

function SectionSkeleton() {
  return (
    <div className="mt-3 space-y-2.5">
      <div className="skeleton-line h-4 w-full rounded" />
      <div className="skeleton-line h-4 w-11/12 rounded" />
      <div className="skeleton-line h-4 w-full rounded" />
      <div className="skeleton-line h-4 w-2/3 rounded" />
    </div>
  );
}
