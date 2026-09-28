"use client";

import { useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import { resizeImageToBlob } from "@/lib/image-resize";
import { recordGalleryUpload } from "@/app/(site)/gallery/actions";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const MAX_FILES = 10;
const MAX_BYTES_AFTER_RESIZE = 5 * 1024 * 1024;

export default function GalleryUpload() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, MAX_FILES);
    setStatus(null);

    startTransition(async () => {
      let uploaded = 0;
      for (const file of files) {
        try {
          const blob = await resizeImageToBlob(file);
          if (blob.size > MAX_BYTES_AFTER_RESIZE) continue;

          const uploadForm = new FormData();
          uploadForm.append("file", blob);
          uploadForm.append("upload_preset", UPLOAD_PRESET);

          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: uploadForm,
          });
          if (!res.ok) continue;
          const data = await res.json();

          const recordForm = new FormData();
          recordForm.append("public_id", data.public_id);
          recordForm.append("url", data.secure_url);
          recordForm.append("uploaded_by", name);
          const result = await recordGalleryUpload(recordForm);
          if (result.ok) uploaded++;
        } catch {
          // Skip this file and keep going with the rest of the batch.
        }
      }
      setStatus(
        uploaded > 0
          ? `Uploaded ${uploaded} photo${uploaded > 1 ? "s" : ""} — now live in the gallery.`
          : "Nothing uploaded — please try again.",
      );
    });
  }

  return (
    <div className="flex flex-col gap-5 border border-brass/60 bg-paper-deep p-5 sm:flex-row sm:items-end sm:p-7">
      <div className="flex-1">
        <h3 className="font-display text-2xl text-ink">Add your photos</h3>
        <p className="mt-1 text-ink-soft">Up to {MAX_FILES} at a time. They appear in the gallery right away.</p>
        <label className="mt-4 block text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft" htmlFor="uploader-name">
          Your name <span className="font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="uploader-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 h-12 w-full max-w-sm border border-brass/70 bg-paper px-3 text-base text-ink placeholder:text-ink-soft/70 focus:border-kumkum focus:outline-none"
        />
      </div>
      <div className="sm:text-right">
        <label
          className={`inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-kumkum px-6 font-semibold text-paper transition-colors hover:bg-kumkum-deep ${
            pending ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <ImagePlus size={18} />
          {pending ? "Uploading…" : "Choose photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={pending}
            onChange={(e) => handleFiles(e.target.files)}
            className="sr-only"
          />
        </label>
        {status && !pending && (
          <p role="status" className="mt-2 text-ink-soft">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
