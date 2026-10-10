import { getProjectFile } from "@/lib/storage";
import { intakeSchema } from "@/schemas/intake";
import { renderCaseStudyPdf } from "@/lib/pdf";
import { sendCaseStudyReadyEmail } from "@/lib/email";
import type { CalloutEntry, CaseStudySection, ChartEntry } from "@/schemas/draft";

interface DraftFile {
  sections: CaseStudySection[];
  summary: string;
  callouts: CalloutEntry[];
  charts: ChartEntry[];
}

// Fired once per finished pipeline run (initial generation and rework
// both call this after the reviewer's auto-fix loop settles) — emails the
// project's owner a link plus a PDF copy so they don't have to keep the
// tab open waiting. Best-effort: a failure here never fails the pipeline
// run itself, the case study is already saved and viewable regardless.
export async function notifyCaseStudyReady(projectId: string): Promise<void> {
  try {
    const [ownerFile, intakeFile, draftFile] = await Promise.all([
      getProjectFile(projectId, "owner.json"),
      getProjectFile(projectId, "00_intake.json"),
      getProjectFile(projectId, "03_draft/draft.json"),
    ]);

    if (ownerFile.error || !ownerFile.data) return; // pre-auth project, or owner write failed
    if (intakeFile.error || !intakeFile.data) return;
    if (draftFile.error || !draftFile.data) return;

    const owner = JSON.parse(await ownerFile.data.text()) as { email: string | null };
    if (!owner.email) return;

    const intake = intakeSchema.parse(JSON.parse(await intakeFile.data.text()));
    const draft = JSON.parse(await draftFile.data.text()) as DraftFile;

    const pdf = await renderCaseStudyPdf({
      title: intake.projectTitle,
      summary: draft.summary || null,
      metadata: {
        role: intake.studentRole,
        team: intake.teamSizeAndComposition,
        duration: intake.duration,
        audience: intake.targetAudience,
      },
      sections: draft.sections,
      callouts: draft.callouts ?? [],
      charts: draft.charts ?? [],
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const projectUrl = `${baseUrl}/projects/${projectId}`;

    await sendCaseStudyReadyEmail({
      to: owner.email,
      projectTitle: intake.projectTitle,
      projectUrl,
      pdf,
    });
  } catch (err) {
    console.error(`Could not send "case study ready" email for project ${projectId}:`, err);
  }
}
