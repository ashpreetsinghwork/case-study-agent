// Lists everything stored for a project, recursively. Usage:
// node --env-file=.env scripts/list-project-files.ts <projectId>
import { getDb } from "../src/lib/db";

const projectId = process.argv[2];
const BUCKET = "case-study-projects";

async function list(prefix: string): Promise<string[]> {
  const { data, error } = await getDb().storage.from(BUCKET).list(`${projectId}/${prefix}`);
  if (error || !data) return [];
  const files: string[] = [];
  for (const entry of data) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) {
      files.push(...(await list(path)));
    } else {
      files.push(path);
    }
  }
  return files;
}

list("").then((files) => console.log(files.sort().join("\n")));
