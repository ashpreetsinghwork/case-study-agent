import { readFile } from "node:fs/promises";
import path from "node:path";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

async function readPrompt(relativePath: string): Promise<string> {
  return readFile(path.join(PROMPTS_DIR, relativePath), "utf-8");
}

// Every stage prompt is prepended with the shared constitution (identity,
// honesty rules, formatting rules) per the brief's "shared constitution
// prompt" guardrail — a stage file only ever adds its own role prompt.
export async function getSystemPrompt(stage: "organiser" | "strategist" | "architect"): Promise<string> {
  const [constitution, stagePrompt] = await Promise.all([
    readPrompt("constitution.md"),
    readPrompt(`${stage}.md`),
  ]);
  return `${constitution}\n\n---\n\n${stagePrompt}`;
}

export async function getLensPrompt(
  lens: "technical_seo" | "design_head" | "product_manager" | "hr"
): Promise<string> {
  const [constitution, lensPrompt] = await Promise.all([
    readPrompt("constitution.md"),
    readPrompt(`reviewer/${lens}.md`),
  ]);
  return `${constitution}\n\n---\n\n${lensPrompt}`;
}
