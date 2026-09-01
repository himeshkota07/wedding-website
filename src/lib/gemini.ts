import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentParameters } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;

// A hard per-request timeout so a slow/overloaded call fails fast instead of
// hanging -- without this, a rate-limited request can hang for minutes with
// nothing surfaced to the user (observed directly while testing: repeated
// 429s left a request pending for several minutes before it finally went
// through). Better to fail in ~12s and let the caller show a retry message.
export const gemini = new GoogleGenAI({ apiKey, httpOptions: { timeout: 12_000 } });

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

// Try the full-quality Flash model first; Google's infra occasionally
// returns 503 UNAVAILABLE on it under load, so fall back to Flash-Lite
// rather than let the whole request fail.
const GENERATION_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"] as const;

// The embedding endpoint's per-minute quota counts each text in a batch
// separately, so a knowledge-base resync (a few dozen chunks) can trip a
// 429 on a single call. Keep batches small and retry with backoff -- but
// keep the total retry budget short so a single chat request stays bounded.
const EMBED_BATCH_SIZE = 8;
const RETRY_DELAYS_MS = [2000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown) {
  return error instanceof Error && /RESOURCE_EXHAUSTED|429|UNAVAILABLE|503/.test(error.message);
}

async function embedBatch(texts: string[], taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await gemini.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: texts,
        config: { taskType, outputDimensionality: EMBEDDING_DIMENSIONS },
      });
      return (response.embeddings ?? []).map((e) => e.values ?? []);
    } catch (error) {
      if (!isRetryableError(error) || attempt >= RETRY_DELAYS_MS.length) throw error;
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}

export async function embedTexts(texts: string[], taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
  if (texts.length === 0) return [];
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    results.push(...(await embedBatch(batch, taskType)));
  }
  return results;
}

export async function generateWithFallback(params: Omit<GenerateContentParameters, "model">) {
  let lastError: unknown;
  for (const model of GENERATION_MODELS) {
    try {
      return await gemini.models.generateContent({ ...params, model });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
