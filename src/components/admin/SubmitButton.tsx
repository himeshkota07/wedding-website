"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

/**
 * A form's submit button that says what's happening: "Saving…" while the
 * server action runs, then "Saved" for a few seconds. Without this the admin
 * forms gave no sign a save had worked, and people assumed it hadn't.
 * Must be rendered inside the <form> it submits.
 */
export default function SubmitButton({
  children,
  pendingLabel = "Saving…",
  doneLabel = "Saved",
  className = "rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white",
  formAction,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  doneLabel?: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  // With several buttons in one form (Save / Delete) only the one that was
  // pressed changes its label.
  const [clicked, setClicked] = useState(false);
  const mine = pending && clicked;
  const [done, setDone] = useState(false);
  const wasMine = useRef(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A press on another button in the same form clears this one's claim.
  useEffect(() => {
    if (!pending && !wasMine.current) setClicked(false);
  }, [pending]);

  useEffect(() => {
    if (mine) {
      wasMine.current = true;
      return;
    }
    if (!wasMine.current) return;
    wasMine.current = false;
    setClicked(false);
    setDone(true);
    // Not tied to this effect's cleanup: the page refresh that follows a save
    // re-renders the form and would otherwise cancel the timer, leaving
    // "Saved" up for good.
    if (doneTimer.current) clearTimeout(doneTimer.current);
    doneTimer.current = setTimeout(() => setDone(false), 3000);
  }, [mine]);

  useEffect(() => () => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
  }, []);

  return (
    <button
      type="submit"
      formAction={formAction}
      onClick={() => setClicked(true)}
      disabled={pending} aria-live="polite" className={`${className} disabled:opacity-60`}>
      {mine ? (
        pendingLabel
      ) : done ? (
        <span className="inline-flex items-center gap-1">
          <Check size={14} aria-hidden /> {doneLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
