"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, MessageCircle } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import { INTRO_DONE_EVENT, isIntroDone } from "@/components/IntroSequence";

/**
 * The chat is the site's front door: it opens by itself as soon as the
 * opening curtain has parted, as a sheet over the bottom ~60% of a phone
 * (a panel at the bottom right on desktop) with the invitation still in
 * view above and around it. Minimising it hands the page back. It stays mounted while minimised so the conversation survives.
 */
export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  // The launcher waits for the intro too, so it doesn't flash up and vanish as the chat opens.
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const autoOpened = useRef(false);

  // Minimising lasts only for this page view: every load opens the chat
  // again. (Remembering it per session made it look broken on phones, where
  // one tab lives for days and the chat then never came back.)
  const minimise = useCallback(() => setOpen(false), []);

  const openChat = useCallback(() => {
    setOpen(true);
    // Focus the question box when the guest asks for the chat themselves;
    // the automatic open skips this so phones don't throw up the keyboard.
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLInputElement>("input")?.focus());
  }, []);

  // Open once per page load, after the intro curtain (or straight away when there isn't one).
  useEffect(() => {
    function autoOpen() {
      if (autoOpened.current) return;
      autoOpened.current = true;
      setReady(true);
      setOpen(true);
    }
    if (isIntroDone()) {
      autoOpen();
      return;
    }
    window.addEventListener(INTRO_DONE_EVENT, autoOpen);
    return () => window.removeEventListener(INTRO_DONE_EVENT, autoOpen);
  }, []);

  // Phones often restore a page from the back/forward cache exactly as it was
  // left, minimised chat included, with no fresh load to re-open it.
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setOpen(true);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // Any "Ask us anything" button on the page opens it through this event.
  useEffect(() => {
    window.addEventListener("open-chat", openChat);
    return () => window.removeEventListener("open-chat", openChat);
  }, [openChat]);

  // While open it's a modal: Escape minimises it and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") minimise();
    }
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open, minimise]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            aria-hidden
            onClick={minimise}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-40 bg-ink/15"
          />
        )}
      </AnimatePresence>

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label="Ask us anything"
        inert={!open}
        initial={false}
        animate={
          open
            ? { opacity: 1, y: 0, scale: 1, visibility: "visible" }
            : { opacity: 0, y: reduceMotion ? 0 : 24, scale: reduceMotion ? 1 : 0.98, transitionEnd: { visibility: "hidden" } }
        }
        transition={{ duration: reduceMotion ? 0 : 0.3, ease }}
        style={{ visibility: "hidden" }}
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex h-[60dvh] max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-3xl bg-paper shadow-2xl ring-1 ring-ink/10 sm:left-auto sm:right-5 sm:bottom-5 sm:h-[min(40rem,70dvh)] sm:w-[26rem]"
      >
        <div className="flex items-center justify-between gap-3 bg-leaf py-3 pl-5 pr-3 text-paper">
          <div className="min-w-0">
            <p className="font-display text-xl leading-tight">Ask us anything</p>
            <p className="text-base text-paper/80">
              English · <span lang="te">తెలుగు</span> · <span lang="kn">ಕನ್ನಡ</span>
            </p>
          </div>
          <button
            type="button"
            onClick={minimise}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-paper/40 pl-4 pr-3 text-base font-medium text-paper transition-colors hover:bg-paper/10"
          >
            See invitation
            <ChevronDown size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <ChatWidget />
        </div>
      </motion.div>

      <AnimatePresence>
        {ready && !open && (
          <motion.button
            key="launcher"
            type="button"
            onClick={openChat}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-kumkum pl-5 pr-6 text-lg font-semibold text-paper shadow-lg ring-2 ring-paper transition-colors hover:bg-kumkum-deep sm:bottom-5 sm:right-5"
          >
            <MessageCircle size={22} />
            Ask us anything
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
