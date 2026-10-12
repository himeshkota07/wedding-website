"use client";

import { useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { tieWish } from "@/app/(site)/wishes/actions";
import { WISH_LIMITS, formatWishDate, type Wish } from "@/lib/wishes";

/** A small, stable "random" from a wish id, so each leaf keeps its own angle between visits. */
function seed(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const BEADS = ["var(--marigold)", "var(--kumkum)", "var(--turmeric)"];

/** One mango leaf hanging from the toran's string. */
function LeafShape({ tone, empty = false }: { tone: 0 | 1; empty?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 60" className="h-full w-full">
      <path
        d="M12,1 C3,13 3,36 12,59 C21,36 21,13 12,1 Z"
        fill={empty ? "none" : tone === 0 ? "var(--leaf)" : "var(--leaf-soft)"}
        stroke={empty ? "var(--leaf)" : "none"}
        strokeWidth={empty ? 1.4 : 0}
        strokeDasharray={empty ? "3 3" : undefined}
      />
      {!empty && <path d="M12,5 L12,54" stroke={tone === 0 ? "var(--leaf-soft)" : "var(--leaf)"} strokeWidth="1" />}
    </svg>
  );
}

/** A turmeric dab, as on the corners of a patrika. */
function Dab({ className }: { className: string }) {
  return <span aria-hidden className={`absolute h-3.5 w-3.5 rounded-full bg-turmeric ring-[3px] ring-inset ring-kumkum/70 ${className}`} />;
}

function WishSlip({ wish, className = "" }: { wish: Wish; className?: string }) {
  return (
    <article className={`relative isolate ${className}`}>
      <div aria-hidden className="absolute inset-0 -z-10 translate-x-1.5 translate-y-2 rotate-[0.8deg] bg-turmeric/35" />
      <div className="relative bg-paper px-5 py-5 ring-1 ring-brass/60 sm:px-6">
        <Dab className="-left-1.5 -top-1.5" />
        <Dab className="-right-1.5 -top-1.5" />
        <p className="whitespace-pre-line text-lg leading-relaxed text-ink">{wish.message}</p>
        <p className="mt-4 font-script text-2xl leading-tight text-kumkum">{wish.name}</p>
        <p className="text-ink-soft">
          {wish.relation && <span>{wish.relation} · </span>}
          {formatWishDate(wish.created_at)}
        </p>
      </div>
    </article>
  );
}

/**
 * The Wishing Toran: every wish is a mango leaf tied to a garland that grows
 * across the section, row after row. Tap a leaf to read its note; tie your
 * own and its leaf joins the end of the string.
 */
export default function WishingToran({ initialWishes }: { initialWishes: Wish[] }) {
  const [wishes, setWishes] = useState(initialWishes);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [messageLength, setMessageLength] = useState(0);
  const [pending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const openIndex = wishes.findIndex((w) => w.id === openId);
  const open = openIndex >= 0 ? wishes[openIndex] : null;

  function step(delta: number) {
    if (openIndex < 0) return;
    setOpenId(wishes[(openIndex + delta + wishes.length) % wishes.length].id);
  }

  function submit(formData: FormData) {
    setStatus(null);
    startTransition(async () => {
      const result = await tieWish(formData);
      if (!result.ok) {
        setStatus({ ok: false, text: result.message });
        return;
      }
      setWishes((prev) => (prev.some((w) => w.id === result.wish.id) ? prev : [...prev, result.wish]));
      setNewestId(result.wish.id);
      setOpenId(result.wish.id);
      setStatus({ ok: true, text: "Your wish is tied to their toran. Thank you!" });
      formRef.current?.reset();
      setMessageLength(0);
    });
  }

  return (
    <div>
      {/* The garland itself. Each list item is one length of string with a bead and a leaf. */}
      <ul aria-label={`${wishes.length} wish${wishes.length === 1 ? "" : "es"}, newest last`} className="relative -mx-1 flex flex-wrap gap-y-4">
        {/* The first length of string always spans the full width, beads and all, so the toran reads as a garland waiting for leaves. */}
        <li
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-3"
          style={{
            backgroundImage:
              "linear-gradient(var(--brass), var(--brass)), radial-gradient(circle, var(--marigold) 5px, transparent 5.5px)",
            backgroundSize: "100% 1px, 56px 12px",
            backgroundPosition: "0 6px, -28px 0",
            backgroundRepeat: "no-repeat, repeat-x",
          }}
        />
        {wishes.map((wish, i) => {
          const s = seed(wish.id);
          const angle = (s % 13) - 6;
          const isOpen = wish.id === openId;
          return (
            <li key={wish.id} className="relative h-24 w-14">
              <span aria-hidden className="absolute inset-x-0 top-1.5 h-px bg-brass" />
              <span aria-hidden className="absolute -left-1.5 top-0 h-3 w-3 rounded-full" style={{ background: BEADS[i % BEADS.length] }} />
              <motion.button
                type="button"
                onClick={() => setOpenId(isOpen ? null : wish.id)}
                aria-expanded={isOpen}
                aria-label={`Wish from ${wish.name}`}
                initial={wish.id === newestId && !reduceMotion ? { y: 140, rotate: -40, opacity: 0 } : false}
                animate={{ y: 0, rotate: angle, opacity: 1 }}
                whileHover={reduceMotion ? undefined : { rotate: [angle, angle + 6, angle - 3, angle] }}
                transition={{ type: "spring", stiffness: 140, damping: 14 }}
                style={{ transformOrigin: "50% 0%" }}
                className="absolute left-1/2 top-1.5 h-[4.5rem] w-7 -translate-x-1/2 rounded-full outline-offset-4"
              >
                <LeafShape tone={(s % 2) as 0 | 1} />
                {isOpen && <span aria-hidden className="absolute -bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-kumkum" />}
              </motion.button>
            </li>
          );
        })}
        {/* The next empty place on the string, waiting for a wish. */}
        <li className="relative h-24 w-14">
          <span aria-hidden className="absolute inset-x-0 top-1.5 h-px bg-brass/60" />
          <button
            type="button"
            onClick={() => nameRef.current?.focus()}
            aria-label="Tie your own wish"
            className="absolute left-1/2 top-1.5 h-[4.5rem] w-7 -translate-x-1/2 rounded-full opacity-80 transition-opacity hover:opacity-100"
          >
            <LeafShape tone={0} empty />
          </button>
        </li>
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg text-ink-soft">
          {wishes.length === 0
            ? "No wishes yet. Be the first to tie one."
            : `${wishes.length} wish${wishes.length === 1 ? "" : "es"} tied so far. Tap a leaf to read it.`}
        </p>
        {wishes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="inline-flex h-11 items-center rounded-full border border-ink/25 px-5 font-medium text-ink transition-colors hover:border-kumkum hover:text-kumkum"
          >
            {showAll ? "Hide the list" : "Read all wishes"}
          </button>
        )}
      </div>

      {/* The note hanging from the chosen leaf. */}
      <AnimatePresence mode="wait">
        {open && !showAll && (
          <motion.div
            key={open.id}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10, rotate: -0.6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-2xl"
            aria-live="polite"
          >
            <WishSlip wish={open} />
            <div className="mt-4 flex items-center gap-2">
              <button type="button" onClick={() => step(-1)} aria-label="Previous wish" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink hover:border-kumkum hover:text-kumkum">
                <ChevronLeft size={20} />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next wish" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink hover:border-kumkum hover:text-kumkum">
                <ChevronRight size={20} />
              </button>
              <span className="ml-1 text-ink-soft tabular-nums">
                {openIndex + 1} of {wishes.length}
              </span>
              <button type="button" onClick={() => setOpenId(null)} aria-label="Close this wish" className="ml-auto flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:text-kumkum">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAll && (
        <div className="mt-8 columns-1 gap-6 md:columns-2">
          {[...wishes].reverse().map((wish) => (
            <WishSlip key={wish.id} wish={wish} className="mb-8 break-inside-avoid" />
          ))}
        </div>
      )}

      {/* Tie a wish. */}
      <div className="relative isolate mt-14 max-w-2xl">
        <div aria-hidden className="absolute inset-0 -z-10 translate-x-2 translate-y-2.5 -rotate-[0.6deg] bg-leaf-soft/40" />
        <form ref={formRef} action={submit} className="relative bg-paper p-6 ring-1 ring-brass/60 sm:p-8">
          <h3 className="font-display text-3xl text-ink">Tie your wish</h3>
          <p className="mt-1 text-lg text-ink-soft">In English, Telugu or Kannada. It stays here for the couple to keep.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">Your name</span>
              <input
                ref={nameRef}
                name="name"
                required
                maxLength={WISH_LIMITS.name}
                autoComplete="name"
                className="mt-1.5 h-12 w-full border border-brass/80 bg-paper px-3 text-lg text-ink focus:border-kumkum focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
                How you know them <span className="font-normal normal-case tracking-normal">(optional)</span>
              </span>
              <input
                name="relation"
                maxLength={WISH_LIMITS.relation}
                placeholder="e.g. Ashish's college friend"
                className="mt-1.5 h-12 w-full border border-brass/80 bg-paper px-3 text-lg text-ink placeholder:text-ink-soft/70 focus:border-kumkum focus:outline-none"
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">Your wish</span>
            <textarea
              name="message"
              required
              rows={5}
              maxLength={WISH_LIMITS.message}
              onChange={(e) => setMessageLength(e.target.value.length)}
              className="mt-1.5 w-full resize-y border border-brass/80 bg-paper px-3 py-2.5 text-lg leading-relaxed text-ink focus:border-kumkum focus:outline-none"
            />
            <span className="mt-1 block text-right text-sm text-ink-soft tabular-nums">
              {messageLength}/{WISH_LIMITS.message}
            </span>
          </label>

          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 items-center rounded-full bg-kumkum px-7 text-base font-semibold text-paper transition-colors hover:bg-kumkum-deep disabled:opacity-60"
            >
              {pending ? "Tying your wish…" : "Tie your wish"}
            </button>
            {status && (
              <p role="status" className={status.ok ? "text-lg text-leaf" : "text-lg text-kumkum"}>
                {status.text}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
