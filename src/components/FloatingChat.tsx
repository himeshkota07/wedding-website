"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

export default function FloatingChat() {
  // Starts closed so it never covers the invitation; any "Ask us anything"
  // button on the page opens it through the "open-chat" event.
  const [open, setOpen] = useState(false);
  // The hero carries its own "Ask us anything" button, so the floating
  // launcher waits until the hero has scrolled away.
  const [heroInView, setHeroInView] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("open-chat", onOpen);
    return () => window.removeEventListener("open-chat", onOpen);
  }, []);

  useEffect(() => {
    const hero = document.getElementById("top");
    // Shown by default; hidden only once the observer confirms the hero is on screen.
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      rootMargin: "0px 0px -35% 0px",
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence initial={false} mode="wait">
      {open ? (
        <motion.div
          key="panel"
          role="dialog"
          aria-label="Ask us anything"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 overflow-hidden border-2 border-teak bg-paper outline outline-2 outline-offset-2 outline-brass sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[25rem]"
        >
          <div className="flex items-center justify-between bg-teak px-5 py-3 text-paper">
            <div>
              <p className="font-display text-xl">Ask us anything</p>
              <p className="text-sm text-paper/75">
                English · <span lang="te">తెలుగు</span> · <span lang="kn">ಕನ್ನಡ</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-11 w-11 items-center justify-center rounded-full text-paper/90 transition-colors hover:bg-paper/10"
            >
              <X size={20} />
            </button>
          </div>
          <ChatWidget />
        </motion.div>
      ) : heroInView ? null : (
        <motion.button
          key="launcher"
          type="button"
          onClick={() => setOpen(true)}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-kumkum pl-5 pr-6 text-base font-semibold text-paper ring-2 ring-paper transition-colors hover:bg-kumkum-deep sm:bottom-5 sm:right-5"
        >
          <MessageCircle size={20} />
          Ask us anything
        </motion.button>
      )}
    </AnimatePresence>
  );
}
