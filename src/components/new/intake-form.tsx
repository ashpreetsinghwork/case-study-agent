"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CircleNotch,
  MagicWand,
  Plus,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type FieldErrors = Record<string, string[] | undefined>;

const ACCEPTED_FILES = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.txt,.md";

const STEPS = [
  { id: "basics", name: "The basics" },
  { id: "work", name: "The work" },
  { id: "audience", name: "Audience & constraints" },
  { id: "material", name: "Reference material" },
] as const;

type Values = {
  projectTitle: string;
  studentRole: string;
  teamSizeAndComposition: string;
  duration: string;
  problemStatement: string;
  outcomesAndMetrics: string;
  targetAudience: string;
  ndaConstraints: string;
};

const EMPTY_VALUES: Values = {
  projectTitle: "",
  studentRole: "",
  teamSizeAndComposition: "",
  duration: "",
  problemStatement: "",
  outcomesAndMetrics: "",
  targetAudience: "",
  ndaConstraints: "",
};

// Testing-only convenience — raw research materials recreated from real,
// published case studies (plus two synthetic fixtures) so a run through the
// pipeline can be compared against the real thing. Gated out of production
// below so it never ships as a real feature.
type SampleProject = {
  id: string;
  label: string;
  values: Values;
  links: string[];
  fileUrls: string[];
};

const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: "course-listing-redesign",
    label: "Course Listing Redesign (PW)",
    values: {
      projectTitle: "Course Listing Redesign - PW Learning App",
      studentRole: "User research, Visual design",
      teamSizeAndComposition:
        "Solo designer, with PM + engineering support (team composition isn't stated in the source case study)",
      duration: "4 months",
      problemStatement:
        "PW Learning App has 44.6 lakh+ paid users (FY25), and the course listing page is the single biggest revenue surface in the app — but the existing batch card was cluttered and outdated. 30% of students couldn't find the batch they needed, 25% weren't familiar with the batch naming system, and ~45% weren't aware different batch types/SKUs even existed.",
      outcomesAndMetrics:
        "After redesigning and usability-testing the batch card with real students: +2.42% relative uplift in ARPU, +4.4% relative uplift in conversion, and an estimated 40Cr annual revenue impact, shipped across Android, iOS and Web.",
      targetAudience: "UX, Product Innovation, Motion",
      ndaConstraints: "None — published publicly by the author",
    },
    links: [],
    fileUrls: [
      "/dummy/course-listing-redesign/survey-and-interview-notes.md",
      "/dummy/course-listing-redesign/card-variant-feedback.md",
      "/dummy/course-listing-redesign/usability-testing-notes.md",
      "/dummy/course-listing-redesign/metrics-and-shipping-notes.md",
      "/dummy/course-listing-redesign/design-gap-analysis.png",
      "/dummy/course-listing-redesign/card-variant-1-name-focussed.png",
      "/dummy/course-listing-redesign/card-variant-2-teacher-focussed.png",
      "/dummy/course-listing-redesign/card-variant-3-vertical-teacher.png",
      "/dummy/course-listing-redesign/card-variant-4-goal-and-teacher.png",
      "/dummy/course-listing-redesign/final-card-iterations.png",
      "/dummy/course-listing-redesign/final-output-bento-1.png",
    ],
  },
  {
    id: "pi-ott-platform",
    label: "Pi — OTT Learning Platform (PW)",
    values: {
      projectTitle: "Pi — OTT-style Learning Platform (PW)",
      studentRole: "Branding, Product design",
      teamSizeAndComposition:
        "Not stated in source notes — branding + product design role on a cross-functional build team",
      duration: "April 2025 - ongoing",
      problemStatement:
        "PW's live-course model has real constraints: a fixed set of teachers per batch, daily live classes with no flexibility, a structured fixed curriculum, full-year upfront pricing, a single exam focus, and fixed test/revision timelines. We needed a new product, positioned against Seekho (bite-sized but shallow), YouTube (teacher variety but no structure) and Netflix (great personalization, not education-specific) — landing on long-form content with teachers as the hero, like an OTT platform for education.",
      outcomesAndMetrics:
        "5.57L paid subscribers, 50K+ daily active users, and 30Cr revenue so far (as of this write-up), still live and growing. Shipped the subscription page (after two rounds fixing price-dominance and sticky-plan scrolling issues), the pen-first \"Ask AI\" doubt-solving feature, and a self-paced Practice & Test Arena.",
      targetAudience: "Product design, Branding, 0-to-1 product build",
      ndaConstraints: "None — published publicly by the author",
    },
    links: [],
    fileUrls: [
      "/dummy/pi-ott-platform/positioning-research-notes.md",
      "/dummy/pi-ott-platform/branding-notes.md",
      "/dummy/pi-ott-platform/product-build-notes.md",
      "/dummy/pi-ott-platform/ai-thumbnail-automation-notes.md",
      "/dummy/pi-ott-platform/metrics-and-reviews.md",
      "/dummy/pi-ott-platform/positioning-seekho.png",
      "/dummy/pi-ott-platform/positioning-youtube.png",
      "/dummy/pi-ott-platform/positioning-netflix.png",
      "/dummy/pi-ott-platform/branding-founder-tattoo.png",
      "/dummy/pi-ott-platform/branding-pi-symbol-infinity.png",
      "/dummy/pi-ott-platform/onboarding-homepage-sketch.png",
      "/dummy/pi-ott-platform/subscription-price-dominant-iteration.png",
      "/dummy/pi-ott-platform/subscription-sticky-plans-issue.png",
      "/dummy/pi-ott-platform/subscription-final-bento-1.png",
      "/dummy/pi-ott-platform/subscription-final-bento-2.png",
      "/dummy/pi-ott-platform/practice-test-arena.png",
      "/dummy/pi-ott-platform/thumbnail-generation-workflow.png",
      "/dummy/pi-ott-platform/slack-integration-adoption.png",
    ],
  },
  {
    id: "quickbite-reorder-feature",
    label: "QuickBite — Reorder My Usual",
    values: {
      projectTitle: "QuickBite — Reorder My Usual",
      studentRole: "Product design",
      teamSizeAndComposition: "1 product designer (me), 1 engineer, part-time PM support",
      duration: "Shipped in under 4 weeks; 3-week A/B pilot",
      problemStatement:
        "Intercept interviews with 6 frequent orderers (3+ times/week) showed almost everyone reorders the same \"usual\" at least half the time, but re-browses the full menu every time since there's no shortcut. Re-customizing a slightly different order (e.g. \"no onions\") from scratch felt like too much friction on mobile, and the existing order-history page was buried three taps deep. Deliberately scoped to just one \"Reorder\" button and the flow behind it — not a menu redesign or loyalty program.",
      outcomesAndMetrics:
        "Piloted to 50% of returning users for 3 weeks: time from app-open to checkout dropped from 2m10s to 38s, repeat-order completion rate rose from 61% to 79%, and orders per returning user/week rose from 1.4 to 1.6. \"Wrong item\" support tickets also dropped, though that metric wasn't cleanly tagged going in.",
      targetAudience: "Product design, PM",
      ndaConstraints: "None — fictional/synthetic test project, no real company",
    },
    links: [],
    fileUrls: [
      "/dummy/quickbite-reorder-feature/user-notes.md",
      "/dummy/quickbite-reorder-feature/metrics-summary.md",
    ],
  },
  {
    id: "flowly-pricing-growth-test",
    label: "Flowly — Pricing Page Growth Test",
    values: {
      projectTitle: "Flowly — Pricing Page Social Proof A/B Test",
      studentRole: "Product design",
      teamSizeAndComposition: "1 product designer (me) + 1 PM, reused an existing engineer sprint slot",
      duration: "2 weeks, spec to shipped results",
      problemStatement:
        "Visitors landing on Flowly's pricing page had no signal that other teams trust the product — just plans and features. Hypothesis: adding lightweight social proof (customer count + testimonials) near the plan cards would reduce hesitation and lift signup conversion without touching pricing or copy, keeping it a clean single-variable test after previous bigger pricing-page overhauls (6+ weeks) made it hard to isolate what moved the needle.",
      outcomesAndMetrics:
        "2-week 50/50 test (~8,400 visitors/arm): pricing-page-to-signup conversion rose from 4.8% to 6.1% (a 27% relative lift, statistically significant). Day-1 trial activation moved from 71% to 73%, treated as noise given sample size. Rolled out to 100% of pricing-page traffic after the test.",
      targetAudience: "Product design, Growth",
      ndaConstraints: "None — fictional/synthetic test project, no real company",
    },
    links: [],
    fileUrls: [
      "/dummy/flowly-pricing-growth-test/experiment-notes.md",
      "/dummy/flowly-pricing-growth-test/results-summary.md",
    ],
  },
  {
    id: "pulsehr-approval-redesign",
    label: "PulseHR — Leave Approval Redesign",
    values: {
      projectTitle: "PulseHR — Leave Request Approval Redesign",
      studentRole: "Product design",
      teamSizeAndComposition: "1 product designer (me), 1 PM, 2 engineers",
      duration: "6 weeks",
      problemStatement:
        "A manager survey (212 respondents) plus follow-up interviews found that 68% of managers had forgotten about a pending leave request at least once, and the average approval time was 4.2 days with a long tail over a week. Employees had no visibility into status beyond a bare \"Pending\" label. Scoped to the approval queue and status view only — not the request form itself, which nobody flagged as a problem.",
      outcomesAndMetrics:
        "Piloted the redesigned inbox-style approval queue for 2 weeks after a 4-week baseline: average approval time dropped from ~4.3 to ~1.95 days, and the share of employees who said they knew their request's status rose from ~32% to ~77%.",
      targetAudience: "Product design, PM",
      ndaConstraints: "None — fictional/synthetic test project, no real company",
    },
    links: [],
    fileUrls: [
      "/dummy/pulsehr-approval-redesign/interview-notes.md",
      "/dummy/pulsehr-approval-redesign/research-brief.pdf",
      "/dummy/pulsehr-approval-redesign/approval-metrics.csv",
      "/dummy/pulsehr-approval-redesign/before-approval-screen.png",
      "/dummy/pulsehr-approval-redesign/after-approval-inbox.png",
    ],
  },
  {
    id: "trailmap-onboarding",
    label: "Trailmap — Route Discovery Onboarding",
    values: {
      projectTitle: "Trailmap — Skill-Level Onboarding for Route Discovery",
      studentRole: "Product design, UX research",
      teamSizeAndComposition: "Solo designer + 1 engineer",
      duration: "5 weeks",
      problemStatement:
        "Usability sessions with 7 new users showed most didn't know which routes matched their fitness level from the unfiltered list shown right after signup — 2 of 7 didn't save a route at all within a 5-minute task. A competitor scan found that asking a quick skill-level question before showing routes is a common pattern in the category, not something Trailmap was doing. Scoped to a single onboarding question, not a full filters/search overhaul.",
      outcomesAndMetrics:
        "Funnel data from 1,000 new signups per variant: users reaching a route detail view rose from 540 to 861, and users saving a first route rose from 301 to 704.",
      targetAudience: "Product design, UX research",
      ndaConstraints: "None — fictional/synthetic test project, no real company",
    },
    links: [],
    fileUrls: [
      "/dummy/trailmap-onboarding/user-research-notes.md",
      "/dummy/trailmap-onboarding/competitor-scan.pdf",
      "/dummy/trailmap-onboarding/onboarding-funnel.csv",
      "/dummy/trailmap-onboarding/before-generic-list.png",
      "/dummy/trailmap-onboarding/after-skill-quiz.png",
    ],
  },
];

function FieldError({ name, errors }: { name: string; errors: FieldErrors }) {
  const message = errors[name]?.[0];
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-destructive">{message}</p>;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function IntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [links, setLinks] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [autofilling, setAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLastStep = step === STEPS.length - 1;

  const update = (key: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const goNext = () => {
    if (formRef.current?.reportValidity()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const addFiles = (incoming: FileList | File[]) => {
    setFiles((prev) => [...prev, ...Array.from(incoming)]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    // Same reasoning as handleFileInput below — snapshot now, since
    // DataTransfer's file list isn't guaranteed to stay valid once this
    // handler returns and addFiles's setState updater actually runs.
    const incoming = Array.from(e.dataTransfer.files);
    if (incoming.length) addFiles(incoming);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    // Snapshot into a plain array before clearing the input — `files` is
    // the browser's live FileList, and clearing `value` empties it in
    // place. `addFiles` reads it lazily inside a setState updater, so by
    // the time that ran against the FileList reference, the reset below
    // had already zeroed it out and nothing got attached.
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (incoming.length) addFiles(incoming);
  };

  const autofillProject = async (id: string) => {
    const project = SAMPLE_PROJECTS.find((p) => p.id === id);
    if (!project) return;

    setValues(project.values);
    setLinks(project.links.length ? project.links : [""]);
    setFiles([]);
    setAutofillError(null);
    setAutofilling(true);
    try {
      const sampleFiles = await Promise.all(
        project.fileUrls.map(async (url) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`${url} responded ${res.status}`);
          const blob = await res.blob();
          return new File([blob], url.split("/").pop()!, { type: blob.type });
        })
      );
      addFiles(sampleFiles);
    } catch (err) {
      setAutofillError(err instanceof Error ? err.message : "Could not load sample files.");
    } finally {
      setAutofilling(false);
    }
  };

  const submitForm = async () => {
    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    links.filter((l) => l.trim()).forEach((l) => formData.append("relevantLinks", l.trim()));
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/projects", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrors(body?.error?.fieldErrors ?? {});
        setSubmitting(false);
        return;
      }
      const { projectId } = await res.json();
      router.push(`/projects/${projectId}`);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={(e) => e.preventDefault()}
      noValidate
      className="text-left"
    >
      <div className="mb-8">
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground">{STEPS[step].name}</h2>
          {process.env.NODE_ENV !== "production" && (
            <div className="relative ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-2.5 pr-1.5 text-muted-foreground">
              {autofilling ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <MagicWand size={14} />
              )}
              <select
                aria-label="Autofill with a dummy project"
                disabled={autofilling}
                value=""
                onChange={(e) => {
                  if (e.target.value) autofillProject(e.target.value);
                }}
                className="cursor-pointer appearance-none rounded-md bg-transparent py-1 pr-1 text-sm font-medium text-muted-foreground outline-none hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  {autofilling ? "Loading sample files..." : "Autofill"}
                </option>
                {SAMPLE_PROJECTS.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="projectTitle">Project title</Label>
            <Input
              id="projectTitle"
              required
              value={values.projectTitle}
              onChange={update("projectTitle")}
              className="mt-1.5"
            />
            <FieldError name="projectTitle" errors={errors} />
          </div>
          <div>
            <Label htmlFor="studentRole">Your role</Label>
            <Input
              id="studentRole"
              required
              placeholder="e.g. Product designer"
              value={values.studentRole}
              onChange={update("studentRole")}
              className="mt-1.5"
            />
            <FieldError name="studentRole" errors={errors} />
          </div>
          <div>
            <Label htmlFor="teamSizeAndComposition">Team size &amp; composition</Label>
            <Input
              id="teamSizeAndComposition"
              required
              placeholder="e.g. Solo, or 3 designers + 2 engineers"
              value={values.teamSizeAndComposition}
              onChange={update("teamSizeAndComposition")}
              className="mt-1.5"
            />
            <FieldError name="teamSizeAndComposition" errors={errors} />
          </div>
          <div>
            <Label htmlFor="duration">Duration / dates</Label>
            <Input
              id="duration"
              required
              placeholder="e.g. Jan-Mar 2026, 8 weeks"
              value={values.duration}
              onChange={update("duration")}
              className="mt-1.5"
            />
            <FieldError name="duration" errors={errors} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="problemStatement">Problem statement</Label>
            <Textarea
              id="problemStatement"
              required
              rows={5}
              value={values.problemStatement}
              onChange={update("problemStatement")}
              className="mt-1.5"
            />
            <FieldError name="problemStatement" errors={errors} />
          </div>
          <div>
            <Label htmlFor="outcomesAndMetrics">Outcomes &amp; metrics (optional)</Label>
            <Textarea
              id="outcomesAndMetrics"
              rows={4}
              placeholder="Any numbers you can point to, or leave blank if none yet"
              value={values.outcomesAndMetrics}
              onChange={update("outcomesAndMetrics")}
              className="mt-1.5"
            />
            <FieldError name="outcomesAndMetrics" errors={errors} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="targetAudience">Target roles / audience</Label>
            <Input
              id="targetAudience"
              required
              placeholder="e.g. Product design, PM"
              value={values.targetAudience}
              onChange={update("targetAudience")}
              className="mt-1.5"
            />
            <FieldError name="targetAudience" errors={errors} />
          </div>
          <div>
            <Label htmlFor="ndaConstraints">Confidentiality / NDA constraints</Label>
            <Input
              id="ndaConstraints"
              required
              placeholder="e.g. None, or company names redacted"
              value={values.ndaConstraints}
              onChange={update("ndaConstraints")}
              className="mt-1.5"
            />
            <FieldError name="ndaConstraints" errors={errors} />
          </div>
          <div>
            <Label>Relevant links (optional)</Label>
            <div className="mt-1.5 space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    type="url"
                    value={link}
                    placeholder="https://..."
                    onChange={(e) =>
                      setLinks((prev) => prev.map((l, idx) => (idx === i ? e.target.value : l)))
                    }
                  />
                  {links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label="Remove link"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setLinks((prev) => [...prev, ""])}
            >
              <Plus size={14} /> Add another link
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <div>
            <Label>Notes, decks &amp; screenshots (optional)</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !autofilling && fileInputRef.current?.click()}
              className={`mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? "border-primary bg-muted" : "border-border hover:border-primary/50"
              }`}
            >
              {autofilling ? (
                <>
                  <CircleNotch size={22} className="animate-spin text-primary" />
                  <p className="text-sm text-foreground">Fetching sample files...</p>
                </>
              ) : (
                <>
                  <UploadSimple size={22} className="text-primary" />
                  <p className="text-sm text-foreground">Drop files, or click to browse</p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, PPTX, images, or text/markdown notes
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_FILES}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {autofillError && <p className="mt-2 text-sm text-destructive">{autofillError}</p>}

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <span className="truncate text-foreground">{file.name}</span>
                    <span className="ml-3 flex shrink-0 items-center gap-3">
                      <span className="text-muted-foreground">{formatSize(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label={`Remove ${file.name}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        {step > 0 ? (
          <Button type="button" variant="outline" size="lg" onClick={goBack}>
            <ArrowLeft size={16} /> Back
          </Button>
        ) : (
          <span />
        )}

        {isLastStep ? (
          <Button type="button" size="lg" className="px-6" onClick={submitForm} disabled={submitting}>
            {submitting ? "Starting..." : "Start your case study"}
          </Button>
        ) : (
          <Button type="button" size="lg" className="px-6" onClick={goNext}>
            Continue <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </form>
  );
}
