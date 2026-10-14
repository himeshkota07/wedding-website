import "server-only";
import { dominantScript, dropBracketedEnglish } from "@/lib/scripts";

const API_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

type SpeechLanguageCode = "en-IN" | "te-IN" | "kn-IN" | "hi-IN";

/**
 * Backup transcription for when Gemini is unavailable. Its language
 * auto-detection is noticeably weaker than Gemini's (Kannada and Telugu are
 * often heard as English), but a rough transcript beats a failed question.
 * Only understands WebM/Opus, not the MP4 some Safari versions record.
 */
export async function transcribeAudio(base64Audio: string): Promise<string> {
  // alternativeLanguageCodes is only available on v1p1beta1.
  const res = await fetch(`https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      config: {
        encoding: "WEBM_OPUS",
        // Chrome/Firefox/Edge/Safari all record Opus at 48kHz by default;
        // the API requires this explicitly rather than reading it from the
        // container (confirmed directly against the live API).
        sampleRateHertz: 48000,
        languageCode: "en-IN",
        // At most three alternatives are allowed, and these are all of them.
        alternativeLanguageCodes: ["te-IN", "kn-IN", "hi-IN"],
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

const VOICE_FOR_SCRIPT = { telugu: "te-IN", kannada: "kn-IN", devanagari: "hi-IN", latin: "en-IN" } as const;

// The API needs an explicit languageCode, not auto-detect, so the voice
// follows the script with the most letters (one stray Telugu letter in a
// Kannada answer no longer switches to the Telugu voice). Hindi typed in
// English letters has no Devanagari, so it's read in the Indian English
// voice, which pronounces it reasonably.
function detectSpeechLanguage(text: string): SpeechLanguageCode {
  return VOICE_FOR_SCRIPT[dominantScript(text)];
}

// "Half past" the way people say it: 7:30 is "ఏడున్నర", not "7 గంటల 30 నిమిషాలు".
const TELUGU_HALF_PAST = [
  "పన్నెండున్నర",
  "ఒకటిన్నర",
  "రెండున్నర",
  "మూడున్నర",
  "నాలుగున్నర",
  "ఐదున్నర",
  "ఆరున్నర",
  "ఏడున్నర",
  "ఎనిమిదిన్నర",
  "తొమ్మిదిన్నర",
  "పదిన్నర",
  "పదకొండున్నర",
];

function teluguHalfPast(hour: string) {
  return TELUGU_HALF_PAST[Number(hour) % 12];
}

/** Telugu period-of-day word for an "x pm" hour, so "6:00 PM" can become "సాయంత్రం 6 గంటలు". */
function teluguPmWord(hour: number) {
  if (hour === 12 || hour < 4) return "మధ్యాహ్నం";
  if (hour < 8) return "సాయంత్రం";
  return "రాత్రి";
}

/**
 * The Telugu voice reads any clock time ("7:30", "6:00") as a morning time,
 * saying "ఉదయం" itself. So "ఉదయం 7:30 గంటలకు" came out as "ఉదయం ఉదయం
 * ఏడున్నర గంటలకు", the evening "సాయంత్రం 6:00" as "సాయంత్రం ఉదయం 6", and
 * "గంటలకు" was said twice. Spelling the time out in words leaves it nothing to
 * reinterpret (verified 2026-10-14: the rewritten text takes exactly as long to
 * say as the time written fully in Telugu words, so nothing is added). Only what is read
 * aloud changes; the chat still shows "7:30". Hindi has its own version
 * (speakableHindi); the Kannada voice reads times as written without repeats.
 */
export function speakableTelugu(text: string) {
  return (
    text
      // An English am/pm after a time becomes the Telugu period word before it.
      .replace(/(\d{1,2}):(\d{2})\s*([AaPp])\.?\s*[Mm]\b\.?/g, (_, h: string, m: string, ap: string) =>
        `${ap.toLowerCase() === "a" ? "ఉదయం" : teluguPmWord(Number(h))} ${h}:${m}`,
      )
      // "ఉదయం ఉదయం" if the model already wrote the period word before the time.
      .replace(/(ఉదయం|మధ్యాహ్నం|సాయంత్రం|రాత్రి)\s+\1/g, "$1")
      // "at" a time: "7:30 గంటలకు" or "7:30 కి".
      .replace(/(\d{1,2}):30\s*(?:గంటలకు|కి)/g, (_, h: string) => `${teluguHalfPast(h)} గంటలకు`)
      .replace(/(\d{1,2}):30(?!\d)/g, (_, h: string) => `${teluguHalfPast(h)} గంటలు`)
      .replace(/(\d{1,2}):00\s*(?:గంటలకు|కి)/g, "$1 గంటలకు")
      .replace(/(\d{1,2}):(\d{2})\s*(?:గంటలకు|కి)/g, "$1 గంటల $2 నిమిషాలకు")
      .replace(/(\d{1,2}):00(?!\d)/g, "$1 గంటలు")
      .replace(/(\d{1,2}):(\d{2})(?!\d)/g, "$1 గంటల $2 నిమిషాలు")
  );
}

/** Hindi period-of-day word for an "x pm" hour, so "6:00 PM" can become "शाम 6 बजे". */
function hindiPmWord(hour: number) {
  if (hour === 12 || hour < 4) return "दोपहर";
  if (hour < 8) return "शाम";
  return "रात";
}

/** A clock time the way it's said in Hindi: 6 बजे, साढ़े 7 बजे, डेढ़/ढाई बजे, सवा/पौने. */
function hindiTime(h: string, m: string) {
  const hour = Number(h);
  if (m === "00") return `${hour} बजे`;
  if (m === "30") return hour % 12 === 1 ? "डेढ़ बजे" : hour % 12 === 2 ? "ढाई बजे" : `साढ़े ${hour} बजे`;
  if (m === "15") return `सवा ${hour} बजे`;
  if (m === "45") return `पौने ${(hour % 12) + 1} बजे`;
  return `${hour} बजकर ${Number(m)} मिनट`;
}

/**
 * The Hindi voice says "बजे" itself when it reads a clock time, so "शाम 6:00
 * बजे" came out as "शाम छह बजे बजे" (measured 2026-10-14: 1.50 s, the same as
 * that doubled phrase, against 1.22 s for "शाम 6 बजे"). Writing the time the
 * way people say it removes the repeat. Only what is read aloud changes.
 */
export function speakableHindi(text: string) {
  return (
    text
      // An English am/pm after a time becomes the Hindi period word before it.
      .replace(/(\d{1,2}):(\d{2})\s*([AaPp])\.?\s*[Mm]\b\.?/g, (_, h: string, m: string, ap: string) =>
        `${ap.toLowerCase() === "a" ? "सुबह" : hindiPmWord(Number(h))} ${h}:${m}`,
      )
      .replace(/(सुबह|दोपहर|शाम|रात)\s+\1/g, "$1")
      // The written "बजे" after a time is part of the spoken phrase now.
      .replace(/(\d{1,2}):(\d{2})(?:\s*बजे)?(?!\d)/g, (_, h: string, m: string) => hindiTime(h, m))
  );
}

export async function synthesizeSpeech(text: string): Promise<{ audioBase64: string; languageCode: string }> {
  const languageCode = detectSpeechLanguage(text);
  // Names written twice ("तरुण्या (Tarunya)") would be read twice.
  const plain = languageCode === "en-IN" ? text : dropBracketedEnglish(text);
  const spoken =
    languageCode === "te-IN" ? speakableTelugu(plain) : languageCode === "hi-IN" ? speakableHindi(plain) : plain;

  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text: spoken },
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
