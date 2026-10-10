// Downloads one project file to /tmp for inspection.
// Usage: node --env-file=.env scripts/download-file.ts <projectId> <path>
import { writeFile } from "node:fs/promises";
import { getProjectFile } from "../src/lib/storage";

const [projectId, path] = process.argv.slice(2);

async function main() {
  const { data, error } = await getProjectFile(projectId, path);
  if (error || !data) {
    console.error("Failed:", error?.message);
    process.exit(1);
  }
  const out = `/tmp/${path.replace(/\//g, "_")}`;
  await writeFile(out, Buffer.from(await data.arrayBuffer()));
  console.log("Saved to", out);
}

main();
