import "server-only";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import type { GenerateContentParameters, ThinkingConfig } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;

// A hard per-request timeout so a slow/overloaded call fails fast instead of
// hanging -- without this, a rate-limited request can hang for minutes with
// nothing surfaced to the user (observed directly while testing: repeated
// 429s left a request pending for several minutes before it finally went
// through). Better to fail in ~12s and let the caller show a retry message.
export const gemini = new GoogleGenAI({ apiKey, httpOptions: { timeout: 12_000 } });

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

/**
 * Every model is pinned by name; no "-latest" aliases, which silently move to
 * whatever is newest (the busiest model, and a different voice in answers).
 * Each step down the chain is a different model with its own capacity, so an
 * overload on one doesn't take the chatbot down. Thinking is set per model
 * because the generations take different settings (Gemini 3.x uses levels and
 * some reject MINIMAL; 2.5 uses a token budget).
 */
type ModelStep = { model: string; thinking: ThinkingConfig };

/**
 * Guest answers. Gemini 3.6 Flash: current, no shutdown announced, strong in
 * Telugu, Kannada and Hindi, and not the newest-and-busiest model (3.8 Flash
 * kept returning "high demand"). Low thinking keeps answers careful without
 * the cost and wait of more. Measured 2026-10-14: ~1,850 tokens in, ~180 out
 * plus ~590 thinking, ~5-6 s.
 */
export const CHAT_MODELS: ModelStep[] = [
  { model: "gemini-3.6-flash", thinking: { thinkingLevel: ThinkingLevel.LOW } },
  {
    model: "gemini-3.5-flash-lite",
    thinking: { thinkingLevel: ThinkingLevel.MINIMAL },
  },
  { model: "gemini-2.5-flash", thinking: { thinkingBudget: 0 } },
];

/**
 * Quick jobs where speed matters more than depth: voice transcription and
 * rewriting a reply into the right script. 2.5 Flash first because the
 * transcription prompt was tuned and verified on it (Telugu vs Kannada).
 */
export const FAST_MODELS: ModelStep[] = [
  { model: "gemini-2.5-flash", thinking: { thinkingBudget: 0 } },
  {
    model: "gemini-3.5-flash-lite",
    thinking: { thinkingLevel: ThinkingLevel.MINIMAL },
  },
  { model: "gemini-3.6-flash", thinking: { thinkingLevel: ThinkingLevel.LOW } },
];

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

// "High demand" 503s tend to hit every Flash model at once but clear within
// seconds, and they fail fast, so one more round after a short pause rescues
// most requests while staying well inside a route's 30s budget.
const RETRY_ROUND_DELAY_MS = 1500;

/**
 * Runs the request on the first model in `chain` that answers. The chain owns
 * the thinking setting for each model; callers pass everything else.
 */
export async function generateWithFallback(
  params: Omit<GenerateContentParameters, "model">,
  chain: ModelStep[] = CHAT_MODELS,
) {
  const startedAt = Date.now();
  let lastError: unknown;
  for (let round = 0; round < 2; round++) {
    if (round > 0) {
      // Only when the first round failed fast: a round of slow timeouts
      // repeated would run past the 30s limit.
      if (!isRetryableError(lastError) || Date.now() - startedAt > 8_000) break;
      await sleep(RETRY_ROUND_DELAY_MS);
    }
    for (const { model, thinking } of chain) {
      try {
        return await gemini.models.generateContent({
          ...params,
          model,
          config: { ...params.config, thinkingConfig: thinking },
        });
      } catch (error) {
        console.warn(`[gemini] ${model} failed:`, error instanceof Error ? error.message.slice(0, 120) : error);
        lastError = error;
      }
    }
  }
  throw lastError;
}

const SPOKEN_LANGUAGES = ["en", "te", "kn", "hi"] as const;
export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

function isSpokenLanguage(value: unknown): value is SpokenLanguage {
  return typeof value === "string" && (SPOKEN_LANGUAGES as readonly string[]).includes(value);
}

// Asking for the language *before* the transcript matters: free-form
// transcription wrote Kannada speech in Telugu script (the two sound alike),
// while naming the language first got all three right -- confirmed against
// TTS-generated English/Telugu/Kannada clips. Google Speech-to-Text's own
// multi-language detection did worse still (Telugu came back as English).
const TRANSCRIBE_PROMPT = `A wedding guest recorded this voice question. Identify the main spoken language (English, Telugu, Kannada, or Hindi), then transcribe the speech word for word.
Telugu and Kannada sound similar; listen carefully to vocabulary and endings before deciding. Write the transcript in the script of the identified language (Kannada in Kannada script, Telugu in Telugu script, Hindi in Devanagari); keep any English words in English. Transcribe the complete utterance to the end. If there is no intelligible speech, use language "none" and an empty transcript.`;

export async function transcribeWithGemini(
  base64Audio: string,
  mimeType: string,
): Promise<{ text: string; language: SpokenLanguage | null }> {
  // FAST_MODELS: no reasoning needed to transcribe, which keeps a voice question to ~3s.
  const response = await generateWithFallback(
    {
      contents: [
        {
          role: "user",
          parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: TRANSCRIBE_PROMPT }],
        },
      ],
      config: {
        // Transcription wants no creativity: at the default temperature a clean
        // Telugu clip once came back as an invented, unrelated English question.
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: {
              type: Type.STRING,
              enum: [...SPOKEN_LANGUAGES, "none"],
            },
            transcript: { type: Type.STRING },
          },
          required: ["language", "transcript"],
          propertyOrdering: ["language", "transcript"],
        },
      },
    },
    FAST_MODELS,
  );
  const parsed = JSON.parse(response.text ?? "{}") as {
    language?: string;
    transcript?: string;
  };
  const language = isSpokenLanguage(parsed.language) ? parsed.language : null;
  return { text: (parsed.transcript ?? "").trim(), language };
}
