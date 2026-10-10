// Runs the Organiser then Strategist directly against real storage, no
// Inngest required — for local testing while the Inngest dev server's
// local invocation issue is unresolved. Production still goes through the
// durable Inngest-wrapped versions in src/inngest/functions/.
//
// Usage: node --env-file=.env scripts/run-pipeline.ts <projectId>
import { runOrganiser } from "../src/pipeline/organiser";
import { runStrategistUpToGate } from "../src/pipeline/strategist";

const projectId = process.argv[2];
if (!projectId) {
  console.error("Usage: run-pipeline.ts <projectId>");
  process.exit(1);
}

async function main() {
  console.log(`Running Organiser for ${projectId}...`);
  const organiserResult = await runOrganiser(projectId);
  console.log("Organiser done:", organiserResult);

  console.log(`Running Strategist for ${projectId}...`);
  const strategistResult = await runStrategistUpToGate(projectId);
  console.log("Strategist done:", strategistResult);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
