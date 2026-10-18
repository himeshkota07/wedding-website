"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-black/20 px-2.5 py-1 text-sm font-medium text-zinc-700 hover:border-accent hover:text-accent"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
