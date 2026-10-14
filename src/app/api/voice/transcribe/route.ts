import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { transcribeWithGemini } from "@/lib/gemini";
import { transcribeAudio } from "@/lib/google-speech";

export const maxDuration = 30;

const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // ~8MB, generous for a short voice question

// What browsers' MediaRecorder produces: WebM/Opus almost everywhere, MP4/AAC
// on older Safari. Codec parameters are stripped before this check.
const ACCEPTED_MIME_TYPES = ["audio/webm", "audio/mp4"];

export async function POST(request: NextRequest) {
  let body: { audio?: unknown; mimeType?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const audio = typeof body.audio === "string" ? body.audio : "";
  if (!audio) {
    return NextResponse.json({ error: "Audio is required" }, { status: 400 });
  }
  if (audio.length > MAX_AUDIO_BYTES * 1.4) {
    // base64 is ~33% larger than raw bytes
    return NextResponse.json({ error: "Audio is too long" }, { status: 400 });
  }

  const requestedType = typeof body.mimeType === "string" ? body.mimeType.split(";")[0].trim() : "";
  const mimeType = ACCEPTED_MIME_TYPES.includes(requestedType) ? requestedType : "audio/webm";

  // The guest just speaks; the language (English, Telugu, Kannada or Hindi) is
  // detected from the audio rather than picked in the UI.
  let text = "";
  try {
    ({ text } = await transcribeWithGemini(audio, mimeType));
  } catch (geminiError) {
    console.warn("[voice/transcribe] Gemini failed, falling back to Speech-to-Text:", geminiError);
    if (mimeType !== "audio/webm") {
      return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
    }
    try {
      text = await transcribeAudio(audio);
    } catch (error) {
      console.error("[voice/transcribe] failed:", error);
      return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
    }
  }

  if (!text) {
    return NextResponse.json({ error: "Couldn't make out what you said" }, { status: 422 });
  }
  return NextResponse.json({ text });
}
