"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const AUTO_DISMISS_MS = 2600;
const STRINGS_PER_SIDE = 18;

/** Fired once the curtain has parted (or was skipped), so the chat can open without hiding behind it. */
export const INTRO_DONE_EVENT = "intro-done";

// Also recorded on <html> for listeners that mount after the event has fired.
export function isIntroDone() {
  return document.documentElement.dataset.introDone === "1";
}

function signalIntroDone() {
  document.documentElement.dataset.introDone = "1";
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

/** One hanging string of marigolds, alternating orange and yellow heads with a leaf between. */
function MarigoldString({ index }: { index: number }) {
  const id = useId();
  const shift = (index * 23) % 68;
  const first = index % 3 === 1 ? "var(--turmeric)" : "var(--marigold)";
  const second = index % 3 === 1 ? "var(--marigold)" : index % 3 === 2 ? "var(--kumkum)" : "var(--turmeric)";
  return (
    <svg aria-hidden className="h-full w-11 shrink-0" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="44" height="68" patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${shift})`}>
          <line x1="22" y1="0" x2="22" y2="68" stroke="var(--brass)" strokeWidth="1" />
          <circle cx="22" cy="17" r="14" fill={first} />
          <circle cx="22" cy="17" r="8.5" fill="#f7cf57" />
          <circle cx="22" cy="17" r="3.5" fill="var(--turmeric-deep)" />
          <path d="M22,33 C28,31 33,34 35,39 C29,40 24,38 22,33 Z" fill="var(--leaf)" />
          <circle cx="22" cy="51" r="13" fill={second} />
          <circle cx="22" cy="51" r="7.5" fill="var(--marigold)" />
          <circle cx="22" cy="51" r="3" fill="var(--turmeric)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function CurtainHalf({ side }: { side: "left" | "right" }) {
  return (
    <motion.div
      className={`absolute inset-y-0 flex w-1/2 overflow-hidden ${side === "left" ? "left-0 justify-end" : "right-0 justify-start"}`}
      initial={{ x: 0 }}
      animate={{ x: side === "left" ? "-102%" : "102%" }}
      transition={{ duration: 1.1, delay: 1.3, ease: [0.65, 0, 0.35, 1] }}
    >
      {Array.from({ length: STRINGS_PER_SIDE }, (_, i) => (
        <MarigoldString key={i} index={side === "left" ? i : i + STRINGS_PER_SIDE} />
      ))}
    </motion.div>
  );
}

/**
 * The opening: a curtain of marigold strings across the mandapam's entrance,
 * with the couple's names at its centre, parting to let the guest in.
 */
export default function IntroSequence({ brideName, groomName }: { brideName: string; groomName: string }) {
  // Plays on every visit, as the lead-in to the chat that opens after it.
  // Rendered from the server too, so the page never flashes before the curtain.
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  const dismiss = useCallback(() => {
    setVisible(false);
    signalIntroDone();
  }, []);

  // Guests who've asked for reduced motion skip it (CSS hides it before hydration, see motion-reduce below).
  useEffect(() => {
    if (!reduceMotion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced-motion preference is only known on the client
    setVisible(false);
    signalIntroDone();
  }, [reduceMotion]);

  // The Hero's "Watch the opening again" button re-triggers this.
  useEffect(() => {
    function onReplay() {
      setVisible(true);
    }
    window.addEventListener("replay-intro", onReplay);
    return () => window.removeEventListener("replay-intro", onReplay);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, dismiss]);

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden"
          onClick={dismiss}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-teak"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
          />
          <CurtainHalf side="left" />
          <CurtainHalf side="right" />

          <motion.div
            className="absolute left-1/2 top-1/2 z-10 flex h-64 w-64 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-paper text-center ring-[6px] ring-brass sm:h-72 sm:w-72"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [0.85, 1, 1, 1.04], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.6, times: [0, 0.3, 0.8, 1], ease: "easeOut" }}
          >
            <span className="font-script text-4xl leading-tight text-ink sm:text-5xl">{brideName}</span>
            <span className="font-script text-2xl text-kumkum">&amp;</span>
            <span className="font-script text-4xl leading-tight text-ink sm:text-5xl">{groomName}</span>
          </motion.div>

          <button
            type="button"
            onClick={dismiss}
            className="absolute right-4 top-4 rounded-full bg-teak/80 px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-teak"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
