import { readFile } from "node:fs/promises";
import path from "node:path";

export interface CaseStudyIndexEntry {
  id: string;
  company: string;
  title: string;
  sourceFile: string;
  tags: string[];
  structureNote: string;
}

const CONFIG_PATH = path.join(process.cwd(), "config", "case_study_index.json");
const SOURCES_DIR = path.join(process.cwd(), "sources");
const FEELER_PATH = path.join(process.cwd(), "CASE_STUDY_REFERENCE.md");

export async function getCaseStudyIndex(): Promise<CaseStudyIndexEntry[]> {
  const raw = await readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as CaseStudyIndexEntry[];
}

// Deterministic tag-overlap scoring, not an LLM call — the index is small
// and this only needs to be "close enough," not exact. Ties keep the
// index's own order so matching stays reproducible across runs.
export function pickClosestCaseStudy(
  signalText: string,
  index: CaseStudyIndexEntry[]
): CaseStudyIndexEntry {
  const haystack = signalText.toLowerCase();
  let best = index[0];
  let bestScore = -1;
  for (const entry of index) {
    const score = entry.tags.filter((tag) => haystack.includes(tag.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return best;
}

export async function getMatchedSourceBody(entry: CaseStudyIndexEntry): Promise<string> {
  return readFile(path.join(SOURCES_DIR, entry.sourceFile), "utf-8");
}

// Pulls just the "Cross-cutting patterns" section out of
// CASE_STUDY_REFERENCE.md (between the feeler:start/end markers) instead of
// the whole file — every reference case study's own detail already arrives
// separately via the matched source, so only the cross-cutting summary adds
// anything new here.
export async function getCaseStudyFeeler(): Promise<string> {
  const raw = await readFile(FEELER_PATH, "utf-8");
  const start = raw.indexOf("<!-- feeler:start -->");
  const end = raw.indexOf("<!-- feeler:end -->");
  if (start === -1 || end === -1) return raw;
  return raw.slice(start + "<!-- feeler:start -->".length, end).trim();
}

export interface MatchedCaseStudy {
  id: string;
  title: string;
  company: string;
  sourceFile: string;
}

export async function buildCaseStudyReferenceBlock(
  signalText: string
): Promise<{ matched: MatchedCaseStudy; referenceBlock: string }> {
  const index = await getCaseStudyIndex();
  const entry = pickClosestCaseStudy(signalText, index);
  const [guide, body, feeler] = await Promise.all([
    readFile(path.join(process.cwd(), "prompts", "AGENTS.md"), "utf-8"),
    getMatchedSourceBody(entry),
    getCaseStudyFeeler(),
  ]);

  const referenceBlock = [
    guide,
    "---",
    `Closest-matching reference case study: ${entry.title} (${entry.company})`,
    `Structural takeaway: ${entry.structureNote}`,
    "",
    body,
    "---",
    "Cross-cutting patterns across all reference case studies:",
    feeler,
  ].join("\n\n");

  return {
    matched: { id: entry.id, title: entry.title, company: entry.company, sourceFile: entry.sourceFile },
    referenceBlock,
  };
}
