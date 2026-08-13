"use client";

import { useState, useTransition } from "react";
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
          ? `Uploaded ${uploaded} photo${uploaded > 1 ? "s" : ""} — pending approval before they show up here.`
          : "Nothing uploaded — please try again.",
      );
    });
  }

  return (
    <div className="rounded-lg border border-dashed border-black/20 p-4">
      <label className="block text-sm font-medium text-zinc-900">Add your photos</label>
      <input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-2 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
      />
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={pending}
        onChange={(e) => handleFiles(e.target.files)}
        className="mt-2 block w-full text-sm"
      />
      <p className="mt-1 text-xs text-zinc-500">
        Up to {MAX_FILES} photos at a time. Photos are reviewed before appearing here.
      </p>
      {pending && <p className="mt-2 text-sm text-zinc-600">Uploading…</p>}
      {status && !pending && <p className="mt-2 text-sm text-zinc-600">{status}</p>}
    </div>
  );
}
