// One-off check that the Organiser and Strategist LLM calls actually work
// against real OpenAI structured outputs, without needing storage/Supabase
// wired up. Run: npx tsx --env-file=.env scripts/test-pipeline-llm.ts
import { generateStructured } from "../src/lib/llm";
import { getSystemPrompt } from "../src/lib/prompts";
import { getAngles, getTones } from "../src/lib/config";
import { organiserLlmOutputSchema } from "../src/schemas/organiser-output";
import { strategistLlmOutputSchema } from "../src/schemas/strategist-output";

const SAMPLE_NOTES = `Project: Redesigning course discovery
Role: Product designer
Team: Solo
Duration: 6 weeks
Problem statement: Students could not find relevant courses, so conversion was low.
Target audience: Product design, PM
NDA constraints: None

Source S-001 (notes.txt):
User interviews showed 8 of 10 students gave up searching within 2 minutes.
Redesigned the filter UI and added personalized recommendations. Conversion
went from 2.1% to 4.4% over the pilot. One student said "I finally found
something relevant." Revenue per user also rose, though the exact number
was not tracked.`;

async function testOrganiser() {
  const systemPrompt = await getSystemPrompt("organiser");
  const result = await generateStructured({
    systemPrompt,
    userPrompt: [{ type: "input_text", text: SAMPLE_NOTES }],
    schema: organiserLlmOutputSchema,
    schemaName: "organiser_output",
  });
  console.log("\n=== ORGANISER OUTPUT ===");
  console.dir(result, { depth: null });
  return result;
}

async function testStrategist(claims: { id: string; text: string }[]) {
  const systemPrompt = await getSystemPrompt("strategist");
  const [angles, tones] = await Promise.all([getAngles(), getTones()]);

  const userPrompt = [
    "Target audience: Product design, PM",
    "Preferred length: standard",
    "",
    `Angle library: ${angles.map((a) => `${a.id} (${a.description})`).join("; ")}`,
    `Tone library: ${tones.map((t) => `${t.id} (${t.description})`).join("; ")}`,
    "",
    "Claims:",
    ...claims.map((c) => `- ${c.id}: ${c.text}`),
  ].join("\n");

  const result = await generateStructured({
    systemPrompt,
    userPrompt,
    schema: strategistLlmOutputSchema,
    schemaName: "strategist_output",
  });
  console.log("\n=== STRATEGIST OUTPUT ===");
  console.dir(result, { depth: null });
  return result;
}

async function main() {
  const organiserResult = await testOrganiser();
  const claims = organiserResult.claims.map((c, i) => ({
    id: `C-${String(i + 1).padStart(3, "0")}`,
    text: c.text,
  }));
  await testStrategist(claims);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
