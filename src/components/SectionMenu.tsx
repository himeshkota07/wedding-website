"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, X } from "lucide-react";
import { track } from "@vercel/analytics";
import { sectionLinks } from "@/components/Nav";
import { INTRO_DONE_EVENT, isIntroDone } from "@/components/IntroSequence";

type Section = { id: string; label: string };

/**
 * A floating "Menu" button, like a food app's menu jump: it sits above the
 * chat launcher and opens a short list of the invitation's sections, so a
 * guest can skip the long scroll and land straight on the one they want.
 * Only sections actually on the page are listed (Events can be empty).
 */
export default function SectionMenu() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Appear with the chat launcher, once the opening curtain has parted.
  useEffect(() => {
    function show() {
      setSections(
        sectionLinks
          .map((link) => ({ id: link.href.slice(1), label: link.label }))
          .filter((s) => s.id !== "top" && document.getElementById(s.id)),
      );
      setReady(true);
    }
    if (isIntroDone()) {
      show();
      return;
    }
    window.addEventListener(INTRO_DONE_EVENT, show);
    return () => window.removeEventListener(INTRO_DONE_EVENT, show);
  }, []);

  // The section under the top third of the screen is "where you are".
  function toggle() {
    if (!open) {
      const line = window.innerHeight / 3;
      let here: string | null = null;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) here = s.id;
      }
      setCurrent(here);
    }
    setOpen(!open);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function jumpTo(id: string) {
    setOpen(false);
    track("Section menu", { section: id });
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  if (sections.length < 2) return null;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu-scrim"
            aria-hidden
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-30 bg-ink/25"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="menu-panel"
            id="section-menu"
            aria-label="Jump to a section"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-[9.25rem] right-4 z-30 w-60 overflow-hidden rounded-2xl bg-ink py-2 text-paper shadow-2xl sm:bottom-[9.5rem] sm:right-5"
          >
            <ul>
              {sections.map((s) => {
                const here = s.id === current;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(s.id)}
                      aria-current={here ? "location" : undefined}
                      className={`flex w-full items-center justify-between px-5 py-3 text-left text-lg transition-colors hover:bg-paper/10 ${
                        here ? "font-semibold text-turmeric" : ""
                      }`}
                    >
                      {s.label}
                      {here && <span className="h-2 w-2 rounded-full bg-turmeric" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && (
          <motion.button
            key="menu-button"
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="section-menu"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className="fixed bottom-[5.25rem] right-4 z-30 flex h-12 items-center gap-2 rounded-full bg-ink pl-4 pr-5 text-base font-semibold uppercase tracking-wide text-paper shadow-lg ring-2 ring-paper transition-colors hover:bg-teak sm:bottom-[5.5rem] sm:right-5"
          >
            {open ? <X size={18} /> : <BookOpen size={18} />}
            {open ? "Close" : "Menu"}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
