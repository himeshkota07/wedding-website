"use client";

import { useEffect, useRef, useState } from "react";

// WebM/Opus almost everywhere; MP4 for older Safari, which can't record WebM.
const RECORDING_MIME_TYPES = ["audio/webm;codecs=opus", "audio/mp4"];

function pickRecordingMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  return RECORDING_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported?.(type)) ?? null;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

type Options = {
  /** Called with the transcript once the guest stops recording. The language is detected server-side. */
  onText: (text: string) => void;
  /** Runs synchronously inside the tap that starts recording (e.g. to unlock audio playback on iOS). */
  onStart?: () => void;
};

/**
 * Tap-to-record, tap-to-stop voice input, transcribed by /api/voice/transcribe
 * (English, Telugu, Kannada or Hindi, auto-detected). Shared by the chat and the
 * wishes form. The callbacks are read through a ref, so the transcript always
 * reaches the latest render's handlers rather than the ones from when
 * recording began.
 */
export function useVoiceRecorder(options: Options) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  async function toggle() {
    setError(null);

    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }

    optionsRef.current.onStart?.();

    const mimeType = pickRecordingMimeType();
    if (!mimeType) {
      setError("Voice input isn't supported in this browser — please type instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setTranscribing(true);
        try {
          const res = await fetch("/api/voice/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: await blobToBase64(blob), mimeType }),
          });
          const data = await res.json();
          if (res.ok && data.text) {
            optionsRef.current.onText(data.text);
          } else {
            setError(data.error ?? "Couldn't make out what you said, please try again.");
          }
        } catch {
          setError("Voice transcription failed. Please try again or type instead.");
        } finally {
          setTranscribing(false);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("Couldn't access your microphone. Please check permissions, or type instead.");
    }
  }

  return { recording, transcribing, error, setError, toggle };
}
