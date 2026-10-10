import { getDb } from "./db";

const BUCKET = "case-study-projects";

// Uploads + generated images + generated context/draft/review files, laid out
// per project as documented in the brief:
//   projects/{id}/00_intake.json
//   projects/{id}/01_context/...
//   projects/{id}/02_strategy/...
//   projects/{id}/03_draft/...
//   projects/{id}/04_review/...
export function projectPath(projectId: string, relativePath: string) {
  return `${projectId}/${relativePath}`;
}

export async function putProjectFile(
  projectId: string,
  relativePath: string,
  body: Blob | ArrayBuffer | ArrayBufferView | string
) {
  const { data, error } = await getDb()
    .storage.from(BUCKET)
    .upload(projectPath(projectId, relativePath), body, {
      upsert: true,
      cacheControl: "0", // these are working files, not CDN-cacheable assets
    });
  if (error) {
    throw new Error(`Failed to write ${relativePath} for project ${projectId}: ${error.message}`);
  }
  return data;
}

export async function getProjectFile(projectId: string, relativePath: string) {
  return getDb().storage.from(BUCKET).download(projectPath(projectId, relativePath));
}

export async function listProjectFiles(projectId: string, relativeDir: string) {
  const { data, error } = await getDb()
    .storage.from(BUCKET)
    .list(projectPath(projectId, relativeDir));
  if (error) throw error;
  return data.filter((entry) => entry.id !== null); // list() also returns placeholder "folders"
}

export type StageStatus = "pending" | "running" | "done" | "failed";
export type Stage = "organiser" | "strategist" | "architect" | "reviewer";

// Overwriting the same manifest.json from separate stage invocations (a
// read-modify-write across processes) turned out to race against Supabase
// Storage's own overwrite consistency — a write from one process wasn't
// reliably visible to a read from another moments later, so the last
// stage to finish could silently clobber an earlier stage's update with
// stale data. Each stage instead owns a marker file nobody else touches,
// so there's nothing to race: read-your-own-write within a stage still
// works fine, and no stage ever reads-then-overwrites another's file.
export async function writeStageStatus(projectId: string, stage: Stage, status: StageStatus) {
  await putProjectFile(projectId, `_status/${stage}.json`, JSON.stringify({ status }));
}

export async function readStageStatus(projectId: string, stage: Stage): Promise<StageStatus> {
  const { data, error } = await getProjectFile(projectId, `_status/${stage}.json`);
  if (error || !data) return "pending";
  const parsed = JSON.parse(await data.text()) as { status: StageStatus };
  return parsed.status;
}
