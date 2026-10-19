"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getMusicUploadSignature, saveSong } from "./actions";

const MAX_BYTES = 20 * 1024 * 1024;

/** Picks an audio file, uploads it straight to Cloudinary, then saves it to `slot`. */
export default function SongUpload({ slot, hasSong }: { slot: string; hasSong: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("audio/")) return setStatus("Please choose an audio file, such as an MP3.");
    if (file.size > MAX_BYTES) return setStatus("That file is over 20 MB. Please choose a smaller one.");
    setStatus(null);

    startTransition(async () => {
      try {
        const sig = await getMusicUploadSignature();
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", sig.apiKey);
        form.append("timestamp", String(sig.timestamp));
        form.append("folder", sig.folder);
        form.append("signature", sig.signature);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const name = file.name.replace(/\.[^.]+$/, "");
        const result = await saveSong(slot, data.secure_url, data.public_id, name);
        setStatus(result.ok ? "Uploaded" : result.message);
        if (result.ok) router.refresh();
      } catch (e) {
        console.error("[music] upload failed:", e);
        setStatus("The upload didn't work. Please try again.");
      } finally {
        if (input.current) input.current.value = "";
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        className={`inline-flex cursor-pointer items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white ${
          pending ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {pending ? "Uploading…" : hasSong ? "Replace song" : "Upload song"}
        <input
          ref={input}
          type="file"
          accept="audio/*"
          className="sr-only"
          disabled={pending}
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </label>
      {status && <span className="text-sm text-zinc-600">{status}</span>}
    </div>
  );
}
