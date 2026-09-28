"use client";

import { MessageCircle } from "lucide-react";

export default function OpenChatButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("open-chat"))} className={className}>
      <MessageCircle size={18} />
      {children}
    </button>
  );
}
