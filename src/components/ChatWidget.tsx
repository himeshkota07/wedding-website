"use client";

import { useRef, useState, useEffect } from "react";

type Message = { role: "user" | "model"; text: string };
type SpeechLanguageCode = "en-IN" | "te-IN" | "kn-IN";

const RECORDING_MIME_TYPE = "audio/webm;codecs=opus";

const VOICE_LANGUAGES: { code: SpeechLanguageCode; label: string }[] = [
  { code: "en-IN", label: "English" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
];

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

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hi! Ask me anything about the events, venues, or logistics — in English, Telugu, or Kannada." },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<SpeechLanguageCode>("en-IN");

  const listRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    if (!text.trim() || pending) return;

    const nextMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(0, -1).slice(-6),
        }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "model", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setPending(false);
    }
  }

  async function toggleRecording() {
    setVoiceError(null);

    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    if (!MediaRecorder.isTypeSupported?.(RECORDING_MIME_TYPE)) {
      setVoiceError("Voice input isn't supported in this browser — please type your question instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: RECORDING_MIME_TYPE });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: RECORDING_MIME_TYPE });
        setTranscribing(true);
        try {
          const base64 = await blobToBase64(blob);
          const res = await fetch("/api/voice/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64, languageCode: voiceLanguage }),
          });
          const data = await res.json();
          if (res.ok && data.text) {
            send(data.text);
          } else {
            setVoiceError(data.error ?? "Couldn't make out what you said, please try again.");
          }
        } catch {
          setVoiceError("Voice transcription failed. Please try again or type instead.");
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setVoiceError("Couldn't access your microphone. Please check permissions, or type instead.");
    }
  }

  async function playMessage(index: number, text: string) {
    if (speakingIndex === index) {
      audioPlayerRef.current?.pause();
      setSpeakingIndex(null);
      return;
    }

    setSpeakingIndex(index);
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || !data.audio) {
        setVoiceError("Couldn't play audio for that message.");
        setSpeakingIndex(null);
        return;
      }
      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      audioPlayerRef.current = audio;
      audio.onended = () => setSpeakingIndex(null);
      audio.onerror = () => setSpeakingIndex(null);
      await audio.play();
    } catch {
      setVoiceError("Couldn't play audio for that message.");
      setSpeakingIndex(null);
    }
  }

  const micBusy = transcribing;

  return (
    <div className="rounded-lg border border-black/10 bg-white shadow-sm">
      <div ref={listRef} className="max-h-96 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[80%] items-start gap-1.5 rounded-lg px-3 py-2 text-sm ${
                m.role === "user" ? "bg-accent text-white" : "bg-accent-soft/60 text-zinc-800"
              }`}
            >
              <span>{m.text}</span>
              {m.role === "model" && (
                <button
                  type="button"
                  onClick={() => playMessage(i, m.text)}
                  aria-label={speakingIndex === i ? "Stop playback" : "Listen to this message"}
                  className="shrink-0 text-zinc-500 hover:text-accent"
                >
                  {speakingIndex === i ? "⏸" : "🔊"}
                </button>
              )}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-accent-soft/60 px-3 py-2 text-sm text-zinc-500">Thinking…</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-black/10 px-3 pt-2 text-xs text-zinc-500">
        <span>Voice language:</span>
        {VOICE_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setVoiceLanguage(lang.code)}
            disabled={recording || micBusy}
            className={`rounded-full px-2 py-0.5 disabled:opacity-50 ${
              voiceLanguage === lang.code ? "bg-accent text-white" : "border border-black/20 text-zinc-600"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {voiceError && <p className="px-3 pt-2 text-xs text-red-600">{voiceError}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 p-3"
      >
        <button
          type="button"
          onClick={toggleRecording}
          disabled={pending || micBusy}
          aria-label={recording ? "Stop recording" : "Ask by voice"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm disabled:opacity-50 ${
            recording ? "animate-pulse border-red-400 bg-red-50 text-red-600" : "border-black/20 text-zinc-600"
          }`}
        >
          {micBusy ? "…" : recording ? "⏹" : "🎤"}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={pending}
          className="flex-1 rounded-md border border-black/20 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
