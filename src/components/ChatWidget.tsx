"use client";

import { useRef, useState, useEffect } from "react";
import { Mic, Square, Volume2, Pause, Send } from "lucide-react";

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
    <div className="flex flex-col">
      <div ref={listRef} className="max-h-[min(24rem,55svh)] min-h-56 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[85%] items-start gap-2 px-3.5 py-2.5 text-base leading-snug ${
                m.role === "user" ? "rounded-2xl rounded-br-sm bg-kumkum text-paper" : "rounded-2xl rounded-bl-sm bg-paper-deep text-ink"
              }`}
            >
              <span>{m.text}</span>
              {m.role === "model" && (
                <button
                  type="button"
                  onClick={() => playMessage(i, m.text)}
                  aria-label={speakingIndex === i ? "Stop playback" : "Listen to this message"}
                  className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center text-ink-soft transition-colors hover:text-kumkum"
                >
                  {speakingIndex === i ? <Pause size={14} /> : <Volume2 size={14} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-paper-deep px-3.5 py-2.5 text-base text-ink-soft">Thinking…</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-hairline px-3 pt-3 text-sm text-ink-soft">
        <span className="mr-1">Speak in:</span>
        {VOICE_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setVoiceLanguage(lang.code)}
            disabled={recording || micBusy}
            aria-pressed={voiceLanguage === lang.code}
            className={`h-8 rounded-full px-3 transition-colors disabled:opacity-50 ${
              voiceLanguage === lang.code ? "bg-leaf text-paper" : "border border-brass/60 text-ink hover:border-leaf"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {voiceError && (
        <p role="alert" className="px-3 pt-2 text-sm text-kumkum">
          {voiceError}
        </p>
      )}
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
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
            recording ? "animate-pulse border-kumkum bg-kumkum text-paper" : "border-brass/70 text-ink hover:border-kumkum hover:text-kumkum"
          }`}
        >
          {micBusy ? "…" : recording ? <Square size={16} /> : <Mic size={16} />}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          disabled={pending}
          aria-label="Your question"
          className="h-11 min-w-0 flex-1 rounded-full border border-brass/70 bg-paper px-4 text-base text-ink placeholder:text-ink-soft/80 focus:border-kumkum focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kumkum text-paper transition-colors hover:bg-kumkum-deep disabled:bg-kumkum/40"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
