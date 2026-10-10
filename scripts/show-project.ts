// Prints a project's stored files, for quick sanity-checking.
// Usage: node --env-file=.env scripts/show-project.ts <projectId>
import { getProjectFile } from "../src/lib/storage";

const projectId = process.argv[2];
if (!projectId) {
  console.error("Usage: show-project.ts <projectId>");
  process.exit(1);
}

const FILES = [
  "_status/organiser.json",
  "_status/strategist.json",
  "01_context/claims.md",
  "01_context/open_questions.md",
  "02_strategy/evidence_matrix.md",
  "02_strategy/option_A.md",
  "02_strategy/option_B.md",
];

async function main() {
  for (const path of FILES) {
    const { data, error } = await getProjectFile(projectId, path);
    console.log(`\n=== ${path} ===`);
    if (error || !data) {
      console.log(`(missing: ${error?.message})`);
      continue;
    }
    console.log(await data.text());
  }
}

main();
