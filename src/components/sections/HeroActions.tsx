"use client";

import { ArrowDown, MessageCircle, RotateCcw } from "lucide-react";

export default function HeroActions() {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="#events"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-kumkum px-6 text-base font-semibold text-paper transition-colors hover:bg-kumkum-deep"
        >
          See the functions
          <ArrowDown size={18} />
        </a>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("open-chat"))}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/25 px-5 text-base font-medium text-ink transition-colors hover:border-kumkum hover:text-kumkum"
        >
          <MessageCircle size={18} />
          Ask us anything
        </button>
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("replay-intro"))}
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink-soft underline-offset-4 transition-colors hover:text-kumkum hover:underline"
      >
        <RotateCcw size={14} />
        Watch the opening again
      </button>
    </div>
  );
}
