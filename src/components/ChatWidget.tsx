"use client";

import { useRef, useState, useEffect } from "react";

type Message = { role: "user" | "model"; text: string };

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hi! Ask me anything about the events, venues, or logistics — in English, Telugu, or Kannada." },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;

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

  return (
    <div className="rounded-lg border border-black/10 bg-white shadow-sm">
      <div ref={listRef} className="max-h-96 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user" ? "bg-accent text-white" : "bg-accent-soft/60 text-zinc-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-accent-soft/60 px-3 py-2 text-sm text-zinc-500">Thinking…</div>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t border-black/10 p-3"
      >
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
