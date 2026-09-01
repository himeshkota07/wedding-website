import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { synthesizeSpeech } from "@/lib/google-speech";

export const maxDuration = 30;

const MAX_TEXT_LENGTH = 1000;

export async function POST(request: NextRequest) {
  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Text is too long" }, { status: 400 });
  }

  try {
    const { audioBase64, languageCode } = await synthesizeSpeech(text);
    return NextResponse.json({ audio: audioBase64, languageCode });
  } catch (error) {
    console.error("[voice/speak] failed:", error);
    return NextResponse.json({ error: "Speech synthesis failed" }, { status: 502 });
  }
}
