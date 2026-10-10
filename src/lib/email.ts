import { Resend } from "resend";

let client: Resend | undefined;
function getClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY!);
  return client;
}

const FROM = process.env.EMAIL_FROM ?? "Case Study Agent <onboarding@resend.dev>";

export async function sendCaseStudyReadyEmail({
  to,
  projectTitle,
  projectUrl,
  pdf,
}: {
  to: string;
  projectTitle: string;
  projectUrl: string;
  pdf: Buffer;
}): Promise<void> {
  const { error } = await getClient().emails.send({
    from: FROM,
    to,
    subject: `Your case study is ready: ${projectTitle}`,
    html: `
      <p>Your case study "${projectTitle}" is ready.</p>
      <p><a href="${projectUrl}">Open it here</a> to read, edit, or download it again — a PDF copy is also attached to this email.</p>
    `,
    attachments: [{ filename: "case-study.pdf", content: pdf }],
  });

  if (error) {
    throw new Error(`Resend failed to send to ${to}: ${error.message}`);
  }
}
