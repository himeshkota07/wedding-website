import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { transcribeAudio } from "@/lib/google-speech";

export const maxDuration = 30;

const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // ~8MB, generous for a short voice question

export async function POST(request: NextRequest) {
  let body: { audio?: unknown };
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

  try {
    const text = await transcribeAudio(audio);
    if (!text) {
      return NextResponse.json({ error: "Couldn't make out what you said" }, { status: 422 });
    }
    return NextResponse.json({ text });
  } catch (error) {
    console.error("[voice/transcribe] failed:", error);
    return NextResponse.json(
      { error: "Transcription failed", debugError: error instanceof Error ? error.message : String(error) },
      { status: 502 },
    );
  }
}
