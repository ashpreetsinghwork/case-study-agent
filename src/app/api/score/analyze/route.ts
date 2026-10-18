import { NextResponse } from "next/server";
import type { ResponseInputMessageContentList } from "openai/resources/responses/responses";
import { generateStructured } from "@/lib/llm";
import { portfolioAnalysisSchema } from "@/schemas/portfolio-analysis";
import { FLAT, scoreOf, type Answers } from "@/lib/portfolio-score";

// Generous for a saved "Webpage, Complete" HTML file or a resume, since we
// only need the text/PDF content, not an arbitrary blob.
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TEXT_CHARS = 20000;

// ponytail: regex tag-strip rather than a real HTML parser, good enough for
// feeding visible text to the LLM; swap in cheerio if entity/structure
// fidelity ever matters (e.g. table layout, nested quote handling).
function htmlToText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const homepageFile = formData?.get("homepage");
  const caseStudyFile = formData?.get("caseStudy");
  const resumeFile = formData?.get("resume");

  if (!(homepageFile instanceof File) || !(caseStudyFile instanceof File)) {
    return NextResponse.json(
      { error: "Upload both your homepage and a case study as HTML" },
      { status: 400 }
    );
  }
  if (homepageFile.size > MAX_FILE_BYTES || caseStudyFile.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Each file must be under 8MB" }, { status: 400 });
  }
  const hasResume = resumeFile instanceof File;
  if (hasResume && resumeFile.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Resume must be under 8MB" }, { status: 400 });
  }

  let answers: Answers = {};
  const answersRaw = formData?.get("answers");
  if (typeof answersRaw === "string") {
    try {
      answers = JSON.parse(answersRaw);
    } catch {
      // ignore malformed payload, fall back to an empty self-report
    }
  }

  // Only statements an uploaded portfolio (and, if provided, a resume) can
  // actually speak to are ever sent for judging. Everything tagged "self"
  // (verbal skill, outside recognition, LinkedIn) never reaches the model
  // at all and always keeps the self-reported answer.
  const askedItems = FLAT.filter(
    (f) => f.item.source === "portfolio" || (f.item.source === "resume" && hasResume)
  );
  const askedKeys = new Set(askedItems.map((f) => f.key));

  const [homepageHtml, caseStudyHtml] = await Promise.all([homepageFile.text(), caseStudyFile.text()]);
  const homepageText = htmlToText(homepageHtml);
  const caseStudyText = htmlToText(caseStudyHtml);

  const statementList = askedItems
    .map((f) => `${f.key} [${f.theme.name}]: ${f.item.text}`)
    .join("\n");

  const systemPrompt = `You cross-check a specific list of statements from a portfolio self-assessment
checklist against real evidence: the owner's portfolio homepage, their best case study, and, if
provided, their resume. All are saved/extracted content, not live pages; judge them exactly as if
you were reading the rendered page or document.

You are given ONLY the statements below to judge. The rest of the checklist is intentionally out
of scope for you and is left to the owner's own self-report, so do not comment on or infer anything
beyond this list. A statement being TRUE of the portfolio is a problem (it costs a point); this
mirrors a checklist where ticking a box means "this is true of my portfolio", so lower is better.

For each statement: decide if it's true based only on the material provided. If that material
doesn't give you enough to tell either way, set found to false for it instead of guessing. Never
infer from silence alone. Only set found to true when you actually saw evidence confirming or
clearly contradicting the statement.
${hasResume ? `\nOne statement ("My CV, LinkedIn and portfolio tell three different stories.") mentions LinkedIn, which you do not have access to. Judge it only by comparing the resume against the portfolio (role, dates, project ownership, claims). Treat LinkedIn as simply not checkable; its absence alone is not a mismatch.\n` : ""}
If ALL of the provided material is essentially unusable (blank, unrelated, a loading shell, or a
login wall), set accessible to false and leave every itemVerdicts entry as found:false (they will
be ignored), and explain in one plain sentence why nothing could be judged. Never imply the
portfolio itself scored badly. Otherwise set accessible to true.

Statements to judge (use these exact keys):
${statementList}

Write summary as 1-3 short, plain sentences describing the portfolio directly to its owner, the
way a human reviewer would, for example: "Your case study states a clear outcome and names your
role, and walks through one option you rejected. It's thin on how you used AI, though." Never use
words like "statements", "checklist", "evidence", "verdict", or say something was "true"/"false"/
"contradicted"; describe what you actually saw (or didn't), not how you scored it. Do not use em
dashes in the summary; use a period or comma instead. Keep it under 400 characters.`;

  const userPrompt: string | ResponseInputMessageContentList = hasResume
    ? [
        { type: "input_text", text: `Homepage (saved HTML, text-only):\n${homepageText}` },
        { type: "input_text", text: `Best case study (saved HTML, text-only):\n${caseStudyText}` },
        ...(await resumeContent(resumeFile)),
      ]
    : `Homepage (saved HTML, text-only):\n${homepageText}\n\nBest case study (saved HTML, text-only):\n${caseStudyText}`;

  let analysis;
  try {
    analysis = await generateStructured({
      systemPrompt,
      userPrompt,
      schema: portfolioAnalysisSchema,
      schemaName: "portfolio_analysis",
    });
  } catch {
    return NextResponse.json({ error: "Could not analyze those pages right now" }, { status: 502 });
  }

  // Start from the self-report, then only override the items we actually
  // asked about and got real evidence for. Never trust a "couldn't read it"
  // result: if the whole upload was unusable, the merge is a no-op and we
  // keep the self-report exactly as given.
  const merged: Answers = { ...answers };
  if (analysis.accessible) {
    for (const verdict of analysis.itemVerdicts) {
      if (askedKeys.has(verdict.key) && verdict.found) {
        merged[verdict.key] = verdict.isTrue;
      }
    }
  }

  const { scores } = scoreOf(merged);
  return NextResponse.json({ scores, summary: analysis.summary, accessible: analysis.accessible });
}

async function resumeContent(file: File): Promise<ResponseInputMessageContentList> {
  const ext = file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "text";
  if (ext === "pdf") {
    const buffer = Buffer.from(await file.arrayBuffer());
    return [
      {
        type: "input_file",
        filename: file.name,
        file_data: `data:application/pdf;base64,${buffer.toString("base64")}`,
      },
      { type: "input_text", text: "The file above is the owner's resume." },
    ];
  }
  const text = (await file.text()).slice(0, MAX_TEXT_CHARS);
  return [{ type: "input_text", text: `Resume (text):\n${text}` }];
}
