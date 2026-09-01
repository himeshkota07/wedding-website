import "server-only";

const API_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

// Guests ask in whichever of these three languages they're comfortable with.
const SPEECH_LANGUAGES = { primary: "en-IN", alternatives: ["te-IN", "kn-IN"] };

export async function transcribeAudio(base64Audio: string): Promise<string> {
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
        languageCode: SPEECH_LANGUAGES.primary,
        alternativeLanguageCodes: SPEECH_LANGUAGES.alternatives,
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
function detectSpeechLanguage(text: string): string {
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
