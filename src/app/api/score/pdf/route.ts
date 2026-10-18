import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { BAND_PERCENT_LABELS, BANDS, THEMES, scoreOf, summarize, type Answers } from "@/lib/portfolio-score";

// Matches the site's light-mode tokens in globals.css.
const INK = "#23201a";
const MUTED = "#6b6355";
const PRIMARY = "#5e6ad2";
const BORDER = "#e6e4de";
const TRACK = "#f2f1ee";

interface ReportData {
  percent: number;
  themePercents: number[];
  band: { name: string; msg: string };
  bandIndex: number;
  topFixes: { name: string; fix: string; percent: number }[];
}

// Draws the card's content and returns the y position right after the last
// element. Pdfkit has no z-ordering, so to put a border *behind* this
// content we run it once with draw=false purely to measure the final y
// (font/fontSize/heightOfString never touch the output stream, only
// .text()/.rect()/.stroke() do), size the card from that, then run it
// again with draw=true on top of the card background.
function layoutCard(doc: PDFKit.PDFDocument, draw: boolean, yStart: number, x: number, width: number, data: ReportData) {
  let y = yStart;

  doc.font("Helvetica-Bold").fontSize(20);
  if (draw) doc.fillColor(INK).text("Portfolio score", x, y, { width });
  y += doc.heightOfString("Portfolio score", { width }) + 10;

  const bigSize = 52;
  const smallSize = 18;
  doc.font("Helvetica-Bold").fontSize(bigSize);
  const bigText = `${data.percent}`;
  const numH = doc.heightOfString(bigText, { width });
  if (draw) {
    const bigWidth = doc.widthOfString(bigText);
    doc.fillColor(INK).text(bigText, x, y);
    // `continued` text in pdfkit aligns by the top of each run's line box,
    // not by baseline like CSS inline text, so a smaller run floats near
    // the top instead of sitting on the big number's baseline. Helvetica's
    // ascent is ~0.72em, so offsetting by the ascent delta lands it there.
    const ascent = 0.72;
    const smallY = y + bigSize * ascent - smallSize * ascent;
    doc.font("Helvetica-Bold").fontSize(smallSize).fillColor(MUTED).text(" / 100", x + bigWidth, smallY);
  }
  y += numH + 6;

  doc.font("Helvetica-Bold").fontSize(15);
  if (draw) doc.fillColor(PRIMARY).text(data.band.name, x, y, { width });
  y += doc.heightOfString(data.band.name, { width }) + 6;

  doc.font("Helvetica").fontSize(10.5);
  if (draw) doc.fillColor(MUTED).text(data.band.msg, x, y, { width });
  y += doc.heightOfString(data.band.msg, { width }) + 18;

  const barH = 8;
  const segGap = 6;
  const segW = (width - segGap * 3) / 4;
  if (draw) {
    BANDS.forEach((_, i) => {
      doc
        .roundedRect(x + i * (segW + segGap), y, segW, barH, 4)
        .fill(i === data.bandIndex ? PRIMARY : TRACK);
    });
  }
  y += barH + 6;

  doc.font("Helvetica-Bold").fontSize(7.5);
  if (draw) {
    BAND_PERCENT_LABELS.forEach((label, i) => {
      doc.fillColor(MUTED).text(label, x + i * (segW + segGap), y, { width: segW });
    });
  }
  y += doc.heightOfString("0", { width: segW }) + 20;

  if (draw) doc.moveTo(x, y).lineTo(x + width, y).lineWidth(1).strokeColor(BORDER).stroke();
  y += 20;

  doc.font("Helvetica-Bold").fontSize(13);
  if (draw) doc.fillColor(INK).text("Top fixes", x, y, { width });
  y += doc.heightOfString("Top fixes", { width }) + 12;

  if (data.topFixes.length === 0) {
    const msg = "Nothing scored against you, nice work.";
    doc.font("Helvetica").fontSize(10.5);
    if (draw) doc.fillColor(MUTED).text(msg, x, y, { width });
    y += doc.heightOfString(msg, { width }) + 4;
  } else {
    data.topFixes.forEach((fix, idx) => {
      const scoreW = 56;
      doc.font("Helvetica-Bold").fontSize(11);
      const nameH = doc.heightOfString(fix.name, { width: width - scoreW - 8 });
      if (draw) {
        doc.fillColor(INK).text(fix.name, x, y, { width: width - scoreW - 8 });
        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(MUTED)
          .text(`${fix.percent} / 100`, x + width - scoreW, y, { width: scoreW, align: "right" });
      }
      y += nameH + 3;

      doc.font("Helvetica").fontSize(10);
      const fixH = doc.heightOfString(fix.fix, { width });
      if (draw) doc.fillColor(MUTED).text(fix.fix, x, y, { width });
      y += fixH + (idx < data.topFixes.length - 1 ? 14 : 4);
    });
  }
  y += 16;

  if (draw) doc.moveTo(x, y).lineTo(x + width, y).lineWidth(1).strokeColor(BORDER).stroke();
  y += 20;

  doc.font("Helvetica-Bold").fontSize(13);
  if (draw) doc.fillColor(INK).text("Theme breakdown", x, y, { width });
  y += doc.heightOfString("Theme breakdown", { width }) + 12;

  const rowH = 14;
  const labelWidth = 160;
  const scoreWidth = 56;
  const barX = x + labelWidth + 8;
  const barW = width - labelWidth - scoreWidth - 16;
  THEMES.forEach((theme, i) => {
    const pct = data.themePercents[i];
    if (draw) {
      doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(theme.name, x, y + 2, { width: labelWidth - 8 });
      doc.roundedRect(barX, y + 4, barW, 6, 3).fill(TRACK);
      if (pct > 0) doc.roundedRect(barX, y + 4, barW * (pct / 100), 6, 3).fill(PRIMARY);
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(INK)
        .text(`${pct} / 100`, barX + barW + 8, y + 2, { width: scoreWidth, align: "right" });
    }
    y += rowH;
  });

  return y;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    answers?: Answers;
    scores?: number[];
    themeFixes?: { themeName: string; fix: string }[];
  };
  const scored = body.scores ? summarize(body.scores) : scoreOf(body.answers ?? {});
  const topFixes = scored.topFixes.map((t) => {
    const override = body.themeFixes?.find((f) => f.themeName === t.name)?.fix;
    return { name: t.name, fix: override ?? t.fix, percent: t.percent };
  });
  const data = { ...scored, topFixes };

  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const pad = 32;
  const cardX = doc.page.margins.left;
  const cardWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const innerX = cardX + pad;
  const innerWidth = cardWidth - pad * 2;
  const cardTop = doc.page.margins.top;

  const contentBottom = layoutCard(doc, false, cardTop + pad, innerX, innerWidth, data);
  const cardHeight = contentBottom - cardTop + pad;

  doc.roundedRect(cardX, cardTop, cardWidth, cardHeight, 20).lineWidth(1).fillAndStroke("#ffffff", BORDER);
  layoutCard(doc, true, cardTop + pad, innerX, innerWidth, data);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text("The 90-Second Score · Case Study Agent", cardX, cardTop + cardHeight + 16, {
      width: cardWidth,
      align: "center",
    });

  doc.end();
  const buffer = await done;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="portfolio-score.pdf"',
    },
  });
}
