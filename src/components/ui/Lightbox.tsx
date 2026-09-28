"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type LightboxImage = { id: string; url: string; caption?: string | null; uploadedBy?: string | null };

type LightboxProps = {
  images: LightboxImage[];
  openIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function Lightbox({ images, openIndex, onClose, onNavigate }: LightboxProps) {
  const reduceMotion = useReducedMotion();
  const isOpen = openIndex !== null;
  const count = images.length;

  const goNext = useCallback(() => {
    if (openIndex === null) return;
    onNavigate((openIndex + 1) % count);
  }, [openIndex, count, onNavigate]);

  const goPrev = useCallback(() => {
    if (openIndex === null) return;
    onNavigate((openIndex - 1 + count) % count);
  }, [openIndex, count, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, goNext, goPrev]);

  const image = openIndex !== null ? images[openIndex] : null;

  return (
    <AnimatePresence>
      {isOpen && image && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {count > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <motion.div
            key={image.id}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="flex max-h-full max-w-full flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) goNext();
              else if (info.offset.x > 80) goPrev();
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs */}
            <img
              src={image.url}
              alt={image.caption ?? "Wedding photo"}
              className="max-h-[80vh] max-w-full touch-none rounded-lg object-contain"
            />
            {(image.caption || image.uploadedBy) && (
              <p className="mt-3 text-center text-sm text-white/80">
                {image.caption} {image.uploadedBy && `— ${image.uploadedBy}`}
              </p>
            )}
          </motion.div>

          {count > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
