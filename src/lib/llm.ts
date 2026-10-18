import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type {
  ResponseInputMessageContentList,
  Tool,
} from "openai/resources/responses/responses";
import type { z } from "zod";

// OpenAI only (text + images) — decided vendor for all four stages.
// Created lazily so importing this module doesn't crash build/dev when
// OPENAI_API_KEY isn't set yet — it only throws once actually called.
let client: OpenAI | undefined;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

// Pin exact snapshot IDs before shipping (guardrail: pinned models, not aliases).
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? "gpt-4.1";

export interface StructuredCallArgs<T> {
  systemPrompt: string; // constitution + stage/lens prompt, pre-joined by the caller
  // A plain string, or multimodal content parts (text/image/PDF) — lets a
  // stage hand the model vision and native file input instead of us running
  // our own OCR/parsing libraries.
  userPrompt: string | ResponseInputMessageContentList;
  schema: z.ZodType<T>;
  schemaName: string;
  // Hosted Responses API tools (e.g. web_search), omitted by default since
  // none of the case-study pipeline stages need live internet access.
  tools?: Tool[];
}

export async function generateStructured<T>({
  systemPrompt,
  userPrompt,
  schema,
  schemaName,
  tools,
}: StructuredCallArgs<T>): Promise<T> {
  const response = await getClient().responses.parse({
    model: TEXT_MODEL,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: { format: zodTextFormat(schema, schemaName) },
    ...(tools ? { tools } : {}),
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI response failed schema validation");
  }
  return response.output_parsed;
}
