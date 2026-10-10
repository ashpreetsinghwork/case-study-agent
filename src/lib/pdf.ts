import PDFDocument from "pdfkit";
import type { CalloutEntry, CaseStudySection, ChartEntry } from "@/schemas/draft";

export interface CaseStudyPdfInput {
  title: string;
  summary: string | null;
  metadata: { role: string; team: string; duration: string; audience: string };
  sections: CaseStudySection[];
  callouts: CalloutEntry[];
  charts: ChartEntry[];
}

// Splits "plain **bold** plain" into alternating segments — same subset
// MarkdownBody.tsx renders in the browser, mirrored here for the PDF so
// the two stay visually consistent.
function splitBold(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**")
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false }
    );
}

function writeInline(doc: PDFKit.PDFDocument, text: string, options?: PDFKit.Mixins.TextOptions) {
  const segments = splitBold(text);
  segments.forEach((seg, i) => {
    doc.font(seg.bold ? "Helvetica-Bold" : "Helvetica");
    doc.text(seg.text, { ...options, continued: i < segments.length - 1 });
  });
}

// Same line-based parsing MarkdownBody.tsx does for the browser (paragraphs,
// "### " sub-headings, "- " bullets) — kept in sync by hand since the two
// run in different renderers (DOM vs pdfkit), not worth sharing code for.
function writeBody(doc: PDFKit.PDFDocument, body: string) {
  const lines = body.trim().split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("### ")) {
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica-Bold").text(line.slice(4));
      doc.fontSize(10);
      continue;
    }
    if (line.startsWith("- ")) {
      doc.fontSize(10);
      doc.text("•  ", { continued: true, indent: 12 });
      writeInline(doc, line.slice(2));
      continue;
    }
    doc.fontSize(10);
    writeInline(doc, line);
    doc.moveDown(0.4);
  }
}

function writeChart(doc: PDFKit.PDFDocument, chart: ChartEntry) {
  doc.moveDown(0.3);
  doc.fontSize(9).font("Helvetica-Bold").text(chart.title);
  doc.font("Helvetica").fontSize(9);
  for (const p of chart.dataPoints) {
    doc.text(`  ${p.label}: ${p.value}${p.unit ?? ""}`);
  }
}

function writeCallouts(doc: PDFKit.PDFDocument, callouts: CalloutEntry[]) {
  if (callouts.length === 0) return;
  doc.moveDown(0.3);
  doc.font("Helvetica-Oblique").fontSize(9).fillColor("#555555");
  for (const c of callouts) {
    doc.text(`"${c.text}"`, { indent: 12 });
  }
  doc.fillColor("#000000").font("Helvetica").fontSize(10);
}

export async function renderCaseStudyPdf(input: CaseStudyPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.font("Helvetica-Bold").fontSize(20).text(input.title);

  if (input.summary) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Oblique").fontSize(11).fillColor("#444444").text(input.summary);
    doc.fillColor("#000000");
  }

  doc.moveDown(0.5);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#666666")
    .text(
      `Role: ${input.metadata.role}   Team: ${input.metadata.team}   Duration: ${input.metadata.duration}   For: ${input.metadata.audience}`
    );
  doc.fillColor("#000000");

  for (const section of input.sections) {
    doc.moveDown(1.2);
    doc.font("Helvetica-Bold").fontSize(14).text(section.heading);
    doc.moveDown(0.3);

    writeBody(doc, section.body);
    for (const chart of input.charts.filter((c) => c.section === section.id)) {
      writeChart(doc, chart);
    }
    writeCallouts(
      doc,
      input.callouts.filter((c) => c.section === section.id)
    );
  }

  doc.end();
  return done;
}
