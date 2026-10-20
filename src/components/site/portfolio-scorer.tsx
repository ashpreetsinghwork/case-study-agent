"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CircleNotch, DownloadSimple, X as XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CommunityBanner } from "@/components/site/community-banner";
import { getAnonId } from "@/lib/anon-id";
import { BANDS, THEMES, scoreOf, summarize, type Answers } from "@/lib/portfolio-score";

type Stage =
  | "landing"
  | "community"
  | "onboarding"
  | "quiz"
  | "portfolioUpload"
  | "loading"
  | "results";

interface Analysis {
  scores: number[];
  summary: string;
  themeFixes: { themeName: string; fix: string }[];
}

export function PortfolioScorer() {
  const [stage, setStage] = useState<Stage>("landing");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [loadingLabel, setLoadingLabel] = useState("Scoring your portfolio…");

  function toggleAnswer(key: string, value: boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function goPrev() {
    if (step === 0) {
      setStage("onboarding");
      return;
    }
    setStep((s) => s - 1);
  }

  function goNext() {
    setStep((s) => Math.min(s + 1, THEMES.length - 1));
  }

  function finishQuiz() {
    setStage("portfolioUpload");
  }

  function backToQuiz() {
    setStep(THEMES.length - 1);
    setStage("quiz");
  }

  function submitScorecard(
    finalAnalysis: Analysis | null,
    finalError: string | null,
    uploadId?: string
  ) {
    fetch("/api/score/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getAnonId(),
        answers,
        scores: finalAnalysis?.scores,
        summary: finalAnalysis?.summary,
        themeFixes: finalAnalysis?.themeFixes,
        analyzeError: finalError,
        uploadId,
      }),
      keepalive: true,
    }).catch(() => {});
  }

  function skipScan() {
    setAnalysis(null);
    setAnalyzeError(null);
    setLoadingLabel("Scoring your portfolio…");
    setStage("loading");
    submitScorecard(null, null);
    setTimeout(() => setStage("results"), 1000);
  }

  async function scanPortfolio(homepage: File, caseStudy: File, resume: File | null) {
    setAnalyzeError(null);
    setLoadingLabel("Reading your portfolio…");
    setStage("loading");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    let finalAnalysis: Analysis | null = null;
    let finalError: string | null = null;
    let uploadId: string | undefined;
    try {
      const formData = new FormData();
      formData.append("homepage", homepage);
      formData.append("caseStudy", caseStudy);
      if (resume) formData.append("resume", resume);
      formData.append("answers", JSON.stringify(answers));
      const res = await fetch("/api/score/analyze", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("scan failed");
      const data = (await res.json()) as {
        scores: number[];
        summary: string;
        accessible: boolean;
        themeFixes: { themeName: string; fix: string }[];
        uploadId: string;
      };
      uploadId = data.uploadId;
      if (!data.accessible) {
        finalError = `Couldn't read those pages. ${data.summary} Showing your self-reported score instead.`;
      } else {
        finalAnalysis = { scores: data.scores, summary: data.summary, themeFixes: data.themeFixes };
      }
    } catch {
      finalError = "Couldn't analyze those files, showing your self-reported score instead.";
    } finally {
      clearTimeout(timeout);
      setAnalysis(finalAnalysis);
      setAnalyzeError(finalError);
      submitScorecard(finalAnalysis, finalError, uploadId);
      setStage("results");
    }
  }

  function retake() {
    setAnswers({});
    setAnalysis(null);
    setAnalyzeError(null);
    setStep(0);
    setStage("quiz");
  }

  if (stage === "landing") {
    return <LandingHero onStart={() => setStage("community")} />;
  }
  if (stage === "community") {
    return (
      <CommunityStep
        onContinue={() => setStage("onboarding")}
        onBack={() => setStage("landing")}
      />
    );
  }
  if (stage === "onboarding") {
    return (
      <OnboardingStep
        onStart={() => {
          setStep(0);
          setStage("quiz");
        }}
        onBack={() => setStage("landing")}
      />
    );
  }
  if (stage === "quiz") {
    return (
      <ThemeFlow
        themeIndex={step}
        answers={answers}
        onToggle={toggleAnswer}
        onPrev={goPrev}
        onNext={goNext}
        onFinish={finishQuiz}
      />
    );
  }
  if (stage === "portfolioUpload") {
    return <PortfolioUploadStep onSkip={skipScan} onScan={scanPortfolio} onBack={backToQuiz} />;
  }
  if (stage === "loading") {
    return <LoadingState label={loadingLabel} />;
  }
  return (
    <ResultCard answers={answers} analysis={analysis} analyzeError={analyzeError} onRetake={retake} />
  );
}

const BADGE_PAIRS = [
  { left: { label: "Judgment & taste", score: 20 }, right: { label: "Communication", score: 85 } },
  { left: { label: "Building & shipping", score: 45 }, right: { label: "Fluency with AI", score: 90 } },
  { left: { label: "Designing for AI", score: 65 }, right: { label: "The person", score: 35 } },
] as const;

function LandingHero({ onStart }: { onStart: () => void }) {
  const demo = { percent: 70, bandIndex: 1 };
  return (
    <section className="mx-auto grid min-h-[88dvh] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8">
      <div>
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          The 90-Second Score
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
          Get your Portfolio <span className="text-primary">Scorecard</span>
        </h1>
        <p className="mt-5 max-w-[48ch] text-lg text-pretty text-muted-foreground">
          A 90-second evaluation across the six things hiring panels actually
          screen for. Check off what&apos;s true, theme by theme, and get
          your scored report card.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button size="lg" className="h-12 px-7 text-base" onClick={onStart}>
            Get my scorecard
          </Button>
          <span className="text-sm text-muted-foreground">
            Takes 90 seconds &middot; no sign-up
          </span>
        </div>
      </div>

      <div className="relative mx-auto mt-12 w-full max-w-sm sm:mt-16 lg:mt-0 lg:mx-0 lg:ml-auto">
        <div aria-hidden className="absolute -top-5 -left-4 z-10 rotate-[-8deg]">
          {BADGE_PAIRS.map((pair, i) => (
            <span
              key={pair.left.label}
              style={{ animationDelay: `${i * 3}s` }}
              className="animate-badge-pop absolute top-0 left-0 flex items-center whitespace-nowrap rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
            >
              {pair.left.label}
              <span className="ml-2 text-primary">{pair.left.score}</span>
            </span>
          ))}
        </div>
        <div aria-hidden className="absolute -right-4 -bottom-6 z-10 rotate-[6deg]">
          {BADGE_PAIRS.map((pair, i) => (
            <span
              key={pair.right.label}
              style={{ animationDelay: `${i * 3}s` }}
              className="animate-badge-pop absolute right-0 bottom-0 flex items-center whitespace-nowrap rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
            >
              {pair.right.label}
              <span className="ml-2 text-primary">{pair.right.score}</span>
            </span>
          ))}
        </div>

        <div
          aria-hidden
          className="relative rotate-[-2deg] rounded-3xl border border-border bg-card p-7 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.2)]"
        >
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Portfolio score
          </p>
          <p className="mt-2 text-6xl font-semibold tracking-tight text-foreground tabular-nums">
            {demo.percent}
            <span className="text-2xl text-muted-foreground"> / 100</span>
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-primary">
            {BANDS[demo.bandIndex].name}
          </h2>
          <div className="mt-5 grid grid-cols-4 gap-1.5">
            {BANDS.map((b, k) => (
              <div
                key={b.name}
                className={`h-2.5 rounded-full ${k === demo.bandIndex ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="mt-5 space-y-2.5 border-t border-border pt-5">
            {THEMES.slice(0, 3).map((t) => (
              <div key={t.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="min-w-0 flex-1 truncate">{t.name}</span>
                <span className="font-semibold text-foreground">&hellip; / 100</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityStep({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[88dvh] max-w-xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="animate-step-in">
        <CommunityBanner source="score" onContinue={onContinue} />
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-10 flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back
      </button>
    </section>
  );
}

function OnboardingStep({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <section className="mx-auto flex min-h-[88dvh] max-w-xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="animate-step-in">
        <p className="text-lg font-semibold text-muted-foreground">Before you start</p>
        <h2 className="mt-3 text-2xl font-semibold text-balance text-foreground sm:text-3xl">
          You&apos;ll go through {THEMES.length} quick themes.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Each theme will contain a few statements. Select all that hold true for you. Your
          portfolio is scored directly from what you choose, so be honest and take it seriously.
        </p>
        <Button size="lg" className="mt-8 h-12 px-7 text-base" onClick={onStart}>
          Start
        </Button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-10 flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back
      </button>
    </section>
  );
}

function ThemeFlow({
  themeIndex,
  answers,
  onToggle,
  onPrev,
  onNext,
  onFinish,
}: {
  themeIndex: number;
  answers: Answers;
  onToggle: (key: string, value: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const theme = THEMES[themeIndex];
  const isLast = themeIndex === THEMES.length - 1;

  return (
    <section className="mx-auto flex min-h-[88dvh] max-w-xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((themeIndex + 1) / THEMES.length) * 100}%` }}
        />
      </div>
      <p className="mt-4 text-lg font-semibold text-muted-foreground">
        Theme {themeIndex + 1} of {THEMES.length}
      </p>

      <div key={theme.name} className="animate-step-in mt-3">
        <h2 className="text-2xl font-semibold text-balance text-foreground sm:text-3xl">
          {theme.name}
        </h2>
        <p className="mt-2 text-muted-foreground">
          Select all that apply for you.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {theme.items.map((item, itemIndex) => {
            const key = `${themeIndex}_${itemIndex}`;
            const checked = !!answers[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggle(key, !checked)}
                className={`flex items-start gap-3 rounded-2xl border-2 px-5 py-4 text-left text-base font-medium transition-colors ${
                  checked
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-foreground hover:border-primary/40"
                }`}
              >
                <span
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 ${
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-transparent"
                  }`}
                >
                  <Check weight="bold" size={14} />
                </span>
                {item.text}
              </button>
            );
          })}
        </div>

        {isLast && (
          <Button size="lg" className="animate-step-in mt-6 h-12 w-full text-base" onClick={onFinish}>
            Continue to my score card
          </Button>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Button type="button" variant="outline" size="lg" className="h-12 px-7 text-base" onClick={onPrev}>
          Previous
        </Button>

        {!isLast && (
          <Button
            type="button"
            size="lg"
            className="h-12 bg-foreground px-7 text-base text-background hover:bg-foreground/90"
            onClick={onNext}
          >
            Next
          </Button>
        )}
      </div>
    </section>
  );
}

function FileField({
  label,
  file,
  onChange,
  accept = ".html,.htm,.mhtml",
  placeholder = "Choose an .html file",
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        onClick={() => inputRef.current?.click()}
        className="mt-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm transition-colors hover:border-primary/50"
      >
        <span className={file ? "truncate text-foreground" : "text-muted-foreground"}>
          {file ? file.name : placeholder}
        </span>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${label}`}
          >
            <XIcon size={14} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function PortfolioUploadStep({
  onSkip,
  onScan,
  onBack,
}: {
  onSkip: () => void;
  onScan: (homepage: File, caseStudy: File, resume: File | null) => void;
  onBack: () => void;
}) {
  const [homepage, setHomepage] = useState<File | null>(null);
  const [caseStudy, setCaseStudy] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const canScan = !!homepage && !!caseStudy;

  return (
    <section className="mx-auto flex min-h-[88dvh] max-w-xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="animate-step-in">
        <p className="text-lg font-semibold text-muted-foreground">One more thing (optional)</p>
        <h2 className="mt-3 text-2xl font-semibold text-balance text-foreground sm:text-3xl">
          Want a complete analysis? Upload your portfolio.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Right click on your deployed portfolio webpage and save it as HTML. Upload your homepage
          and best case study as HTML.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <FileField label="Homepage" file={homepage} onChange={setHomepage} />
          <FileField label="Best case study" file={caseStudy} onChange={setCaseStudy} />
          <FileField
            label="Resume (optional)"
            file={resume}
            onChange={setResume}
            accept=".pdf,.txt"
            placeholder="Choose a .pdf or .txt file"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 flex-1 text-base"
            disabled={!canScan}
            onClick={() => homepage && caseStudy && onScan(homepage, caseStudy, resume)}
          >
            Scan my portfolio
          </Button>
          <Button size="lg" variant="outline" className="h-12 flex-1 text-base" onClick={onSkip}>
            Skip, use my answers
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-10 flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Previous
      </button>
    </section>
  );
}

function LoadingState({ label = "Scoring your portfolio…" }: { label?: string }) {
  return (
    <section className="flex min-h-[88dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <CircleNotch size={32} className="animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </section>
  );
}

function ResultCard({
  answers,
  analysis,
  analyzeError,
  onRetake,
}: {
  answers: Answers;
  analysis: Analysis | null;
  analyzeError: string | null;
  onRetake: () => void;
}) {
  const { band, percent, themePercents, topFixes } = useMemo(
    () => (analysis ? summarize(analysis.scores) : scoreOf(answers)),
    [answers, analysis]
  );
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const res = await fetch("/api/score/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          analysis ? { scores: analysis.scores, themeFixes: analysis.themeFixes } : { answers }
        ),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portfolio-score.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-step-in rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10">
        <h1 className="text-2xl font-semibold text-foreground">Portfolio score</h1>
        <p className="mt-4 text-7xl font-semibold tracking-tight text-foreground tabular-nums">
          {percent}
          <span className="text-2xl text-muted-foreground"> / 100</span>
        </p>
        <p className="mt-1 text-xl font-semibold text-primary">{band.name}</p>
        <p className="mt-2.5 max-w-[56ch] text-muted-foreground">{band.msg}</p>

        {analysis && (
          <div className="mt-4 rounded-xl bg-primary/10 p-4 text-sm text-foreground">
            <p className="font-semibold">Portfolio snapshot</p>
            <p className="mt-1">{analysis.summary}</p>
          </div>
        )}
        {analyzeError && <p className="mt-2.5 text-sm text-muted-foreground">{analyzeError}</p>}

        <div className="mt-8 border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground">Top fixes</h2>
          {topFixes.length === 0 ? (
            <p className="mt-2 text-muted-foreground">Nothing scored against you, nice work.</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {topFixes.map((t) => {
                const personalizedFix = analysis?.themeFixes.find((f) => f.themeName === t.name)?.fix;
                return (
                  <li key={t.name}>
                    <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                      <span>{t.name}</span>
                      <span className="text-muted-foreground tabular-nums">{t.percent} / 100</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Fix: </span>
                      {personalizedFix ?? t.fix}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground">Theme breakdown</h2>
          <div className="mt-3 space-y-3">
            {THEMES.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 truncate text-muted-foreground">{t.name}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${themePercents[i]}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-semibold tabular-nums text-foreground">
                  {themePercents[i]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={onRetake}>
          Start over
        </Button>
        <Button onClick={handleDownloadPdf} disabled={downloading}>
          <DownloadSimple size={14} />
          {downloading ? "Preparing PDF…" : "Download as PDF"}
        </Button>
      </div>
    </section>
  );
}
