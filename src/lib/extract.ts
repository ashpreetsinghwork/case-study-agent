import type { ResponseInputMessageContentList } from "openai/resources/responses/responses";
import { getProjectFile, listProjectFiles } from "@/lib/storage";
import type { Source } from "@/schemas/context";

// Native LLM input first (per the brief's tech stack: "Native LLM PDF/image
// input; a parsing service for difficult DOCX/PPTX/scans" — the latter is
// marked optional, so it isn't wired up yet). Text and images/PDFs go
// straight to the model; anything else is logged as an open question
// instead of silently dropped.
const TEXT_EXTENSIONS = [".txt", ".md"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const PDF_EXTENSION = ".pdf";

function extensionOf(filename: string) {
  const i = filename.lastIndexOf(".");
  return i === -1 ? "" : filename.slice(i).toLowerCase();
}

function imageMimeFor(ext: string) {
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export interface ExtractedUploads {
  sources: Source[];
  content: ResponseInputMessageContentList;
  unsupportedNotes: string[];
}

export async function extractUploads(projectId: string): Promise<ExtractedUploads> {
  const files = await listProjectFiles(projectId, "uploads");
  const sources: Source[] = [];
  const content: ResponseInputMessageContentList = [];
  const unsupportedNotes: string[] = [];

  let n = 0;
  for (const file of files) {
    n += 1;
    const id = `S-${String(n).padStart(3, "0")}`;
    const ext = extensionOf(file.name);
    const { data, error } = await getProjectFile(projectId, `uploads/${file.name}`);

    if (error || !data) {
      unsupportedNotes.push(`Could not download ${file.name}; skipped.`);
      continue;
    }

    if (TEXT_EXTENSIONS.includes(ext)) {
      const text = await data.text();
      sources.push({ id, type: "text", title: file.name, extractedText: text });
      content.push({ type: "input_text", text: `Source ${id} (${file.name}):\n${text}` });
    } else if (ext === PDF_EXTENSION) {
      const buffer = Buffer.from(await data.arrayBuffer());
      sources.push({ id, type: "pdf", title: file.name });
      content.push({
        type: "input_file",
        filename: file.name,
        file_data: `data:application/pdf;base64,${buffer.toString("base64")}`,
      });
      content.push({ type: "input_text", text: `The file above is source ${id} (${file.name}).` });
    } else if (IMAGE_EXTENSIONS.includes(ext)) {
      const buffer = Buffer.from(await data.arrayBuffer());
      sources.push({ id, type: "image", title: file.name });
      content.push({
        type: "input_image",
        image_url: `data:${imageMimeFor(ext)};base64,${buffer.toString("base64")}`,
        detail: "auto",
      });
      content.push({ type: "input_text", text: `The image above is source ${id} (${file.name}).` });
    } else {
      const type = ext === ".docx" || ext === ".doc" ? "docx" : ext === ".pptx" || ext === ".ppt" ? "pptx" : "text";
      sources.push({ id, type, title: file.name });
      unsupportedNotes.push(
        `${file.name} (${id}) could not be parsed automatically; re-upload as PDF or paste its content as text.`
      );
    }
  }

  return { sources, content, unsupportedNotes };
}
