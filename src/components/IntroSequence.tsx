"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// Seal fades in (0-0.5s), curtain parts (1.3-2.4s), then the seal flies to
// the nav (2.1-2.85s) and the overlay hands over to the page.
const FLY_AT_MS = 2100;
const FLY_DURATION_S = 0.75;
const AUTO_DISMISS_MS = 2950;
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

type Flight = { x: number; y: number; scale: number };

/** Where the seal must travel to sit exactly on the nav's logo, or null if there's no nav logo to land on. */
function flightToNavLogo(seal: HTMLElement): Flight | null {
  const target = document.getElementById("site-logo")?.getBoundingClientRect();
  if (!target || target.height === 0) return null;
  const from = seal.getBoundingClientRect();
  return {
    x: target.left + target.width / 2 - (from.left + from.width / 2),
    y: target.top + target.height / 2 - (from.top + from.height / 2),
    scale: target.height / from.height,
  };
}

/**
 * The opening: a curtain of marigold strings with the couple's wax seal at
 * its centre. The curtain parts, then the seal flies up into its place at
 * the top left of the nav, and the page (and the chat) take over.
 */
export default function IntroSequence({ brideName, groomName }: { brideName: string; groomName: string }) {
  // Plays on every visit, as the lead-in to the chat that opens after it.
  // Rendered from the server too, so the page never flashes before the curtain.
  const [visible, setVisible] = useState(true);
  const [flight, setFlight] = useState<Flight | null>(null);
  const sealRef = useRef<HTMLDivElement>(null);
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
      // Reset here, not when the intro ends: clearing it then would pull the
      // seal back to the centre while the overlay fades out.
      setFlight(null);
      setVisible(true);
    }
    window.addEventListener("replay-intro", onReplay);
    return () => window.removeEventListener("replay-intro", onReplay);
  }, []);

  useEffect(() => {
    if (!visible) return;
    // The nav's own logo hides while the intro plays (see globals.css), so the
    // flying seal is the only one on screen until it lands.
    document.documentElement.dataset.introPlaying = "1";
    const flyTimer = setTimeout(() => {
      if (sealRef.current) setFlight(flightToNavLogo(sealRef.current));
    }, FLY_AT_MS);
    const dismissTimer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => {
      clearTimeout(flyTimer);
      clearTimeout(dismissTimer);
      delete document.documentElement.dataset.introPlaying;
    };
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

          {/* Centred by the wrapper so the seal's own transform is free for the flight. */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <motion.div
              ref={sealRef}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={flight ? { x: flight.x, y: flight.y, scale: flight.scale, opacity: 1 } : { x: 0, y: 0, scale: 1, opacity: 1 }}
              transition={flight ? { duration: FLY_DURATION_S, ease: [0.65, 0, 0.35, 1] } : { duration: 0.5, ease: "easeOut" }}
              style={{ transformOrigin: "center" }}
            >
              <Image
                src="/theme/logo-seal.png"
                alt={`${brideName} & ${groomName}`}
                width={508}
                height={640}
                preload
                sizes="(min-width: 640px) 320px, 240px"
                className="h-[min(50svh,18rem)] w-auto drop-shadow-[0_12px_24px_rgb(0_0_0/0.45)] sm:h-[min(55svh,22rem)]"
              />
            </motion.div>
          </div>

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
