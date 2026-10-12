import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
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

// Pinned Flash first: the "-latest" aliases point at whatever model is
// newest, and those have been returning 503 UNAVAILABLE ("high demand") on
// every call for sustained periods while the pinned model kept answering.
// The aliases stay as fallbacks rather than letting the whole request fail.
const GENERATION_MODELS = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-flash-lite-latest"] as const;

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

export type SpokenLanguage = "en" | "te" | "kn";

// Asking for the language *before* the transcript matters: free-form
// transcription wrote Kannada speech in Telugu script (the two sound alike),
// while naming the language first got all three right -- confirmed against
// TTS-generated English/Telugu/Kannada clips. Google Speech-to-Text's own
// multi-language detection did worse still (Telugu came back as English).
const TRANSCRIBE_PROMPT = `A wedding guest recorded this voice question. Identify the main spoken language (English, Telugu, or Kannada), then transcribe the speech word for word.
Telugu and Kannada sound similar; listen carefully to vocabulary and endings before deciding. Write the transcript in the script of the identified language (Kannada in Kannada script, Telugu in Telugu script); keep any English words in English. Transcribe the complete utterance to the end. If there is no intelligible speech, use language "none" and an empty transcript.`;

export async function transcribeWithGemini(
  base64Audio: string,
  mimeType: string,
): Promise<{ text: string; language: SpokenLanguage | null }> {
  const response = await generateWithFallback({
    contents: [{ role: "user", parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: TRANSCRIBE_PROMPT }] }],
    config: {
      // No reasoning needed to transcribe; skipping it keeps a voice question to ~3s.
      thinkingConfig: { thinkingBudget: 0 },
      // Transcription wants no creativity: at the default temperature a clean
      // Telugu clip once came back as an invented, unrelated English question.
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING, enum: ["en", "te", "kn", "none"] },
          transcript: { type: Type.STRING },
        },
        required: ["language", "transcript"],
        propertyOrdering: ["language", "transcript"],
      },
    },
  });
  const parsed = JSON.parse(response.text ?? "{}") as { language?: string; transcript?: string };
  const language = parsed.language === "en" || parsed.language === "te" || parsed.language === "kn" ? parsed.language : null;
  return { text: (parsed.transcript ?? "").trim(), language };
}
