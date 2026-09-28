"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { HomeHero } from "@/lib/site-settings";
import Countdown from "@/components/Countdown";
import Monogram from "@/components/ui/Monogram";
import PuppetSilhouette from "@/components/ui/PuppetSilhouette";

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero({ hero, qrCode }: { hero: HomeHero; qrCode: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      id="top"
      className="relative flex min-h-[90svh] scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center"
      style={{
        background:
          "radial-gradient(at 15% 10%, var(--accent-soft) 0%, transparent 65%), radial-gradient(at 85% 90%, var(--gold-soft) 0%, transparent 65%), var(--background)",
      }}
    >
      {/* decorative drifting washes -- plain CSS animation, inert under prefers-reduced-motion via globals.css */}
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full opacity-50 blur-3xl"
        style={{ background: "var(--gold)", ["--drift-x" as string]: "30px", ["--drift-y" as string]: "-20px" }}
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full opacity-40 blur-3xl"
        style={{
          background: "var(--blush)",
          animationDelay: "-6s",
          ["--drift-x" as string]: "-24px",
          ["--drift-y" as string]: "18px",
        }}
      />
      <PuppetSilhouette
        size={110}
        opacity={0.18}
        className="pointer-events-none absolute -left-2 bottom-10 hidden sm:block"
      />
      <PuppetSilhouette
        size={110}
        opacity={0.18}
        flip
        className="pointer-events-none absolute -right-2 bottom-10 hidden sm:block"
      />

      <motion.div
        initial={reduceMotion ? "show" : "hidden"}
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } } }}
        className="relative flex flex-col items-center"
      >
        <motion.div variants={itemVariants}>
          <Monogram />
        </motion.div>

        <motion.p variants={itemVariants} className="mt-4 text-sm font-medium uppercase tracking-widest text-accent">
          We&apos;re getting married
        </motion.p>

        <motion.h1 variants={itemVariants} className="mt-3 font-script text-5xl italic text-ink sm:text-6xl">
          {hero.bride_name} &amp; {hero.groom_name}
        </motion.h1>

        <motion.p variants={itemVariants} className="mt-4 font-display text-lg text-foreground/70">
          {hero.wedding_date_label} &middot; {hero.location}
        </motion.p>

        {hero.welcome_note && (
          <motion.p variants={itemVariants} className="mt-6 max-w-xl text-foreground/70">
            {hero.welcome_note}
          </motion.p>
        )}

        {hero.wedding_datetime && (
          <motion.div variants={itemVariants} className="mt-8">
            <Countdown targetIso={hero.wedding_datetime} />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mt-12">
          {qrCode}
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="button"
          onClick={() => window.dispatchEvent(new Event("replay-intro"))}
          className="mt-6 flex items-center gap-1.5 text-xs text-foreground/40 transition-colors hover:text-accent-deep"
        >
          <RotateCcw size={12} />
          Watch the opening again
        </motion.button>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute bottom-6 text-accent-deep/60"
        animate={reduceMotion ? {} : { y: [0, 6, 0] }}
        transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={22} />
      </motion.div>
    </div>
  );
}
