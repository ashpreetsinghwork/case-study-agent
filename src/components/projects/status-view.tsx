"use client";

import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  CaretDown,
  CheckCircle,
  Circle,
  CircleNotch,
  FileText,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CaseStudyReader } from "@/components/projects/case-study-reader";
import type { Scorecard } from "@/schemas/review";
import type { CalloutEntry, ChartEntry } from "@/schemas/draft";

type StageStatus = "pending" | "running" | "done" | "failed";

type Claim = { id: string; text: string; selfReported: boolean };

type EvidenceMatrixEntry = { claimId: string; rating: "strong" | "weak" | "unsupported"; evidenceNeeded: string };

type StrategyOption = {
  angle: string;
  thesis: string;
  toneOfVoice: string;
  narrativeArc: { section: string; summary: string }[];
  heroClaimIds: string[];
  claimsToSoftenOrDrop: string[];
  evidenceToAdd: string[];
  risks: string[];
};

type Strategy = {
  evidenceMatrix: EvidenceMatrixEntry[];
  optionA: StrategyOption;
  optionB: StrategyOption;
};

type CaseStudySection = { id: string; heading: string; body: string; citedClaimIds: string[] };

type Stages = {
  organiser: StageStatus;
  strategist: StageStatus;
  architect: StageStatus;
  reviewer: StageStatus;
};

type StatusResponse = {
  projectId: string;
  projectTitle: string;
  studentRole: string;
  teamSizeAndComposition: string;
  duration: string;
  targetAudience: string;
  stages: Stages;
  uploadedFiles: string[];
  claims: Claim[];
  strategy: Strategy | null;
  selection: { chosenOption: "A" | "B" } | null;
  draftSummary: string | null;
  caseStudySections: CaseStudySection[];
  caseStudyCallouts: CalloutEntry[];
  caseStudyCharts: ChartEntry[];
  scorecard: Scorecard | null;
  fixRoundsUsed: number;
  reviewComplete: boolean;
};

const STAGES: { key: keyof Stages; label: string }[] = [
  { key: "organiser", label: "Organiser" },
  { key: "strategist", label: "Strategist" },
  { key: "architect", label: "Architect" },
  { key: "reviewer", label: "Reviewer" },
];

const POLL_INTERVAL_MS = 3000;

async function fetchStatus(projectId: string): Promise<StatusResponse | null> {
  const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

// The reviewer stage's raw status flips done/running repeatedly during the
// auto-fix loop (each re-review pass ends "done" even mid-loop) — gate the
// row's displayed status on `reviewComplete` instead, the one signal that's
// only true once the whole loop has actually settled.
function reviewerDisplayStatus(data: StatusResponse): StageStatus {
  if (data.stages.reviewer === "failed") return "failed";
  if (data.stages.architect !== "done") return "pending";
  return data.reviewComplete ? "done" : "running";
}

export function StatusView({ projectId }: { projectId: string }) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selecting, setSelecting] = useState<"A" | "B" | null>(null);
  const [viewMode, setViewMode] = useState<"progress" | "reading">("progress");
  // null = no manual override yet — defaults open while awaiting the A/B
  // pick, collapsed otherwise; a click sets an explicit true/false that
  // wins until the next selection resets it.
  const [strategistOverride, setStrategistOverride] = useState<boolean | null>(null);

  // Fetches on mount, then keeps polling for the life of the view — the
  // auto-fix loop can put the Reviewer back into "running" well after the
  // page first considered everything settled, and there's no manual
  // refresh once you're past the progress box (the Reader doesn't have
  // one), so stopping the poll early risked getting permanently stuck on
  // stale data.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetchStatus(projectId);
        if (cancelled) return;
        if (!result) {
          setError("Project not found.");
          return;
        }
        setData(result);
        setError(null);
      } catch {
        if (!cancelled) setError("Could not reach the server.");
      }
    }

    const intervalId = setInterval(load, POLL_INTERVAL_MS);
    load();

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [projectId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await fetchStatus(projectId).catch(() => null);
    if (result) {
      setData(result);
      setError(null);
    } else {
      setError("Could not reach the server.");
    }
    setRefreshing(false);
  };

  const handleSelect = async (option: "A" | "B") => {
    setSelecting(option);
    try {
      await fetch(`/api/projects/${projectId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chosenOption: option }),
      });
    } finally {
      const result = await fetchStatus(projectId).catch(() => null);
      if (result) setData(result);
      setSelecting(null);
      setStrategistOverride(false);
    }
  };

  const handleRework = () => {
    setViewMode("progress");
    void handleRefresh();
  };

  if (error) {
    return <p className="text-center text-sm text-destructive">{error}</p>;
  }

  if (!data) {
    return <p className="text-center text-sm text-muted-foreground">Loading...</p>;
  }

  const awaitingSelection = data.stages.strategist === "done" && !data.selection;

  if (viewMode === "reading" && data.scorecard) {
    return (
      <CaseStudyReader
        projectId={data.projectId}
        title={data.projectTitle}
        summary={data.draftSummary}
        metadata={{
          role: data.studentRole,
          team: data.teamSizeAndComposition,
          duration: data.duration,
          audience: data.targetAudience,
        }}
        initialSections={data.caseStudySections}
        callouts={data.caseStudyCallouts}
        charts={data.caseStudyCharts}
        scorecard={data.scorecard}
        onRework={handleRework}
      />
    );
  }

  const hasFailure = STAGES.some((s) =>
    s.key === "reviewer" ? reviewerDisplayStatus(data) === "failed" : data.stages[s.key] === "failed"
  );
  const strategistOpen = strategistOverride ?? awaitingSelection;

  return (
    <div className="mx-auto max-w-md">
      <div className="flex items-center justify-between gap-4">
        <h1 className="truncate text-lg font-semibold text-foreground">{data.projectTitle}</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <ArrowClockwise size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {data.uploadedFiles.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {data.uploadedFiles.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
            >
              <FileText size={12} />
              {name}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <ul className="divide-y divide-border">
          {STAGES.map((s) => {
            if (s.key === "strategist") {
              const status = data.stages.strategist;
              const subLabel = data.selection
                ? `Chose option ${data.selection.chosenOption}`
                : awaitingSelection
                  ? "Pick a direction"
                  : status;
              return (
                <li key="strategist">
                  <button
                    type="button"
                    onClick={() => data.strategy && setStrategistOverride(!strategistOpen)}
                    disabled={!data.strategy}
                    className="flex w-full items-center gap-3 py-2.5 text-left disabled:cursor-default"
                  >
                    <StageIcon status={status} />
                    <span className="text-sm font-medium text-foreground">Strategist</span>
                    <span className="ml-auto text-xs text-muted-foreground">{subLabel}</span>
                    {data.strategy && (
                      <CaretDown
                        size={14}
                        className={`shrink-0 text-muted-foreground transition-transform ${strategistOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {strategistOpen && data.strategy && (
                    <div className="grid gap-2.5 pb-3 sm:grid-cols-2">
                      <CondensedOption
                        label="A"
                        option={data.strategy.optionA}
                        chosen={data.selection?.chosenOption === "A"}
                        disabled={!!selecting || !awaitingSelection}
                        onChoose={() => handleSelect("A")}
                        loading={selecting === "A"}
                      />
                      <CondensedOption
                        label="B"
                        option={data.strategy.optionB}
                        chosen={data.selection?.chosenOption === "B"}
                        disabled={!!selecting || !awaitingSelection}
                        onChoose={() => handleSelect("B")}
                        loading={selecting === "B"}
                      />
                    </div>
                  )}
                </li>
              );
            }

            const status = s.key === "reviewer" ? reviewerDisplayStatus(data) : data.stages[s.key];
            const subLabel =
              s.key === "reviewer" && status === "running" && data.fixRoundsUsed > 0
                ? "applying fixes"
                : status;
            return (
              <li key={s.key} className="flex items-center gap-3 py-2.5">
                <StageIcon status={status} />
                <span className="text-sm font-medium text-foreground">{s.label}</span>
                <span className="ml-auto text-xs text-muted-foreground capitalize">{subLabel}</span>
              </li>
            );
          })}
        </ul>

        {reviewerDisplayStatus(data) === "done" && data.scorecard && (
          <Button className="mt-3 w-full" onClick={() => setViewMode("reading")}>
            View case study
          </Button>
        )}
      </div>

      {data.selection && !data.reviewComplete && !hasFailure && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          This can take a few minutes. Feel free to close this tab, we&apos;ll
          email you a link and a PDF copy as soon as it&apos;s ready.
        </p>
      )}

      {hasFailure && (
        <p className="mt-4 text-center text-sm text-destructive">
          Something went wrong on one of the stages. Check the server logs for details.
        </p>
      )}
    </div>
  );
}

function CondensedOption({
  label,
  option,
  chosen,
  disabled,
  loading,
  onChoose,
}: {
  label: "A" | "B";
  option: StrategyOption;
  chosen: boolean;
  disabled: boolean;
  loading: boolean;
  onChoose: () => void;
}) {
  return (
    <div className={`rounded-lg border p-3 ${chosen ? "border-primary bg-background" : "border-border bg-background"}`}>
      <p className="text-[11px] font-medium text-muted-foreground">
        Option {label}
        {chosen ? " (chosen)" : ""}
      </p>
      <h3 className="mt-0.5 text-sm font-semibold text-foreground">{option.angle}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{option.thesis}</p>
      {!chosen && (
        <Button size="sm" className="mt-2.5 w-full" disabled={disabled} onClick={onChoose}>
          {loading ? "Starting..." : `Use option ${label}`}
        </Button>
      )}
    </div>
  );
}

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "done") return <CheckCircle size={18} weight="fill" className="shrink-0 text-primary" />;
  if (status === "running")
    return <CircleNotch size={18} className="shrink-0 animate-spin text-primary" />;
  if (status === "failed")
    return <XCircle size={18} weight="fill" className="shrink-0 text-destructive" />;
  return <Circle size={18} className="shrink-0 text-muted-foreground" />;
}
