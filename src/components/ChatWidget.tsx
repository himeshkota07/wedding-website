"use client";

import { useRef, useState, useEffect } from "react";
import { Mic, Square, Volume2, Pause, Send } from "lucide-react";
import { useVoiceRecorder } from "@/lib/use-voice-recorder";
import { inviteCodeFromPath } from "@/lib/invite-path";

type Message = { role: "user" | "model"; text: string };
// Answer in the mode the question was asked in: typed in, text out; spoken in, spoken out.
type AskMode = "text" | "voice";

// A zero-length WAV, played on the mic tap purely to unlock audio (see unlockAudio).
const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

// Starter questions for guests who don't know what to ask. Sent as typed, so
// the bot answers in English unless the guest switches language themselves.
const SUGGESTIONS = ["When is the muhurtham?", "Which events are there?", "Where is the venue?", "Whom can I call for help?"];

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Namaskaram! Ask me anything about the events, venues or travel. Type or tap the mic and just speak, in English, Telugu, Kannada or Hindi.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  // A spoken question is answered aloud (see send). Starting a recording also
  // unlocks the audio player inside that tap and stops any answer still playing.
  const {
    recording,
    transcribing,
    error: recorderError,
    toggle: toggleRecording,
  } = useVoiceRecorder({
    onStart: () => {
      setVoiceError(null);
      unlockAudio();
    },
    onText: (text) => send(text, "voice"),
  });

  const listRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  // One reusable player. iOS Safari only lets audio play from a user gesture,
  // and a spoken answer arrives seconds after the tap (transcribe, then chat,
  // then synthesise), so the player is unlocked during the mic tap itself and
  // reused for the answer; a fresh Audio() at that point would be blocked.
  function getPlayer() {
    audioPlayerRef.current ??= new Audio();
    return audioPlayerRef.current;
  }

  function unlockAudio() {
    const player = getPlayer();
    player.src = SILENT_WAV;
    player.play().catch(() => {});
    setSpeakingIndex(null);
  }

  async function send(text: string, mode: AskMode = "text") {
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
          // The chatbot only knows the events this invitation link shows.
          invite: inviteCodeFromPath(window.location.pathname),
        }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
      if (mode === "voice") playMessage(nextMessages.length, reply);
    } catch {
      setMessages((prev) => [...prev, { role: "model", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setPending(false);
    }
  }

  async function playMessage(index: number, text: string) {
    const player = getPlayer();
    if (speakingIndex === index) {
      player.pause();
      setSpeakingIndex(null);
      return;
    }

    setSpeakingIndex(index);
    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Links (the WhatsApp escalation) are for reading, not hearing spelled out.
        body: JSON.stringify({ text: text.replace(/https?:\/\/\S+/g, "").trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.audio) {
        setVoiceError("Couldn't play audio for that message.");
        setSpeakingIndex(null);
        return;
      }
      player.src = `data:audio/mp3;base64,${data.audio}`;
      player.onended = () => setSpeakingIndex(null);
      player.onerror = () => setSpeakingIndex(null);
      await player.play();
    } catch (error) {
      // AbortError just means another clip (or the mic's unlock) took over the player.
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setVoiceError("Couldn't play audio for that message.");
      }
      setSpeakingIndex((current) => (current === index ? null : current));
    }
  }

  const micBusy = transcribing;
  const shownError = recorderError ?? voiceError;
  const showSuggestions = messages.length === 1 && !pending;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[85%] items-start gap-2 px-4 py-3 text-lg leading-snug ${
                m.role === "user" ? "rounded-2xl rounded-br-sm bg-kumkum text-paper" : "rounded-2xl rounded-bl-sm bg-paper-deep text-ink"
              }`}
            >
              <span className="whitespace-pre-line">{m.text}</span>
              {m.role === "model" && (
                <button
                  type="button"
                  onClick={() => playMessage(i, m.text)}
                  aria-label={speakingIndex === i ? "Stop playback" : "Listen to this message"}
                  className="-m-1.5 flex h-9 w-9 shrink-0 items-center justify-center text-ink-soft transition-colors hover:text-kumkum"
                >
                  {speakingIndex === i ? <Pause size={16} /> : <Volume2 size={16} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {showSuggestions && (
          <ul aria-label="Suggested questions" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-1 [scrollbar-width:none] sm:-mx-5 sm:px-5">
            {SUGGESTIONS.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => send(q)}
                  className="whitespace-nowrap rounded-full border border-brass bg-paper px-4 py-2 text-base text-ink transition-colors hover:border-kumkum hover:text-kumkum"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        )}
        {pending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-paper-deep px-4 py-3 text-lg text-ink-soft">Thinking…</div>
          </div>
        )}
      </div>

      <div className="border-t border-hairline">
        {(recording || transcribing || shownError) && (
          <p role={shownError ? "alert" : "status"} className={`px-4 pt-3 text-base ${shownError ? "text-kumkum" : "text-ink-soft"}`}>
            {shownError ?? (recording ? "Listening… tap the square when you're done." : "Understanding what you said…")}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2 p-3 sm:p-4"
        >
          <button
            type="button"
            onClick={toggleRecording}
            disabled={pending || micBusy}
            aria-label={recording ? "Stop recording" : "Ask by voice"}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
              recording ? "animate-pulse border-kumkum bg-kumkum text-paper" : "border-brass text-ink hover:border-kumkum hover:text-kumkum"
            }`}
          >
            {micBusy ? "…" : recording ? <Square size={18} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            disabled={pending}
            aria-label="Your question"
            className="h-12 min-w-0 flex-1 rounded-full border border-brass bg-paper px-4 text-lg text-ink placeholder:text-ink-soft/80 focus:border-kumkum focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Send"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kumkum text-paper transition-colors hover:bg-kumkum-deep disabled:bg-kumkum/40"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
