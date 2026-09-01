import "server-only";

const API_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

export const SPEECH_LANGUAGE_CODES = ["en-IN", "te-IN", "kn-IN"] as const;
export type SpeechLanguageCode = (typeof SPEECH_LANGUAGE_CODES)[number];

export function isSpeechLanguageCode(value: unknown): value is SpeechLanguageCode {
  return typeof value === "string" && (SPEECH_LANGUAGE_CODES as readonly string[]).includes(value);
}

export async function transcribeAudio(base64Audio: string, languageCode: SpeechLanguageCode): Promise<string> {
  const res = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      config: {
        encoding: "WEBM_OPUS",
        // Chrome/Firefox/Edge/Safari all record Opus at 48kHz by default;
        // the API requires this explicitly rather than reading it from the
        // container (confirmed directly against the live API).
        sampleRateHertz: 48000,
        // A single explicit language recognizes noticeably more accurately
        // than asking the API to guess between English/Telugu/Kannada --
        // confirmed directly: Kannada accuracy was poor under 3-way
        // auto-detection with alternativeLanguageCodes. The guest picks
        // their language in the UI before recording instead.
        languageCode,
        model: "default",
      },
      audio: { content: base64Audio },
    }),
  });

  if (!res.ok) {
    throw new Error(`Speech-to-Text failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const transcript = data.results?.map((r: { alternatives: { transcript: string }[] }) => r.alternatives[0]?.transcript).join(" ");
  return (transcript ?? "").trim();
}

// Telugu and Kannada script Unicode blocks -- used to pick a TTS voice
// language since the API needs an explicit languageCode, not auto-detect.
function detectSpeechLanguage(text: string): SpeechLanguageCode {
  if (/[ఀ-౿]/.test(text)) return "te-IN";
  if (/[ಀ-೿]/.test(text)) return "kn-IN";
  return "en-IN";
}

export async function synthesizeSpeech(text: string): Promise<{ audioBase64: string; languageCode: string }> {
  const languageCode = detectSpeechLanguage(text);

  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode, ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: "MP3" },
    }),
  });

  if (!res.ok) {
    throw new Error(`Text-to-Speech failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { audioBase64: data.audioContent as string, languageCode };
}
