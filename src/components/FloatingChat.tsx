"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageCircle, Minus } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

export default function FloatingChat() {
  const [open, setOpen] = useState(true);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="wait">
      {open ? (
        <motion.div
          key="panel"
          initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 z-30 w-[min(24rem,92vw)] -translate-x-1/2"
        >
          <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-hairline/60 bg-accent px-4 py-2.5 text-white shadow-lg">
            <span className="font-display text-sm font-semibold">Ask us anything</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Minimize chat"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:bg-white/15"
            >
              <Minus size={16} />
            </button>
          </div>
          <div className="overflow-hidden rounded-b-lg border border-hairline/60 bg-[#fffaf3] shadow-lg">
            <ChatWidget />
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="launcher"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 z-30 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white shadow-lg hover:brightness-105"
        >
          <MessageCircle size={18} />
          Ask us anything
        </motion.button>
      )}
    </AnimatePresence>
  );
}
