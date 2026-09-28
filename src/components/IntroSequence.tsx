"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import PuppetSilhouette from "@/components/ui/PuppetSilhouette";

const STORAGE_KEY = "wedding-intro-seen";
const AUTO_DISMISS_MS = 2700;

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private browsing / storage disabled -- the intro will just replay next visit, harmless.
  }
}

export default function IntroSequence() {
  // Combined into one state object so the mount-check effect below only
  // needs a single setState call.
  const [{ mounted, visible }, setState] = useState({ mounted: false, visible: false });
  const reduceMotion = useReducedMotion();

  const dismiss = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
    markSeen();
  }, []);

  // Decide whether to show the intro only after mount -- localStorage isn't
  // available during SSR, and reading it during render would risk a
  // hydration mismatch. This one-time client-only check can't be computed
  // during render, so it has to live in an effect.
  useEffect(() => {
    if (reduceMotion) {
      markSeen();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only localStorage check, see comment above
      setState({ mounted: true, visible: false });
      return;
    }
    let seen = false;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }
    setState({ mounted: true, visible: !seen });
  }, [reduceMotion]);

  // Lets the Hero's "Watch the opening again" button re-trigger this
  // independently of the first-visit check, without prop-drilling between
  // two sibling components in page.tsx.
  useEffect(() => {
    function onReplay() {
      setState((s) => ({ ...s, visible: true }));
    }
    window.addEventListener("replay-intro", onReplay);
    return () => window.removeEventListener("replay-intro", onReplay);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, dismiss]);

  if (!mounted || reduceMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-5 top-5 text-sm text-foreground/50 transition-colors hover:text-accent-deep"
          >
            Skip
          </button>

          <div className="flex items-center justify-center gap-4 sm:gap-14">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <PuppetSilhouette size={110} />
            </motion.div>

            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--accent-deep)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.1, ease: "easeInOut" }}
                />
                <motion.line
                  x1="50"
                  y1="4"
                  x2="50"
                  y2="12"
                  stroke="var(--accent-deep)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                />
                <motion.line
                  x1="50"
                  y1="88"
                  x2="50"
                  y2="96"
                  stroke="var(--accent-deep)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                />
              </svg>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="font-script text-2xl italic text-accent-deep sm:text-3xl"
              >
                T &amp; A
              </motion.span>
            </div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <PuppetSilhouette size={110} flip />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
