"use client";

import { useState } from "react";
import Lightbox from "@/components/ui/Lightbox";

type GalleryImage = { id: string; cloudinary_url: string; caption: string | null; uploaded_by: string | null };

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const lightboxImages = images.map((img) => ({
    id: img.id,
    url: img.cloudinary_url,
    caption: img.caption,
    uploadedBy: img.uploaded_by,
  }));

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group mb-4 block w-full break-inside-avoid bg-paper p-1.5 text-left ring-1 ring-brass/50 transition-shadow hover:ring-kumkum"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URLs, no next/image domain config needed */}
            <img src={img.cloudinary_url} alt={img.caption ?? "Wedding photo"} className="block w-full" loading="lazy" />
            {(img.caption || img.uploaded_by) && (
              <span className="block px-1 pb-0.5 pt-2 text-sm text-ink-soft">
                {img.caption}
                {img.uploaded_by && <span className="block text-ink-soft/80">from {img.uploaded_by}</span>}
              </span>
            )}
          </button>
        ))}
      </div>

      <Lightbox images={lightboxImages} openIndex={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </>
  );
}
