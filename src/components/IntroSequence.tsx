"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// The seal fades in over the Haldi scene (0-0.5s) and rests there; then the
// scene dissolves into the page while the seal flies to the nav
// (2.4-3.2s), and the overlay hands over.
const FLY_AT_MS = 2400;
const FLY_DURATION_S = 0.8;
const AUTO_DISMISS_MS = 3300;

/** Fired once the curtain has parted (or was skipped), so the chat can open without hiding behind it. */
export const INTRO_DONE_EVENT = "intro-done";

/**
 * Fired, from inside the tap itself, when the guest taps the opening (which
 * also skips it). Browsers only allow sound from inside a tap, so the music
 * uses it to unlock the player before it starts.
 */
export const INTRO_TAP_EVENT = "intro-tap";

function signalIntroTap() {
  window.dispatchEvent(new Event(INTRO_TAP_EVENT));
}

// Also recorded on <html> for listeners that mount after the event has fired.
export function isIntroDone() {
  return document.documentElement.dataset.introDone === "1";
}

function signalIntroDone() {
  document.documentElement.dataset.introDone = "1";
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
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
 * The opening: the couple's Haldi illustration with their wax seal resting at
 * the centre. The scene dissolves into the page as the seal flies up into its
 * place at the top left of the nav, and the page (and the chat) take over.
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

  /** A tap on the picture or on Skip: straight to the page, and the music starts with it. */
  const skip = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      signalIntroTap();
      dismiss();
    },
    [dismiss],
  );

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
          onClick={skip}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* The Haldi scene. Portrait screens fill with it, anchored at the bottom so the couple always
              shows; landscape ones show the whole picture on its own cream. It dissolves, rather than
              parting, at the same moment the seal takes flight. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[#f9f4e8] bg-[url(/theme/intro-haldi.jpg)] bg-cover bg-bottom bg-no-repeat landscape:bg-contain landscape:bg-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: FLY_DURATION_S, delay: FLY_AT_MS / 1000, ease: "easeInOut" }}
          />

          {/* Centred by the wrapper so the seal's own transform is free for the flight; the bottom padding
              lifts it a little above centre, clear of the couple at the foot of the illustration. */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pb-[18svh]">
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
            onClick={skip}
            className="absolute right-4 top-4 rounded-full bg-olive/85 px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-olive"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
