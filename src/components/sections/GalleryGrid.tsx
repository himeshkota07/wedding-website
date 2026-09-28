"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Lightbox from "@/components/ui/Lightbox";
import RevealGroup, { revealItemVariants } from "@/components/ui/RevealGroup";

type GalleryImage = { id: string; cloudinary_url: string; caption: string | null; uploaded_by: string | null };

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const variants = revealItemVariants(reduceMotion);

  const lightboxImages = images.map((img) => ({
    id: img.id,
    url: img.cloudinary_url,
    caption: img.caption,
    uploadedBy: img.uploaded_by,
  }));

  return (
    <>
      <RevealGroup className="columns-2 gap-3 sm:columns-3" stagger={0.04}>
        {images.map((img, i) => (
          <motion.button
            key={img.id}
            type="button"
            variants={variants}
            onClick={() => setOpenIndex(i)}
            className="mb-3 block w-full overflow-hidden rounded-lg border border-hairline/70 bg-[#fffaf3] transition-shadow hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs, no next/image domain config needed */}
            <img src={img.cloudinary_url} alt={img.caption ?? "Wedding photo"} className="block w-full" />
            {(img.caption || img.uploaded_by) && (
              <span className="block p-2 text-left text-xs text-foreground/60">
                {img.caption} {img.uploaded_by && `— ${img.uploaded_by}`}
              </span>
            )}
          </motion.button>
        ))}
      </RevealGroup>

      <Lightbox images={lightboxImages} openIndex={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </>
  );
}
