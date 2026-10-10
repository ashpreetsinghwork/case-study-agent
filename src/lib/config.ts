import { readFile } from "node:fs/promises";
import path from "node:path";

const CONFIG_DIR = path.join(process.cwd(), "config");

async function readConfig<T>(name: string): Promise<T> {
  const raw = await readFile(path.join(CONFIG_DIR, name), "utf-8");
  return JSON.parse(raw) as T;
}

export interface Angle {
  id: string;
  label: string;
  description: string;
}

export interface Tone {
  id: string;
  label: string;
  description: string;
}

// Config-driven content (brief §5) — the angle/tone libraries live in JSON,
// not hardcoded into the prompt.
export async function getAngles(): Promise<Angle[]> {
  return readConfig<Angle[]>("angles.json");
}

export async function getTones(): Promise<Tone[]> {
  return readConfig<Tone[]>("tones.json");
}

export async function getSectionTemplate(): Promise<string[]> {
  return readConfig<string[]>("section_templates.json");
}

export type Rubrics = Record<"technical_seo" | "design_head" | "product_manager" | "hr", string[]>;

export async function getRubrics(): Promise<Rubrics> {
  return readConfig<Rubrics>("rubrics.json");
}
