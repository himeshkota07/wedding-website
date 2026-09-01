"use client";

import { useState } from "react";
import ChatWidget from "@/components/ChatWidget";

export default function FloatingChat() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        className="fixed bottom-4 left-1/2 z-30 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white shadow-lg hover:brightness-105"
      >
        <span className="text-lg">💬</span>
        Ask us anything
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[min(24rem,92vw)] -translate-x-1/2">
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-black/10 bg-accent px-4 py-2.5 text-white shadow-lg">
        <span className="text-sm font-semibold">Ask us anything</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Minimize chat"
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:bg-white/15"
        >
          &minus;
        </button>
      </div>
      <div className="overflow-hidden rounded-b-lg border border-black/10 bg-white shadow-lg">
        <ChatWidget />
      </div>
    </div>
  );
}
