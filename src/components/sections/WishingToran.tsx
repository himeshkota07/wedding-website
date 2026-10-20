"use client";

import { useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, ImagePlus, Mic, Square, X } from "lucide-react";
import { tieWish } from "@/app/(site)/wishes/actions";
import { track } from "@vercel/analytics";
import { Toran } from "@/components/ui/motifs";
import { resizeImageToBlob } from "@/lib/image-resize";
import { useVoiceRecorder } from "@/lib/use-voice-recorder";
import { WISH_COLORS, WISH_LIMITS, formatWishDate, type Wish, type WishColor } from "@/lib/wishes";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

/** A small, stable "random" from a wish id, so each tag keeps its own angle and thread between visits. */
function seed(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Thread lengths (px) cycle along the string so the tags hang staggered, like
// hand-tied gift tags. Every length clears the toran's mango leaves (~44px).
const THREADS = [56, 124, 82, 150, 66, 106];

// The tag's die-cut shoulders; the punched hole sits between them.
const TAG_SHAPE = "[clip-path:polygon(16%_0,84%_0,100%_11%,100%_100%,0_100%,0_11%)]";

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
        {wish.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element -- guest photo on Cloudinary
          <img src={wish.photo_url} alt={`Photo from ${wish.name}`} className="mb-4 max-h-80 w-full object-cover" />
        )}
        <p className="whitespace-pre-line text-lg leading-relaxed text-ink">{wish.message}</p>
        <p className="mt-4 font-script text-4xl font-bold leading-tight text-kumkum">{wish.name}</p>
        <p className="text-ink-soft">
          {wish.relation && <span>{wish.relation} · </span>}
          {formatWishDate(wish.created_at)}
        </p>
      </div>
    </article>
  );
}

/**
 * One wish as a paper tag on its thread. A photo, if the guest added one,
 * fills the tag behind a dark wash so the text stays readable in paper white.
 */
function WishTag({
  wish,
  thread,
  angle,
  isNew,
  isOpen,
  onOpen,
}: {
  wish: Wish;
  thread: number;
  angle: number;
  isNew: boolean;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const photo = wish.photo_url;
  return (
    <li className="relative shrink-0 snap-start" style={{ paddingTop: thread }}>
      <span aria-hidden className="absolute left-1/2 top-1 w-px bg-brass" style={{ height: thread + 8 }} />
      <motion.button
        type="button"
        onClick={onOpen}
        aria-expanded={isOpen}
        aria-label={`Wish from ${wish.name}`}
        initial={isNew && !reduceMotion ? { y: -70, rotate: angle - 18, opacity: 0 } : false}
        animate={{ y: 0, rotate: angle, opacity: 1 }}
        // Each tag sways once as it comes into view, as if it had just been hung.
        // (Keyframes need a tween; the spring below only handles the drop-in of a newly tied wish.)
        whileInView={
          reduceMotion
            ? undefined
            : { rotate: [angle, angle + 5, angle - 3, angle + 1.5, angle], transition: { duration: 1.6, ease: "easeOut" } }
        }
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        style={{ transformOrigin: "50% 0%" }}
        className={`relative block w-44 text-left drop-shadow-[0_10px_10px_rgb(43_33_28/0.22)] sm:w-52 ${
          isOpen ? "outline outline-2 outline-offset-4 outline-kumkum" : ""
        }`}
      >
        <div
          className={`relative overflow-hidden px-4 pb-4 pt-9 ${TAG_SHAPE} ${photo ? "min-h-60" : ""}`}
          style={photo ? undefined : { background: WISH_COLORS[wish.color].paper }}
        >
          {photo && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- guest photo on Cloudinary */}
              <img src={photo} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/25" />
            </>
          )}
          <span aria-hidden className="absolute left-1/2 top-3 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-paper-deep ring-2 ring-brass" />
          <p className={`relative line-clamp-6 whitespace-pre-line text-base leading-snug ${photo ? "text-paper" : "text-ink"}`}>
            {wish.message}
          </p>
          <p className={`relative mt-3 font-script text-3xl font-bold leading-tight ${photo ? "text-haldi" : "text-kumkum"}`}>{wish.name}</p>
        </div>
      </motion.button>
    </li>
  );
}

/**
 * The Wishing Toran: a marigold-and-mango-leaf toran strung across a strip
 * that scrolls sideways, with every wish hung from it as a paper tag on its
 * own thread, newest first. Tap a tag to read it in full; tie your own and it
 * drops onto the start of the string.
 */
export default function WishingToran({ initialWishes }: { initialWishes: Wish[] }) {
  const [wishes, setWishes] = useState(initialWishes);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [messageLength, setMessageLength] = useState(0);
  const [color, setColor] = useState<WishColor>("haldi");
  // The chosen photo and a local preview URL for it, released when replaced or removed.
  const [photo, setPhotoState] = useState<{ file: File; preview: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Speak a blessing instead of typing it: the transcript (in the guest's own
  // language and script) is added to whatever is already in the box.
  const voice = useVoiceRecorder({
    onText: (text) => {
      const box = messageRef.current;
      if (!box) return;
      box.value = (box.value.trim() ? `${box.value.trimEnd()} ${text}` : text).slice(0, WISH_LIMITS.message);
      setMessageLength(box.value.length);
    },
  });

  function setPhoto(file: File | null) {
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhotoState(file ? { file, preview: URL.createObjectURL(file) } : null);
  }

  const openIndex = wishes.findIndex((w) => w.id === openId);
  const open = openIndex >= 0 ? wishes[openIndex] : null;

  function step(delta: number) {
    if (openIndex < 0) return;
    setOpenId(wishes[(openIndex + delta + wishes.length) % wishes.length].id);
  }

  function scrollRail(direction: 1 | -1) {
    const rail = railRef.current;
    rail?.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function submit(formData: FormData) {
    setStatus(null);
    startTransition(async () => {
      if (photo) {
        try {
          const upload = new FormData();
          upload.append("file", await resizeImageToBlob(photo.file, 1400));
          upload.append("upload_preset", UPLOAD_PRESET);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: upload });
          if (!res.ok) throw new Error(`Cloudinary ${res.status}`);
          const data = await res.json();
          formData.set("photo_url", data.secure_url);
          formData.set("photo_public_id", data.public_id);
        } catch {
          setStatus({ ok: false, text: "Your photo couldn't be uploaded. Try again, or remove it and tie your wish without one." });
          return;
        }
      }

      const result = await tieWish(formData);
      if (!result.ok) {
        setStatus({ ok: false, text: result.message });
        return;
      }
      setWishes((prev) => (prev.some((w) => w.id === result.wish.id) ? prev : [result.wish, ...prev]));
      setNewestId(result.wish.id);
      track("Wish posted", { photo: Boolean(result.wish.photo_url) });
      setOpenId(result.wish.id);
      setStatus({ ok: true, text: "Your wish is tied to their toran. Thank you!" });
      formRef.current?.reset();
      setMessageLength(0);
      setColor("haldi");
      setPhoto(null);
      railRef.current?.scrollTo({ left: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  return (
    <div>
      {/* The string: a toran across a strip that scrolls sideways, tags hanging from it. */}
      <div className="relative">
        <div
          ref={railRef}
          className="-mx-5 snap-x overflow-x-auto overscroll-x-contain scroll-px-5 px-5 pb-8 [scrollbar-color:var(--brass)_transparent] [scrollbar-width:thin] sm:-mx-8 sm:scroll-px-8 sm:px-8"
        >
          <ul
            aria-label={`${wishes.length} wish${wishes.length === 1 ? "" : "es"}, newest first`}
            className="relative flex w-max min-w-full items-start gap-4 pr-5 sm:gap-6 sm:pr-8"
          >
            <li aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
              <Toran />
            </li>

            {/* The first place on the string is always free, waiting for the next wish. */}
            <li className="relative shrink-0 snap-start" style={{ paddingTop: THREADS[1] }}>
              <span aria-hidden className="absolute left-1/2 top-1 w-px bg-brass/60" style={{ height: THREADS[1] + 8 }} />
              <button
                type="button"
                onClick={() => {
                  nameRef.current?.focus();
                  nameRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
                }}
                className={`relative flex h-44 w-44 flex-col items-center justify-center gap-2 border-2 border-dashed border-brass bg-paper/70 px-4 pt-6 text-center text-ink transition-colors hover:border-kumkum hover:text-kumkum sm:w-52 ${TAG_SHAPE}`}
              >
                <span aria-hidden className="absolute left-1/2 top-3 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-paper-deep ring-2 ring-brass" />
                <span className="font-display text-xl">Tie your wish</span>
                <span className="text-sm text-ink-soft">It hangs here, first on the string.</span>
              </button>
            </li>

            {wishes.map((wish) => {
              const s = seed(wish.id);
              return (
                <WishTag
                  key={wish.id}
                  wish={wish}
                  thread={THREADS[s % THREADS.length]}
                  angle={(s % 9) - 4}
                  isNew={wish.id === newestId}
                  isOpen={wish.id === openId}
                  onOpen={() => setOpenId(wish.id === openId ? null : wish.id)}
                />
              );
            })}
          </ul>
        </div>

        {/* A fade at the right edge hints there's more string to scroll; arrows help on laptops. */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 -right-5 w-12 bg-gradient-to-l from-paper-deep sm:-right-8" />
        {wishes.length > 2 && (
          <div className="mt-1 hidden justify-end gap-2 md:flex">
            <button type="button" onClick={() => scrollRail(-1)} aria-label="Scroll wishes left" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink hover:border-kumkum hover:text-kumkum">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => scrollRail(1)} aria-label="Scroll wishes right" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink hover:border-kumkum hover:text-kumkum">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg text-ink-soft">
          {wishes.length === 0
            ? "No wishes yet. Be the first to tie one."
            : `${wishes.length} wish${wishes.length === 1 ? "" : "es"} tied so far. Swipe along the string, and tap a tag to read it.`}
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

      {/* The chosen tag, opened out to read in full. */}
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

      {/* A framed window that scrolls on its own, so the page doesn't grow with every wish. */}
      {showAll && (
        <div className="relative mt-8">
          <div
            tabIndex={0}
            role="region"
            aria-label="All wishes"
            className="max-h-[70svh] overflow-y-auto bg-paper-deep/60 p-4 ring-1 ring-brass/60 sm:max-h-[36rem] sm:p-6"
          >
            <div className="columns-1 gap-6 md:columns-2">
              {wishes.map((wish) => (
                <WishSlip key={wish.id} wish={wish} className="mb-8 break-inside-avoid" />
              ))}
            </div>
          </div>
          {wishes.length > 2 && (
            <p className="mt-2 text-center text-base text-ink-soft">Scroll inside the box to read more</p>
          )}
        </div>
      )}

      {/* Tie a wish. */}
      <div className="relative isolate mt-14 max-w-2xl">
        <div aria-hidden className="absolute inset-0 -z-10 translate-x-2 translate-y-2.5 -rotate-[0.6deg] bg-leaf-soft/40" />
        <form ref={formRef} action={submit} className="relative bg-paper p-6 ring-1 ring-brass/60 sm:p-8">
          <h3 className="font-display text-3xl text-ink">Tie your wish</h3>
          <p className="mt-1 text-lg text-ink-soft">In English, Telugu, Kannada or Hindi: type it, or tap the mic and say it. It stays here for the couple to keep.</p>

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

          <div className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="wish-message" className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
                Your wish
              </label>
              <button
                type="button"
                onClick={voice.toggle}
                disabled={voice.transcribing || pending}
                aria-label={voice.recording ? "Stop recording" : "Say your wish"}
                className={`flex h-11 items-center gap-2 rounded-full border px-4 text-base transition-colors disabled:opacity-50 ${
                  voice.recording ? "animate-pulse border-kumkum bg-kumkum text-paper" : "border-brass text-ink hover:border-kumkum hover:text-kumkum"
                }`}
              >
                {voice.recording ? <Square size={16} /> : <Mic size={18} />}
                {voice.transcribing ? "Writing it down…" : voice.recording ? "Stop" : "Say it"}
              </button>
            </div>
            <textarea
              id="wish-message"
              ref={messageRef}
              name="message"
              required
              rows={5}
              maxLength={WISH_LIMITS.message}
              onChange={(e) => setMessageLength(e.target.value.length)}
              className="mt-1.5 w-full resize-y border border-brass/80 bg-paper px-3 py-2.5 text-lg leading-relaxed text-ink focus:border-kumkum focus:outline-none"
            />
            <div className="mt-1 flex justify-between gap-3 text-sm text-ink-soft">
              <span role={voice.error ? "alert" : "status"} className={voice.error ? "text-kumkum" : ""}>
                {voice.error ?? (voice.recording ? "Listening… tap Stop when you're done." : "")}
              </span>
              <span className="tabular-nums">
                {messageLength}/{WISH_LIMITS.message}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-start gap-x-8 gap-y-5">
            <fieldset>
              <legend className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">Your tag</legend>
              <div className="mt-2 flex gap-2.5">
                {(Object.keys(WISH_COLORS) as WishColor[]).map((key) => (
                  <label key={key} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={key}
                      checked={color === key}
                      onChange={() => setColor(key)}
                      className="peer sr-only"
                    />
                    <span
                      title={WISH_COLORS[key].label}
                      className="block h-11 w-11 rounded-lg ring-1 ring-ink/15 transition-shadow peer-checked:ring-[3px] peer-checked:ring-kumkum peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-kumkum"
                      style={{ background: WISH_COLORS[key].paper }}
                    />
                    <span className="sr-only">{WISH_COLORS[key].label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
                A photo <span className="font-normal normal-case tracking-normal">(optional, becomes your tag&apos;s background)</span>
              </p>
              {photo ? (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local preview (blob: URL) */}
                  <img src={photo.preview} alt="Your chosen photo" className="h-16 w-16 rounded-lg object-cover ring-1 ring-ink/15" />
                  <button type="button" onClick={() => setPhoto(null)} className="h-11 rounded-full px-3 text-ink-soft underline-offset-4 hover:text-kumkum hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <label className="mt-2 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-dashed border-brass px-4 text-ink transition-colors hover:border-kumkum hover:text-kumkum">
                  <ImagePlus size={18} />
                  Add a photo
                  <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="sr-only" />
                </label>
              )}
            </div>
          </div>

          {/* Honeypot: hidden from people, irresistible to bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 items-center rounded-full bg-kumkum px-7 text-base font-semibold text-paper transition-colors hover:bg-kumkum-deep disabled:opacity-60"
            >
              {pending ? (photo ? "Uploading and tying…" : "Tying your wish…") : "Tie your wish"}
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
