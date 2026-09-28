"use client";

import { useEffect, useState } from "react";

function getParts(targetMs: number) {
  const now = new Date();
  const diff = Math.max(0, targetMs - now.getTime());

  if (diff <= 0) {
    return { diff, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  // Calendar-aware month count (not a flat /30 average), so "4 months" means
  // an actual 4 full calendar months from today, with days/hours as the remainder.
  let months = (new Date(targetMs).getFullYear() - now.getFullYear()) * 12 + (new Date(targetMs).getMonth() - now.getMonth());
  let anchor = new Date(now.getFullYear(), now.getMonth() + months, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
  if (anchor.getTime() > targetMs) {
    months -= 1;
    anchor = new Date(now.getFullYear(), now.getMonth() + months, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
  }

  const remainderMs = targetMs - anchor.getTime();
  const days = Math.floor(remainderMs / 86_400_000);
  const hours = Math.floor((remainderMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remainderMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainderMs % 60_000) / 1_000);

  return { diff, months, days, hours, minutes, seconds };
}

export default function Countdown({ targetIso, compact = false }: { targetIso: string; compact?: boolean }) {
  const targetMs = new Date(targetIso).getTime();
  // Computed only after mount (not during the server-rendered pass) so the
  // ticking value never mismatches between server and client render.
  const [parts, setParts] = useState<ReturnType<typeof getParts> | null>(null);

  useEffect(() => {
    const tick = () => setParts(getParts(targetMs));
    const firstTick = setTimeout(tick, 0);
    // The full display ticks down to the second; compact only shows down to
    // hours, but a 1s interval is cheap either way and keeps this simple.
    const id = setInterval(tick, 1_000);
    return () => {
      clearTimeout(firstTick);
      clearInterval(id);
    };
  }, [targetMs]);

  if (!parts) {
    return compact ? <span className="text-sm">&nbsp;</span> : <div className="h-16" />;
  }

  if (parts.diff <= 0) {
    return (
      <span className={compact ? "text-sm font-medium" : "font-display text-2xl text-kumkum"}>
        {compact ? "Happening now" : "It's happening!"}
      </span>
    );
  }

  if (compact) {
    return (
      <span className="text-sm tabular-nums">
        in {parts.months > 0 && `${parts.months} mo `}
        {parts.days} d {parts.hours} h
      </span>
    );
  }

  return (
    <div className="flex items-end gap-3 sm:gap-5" role="timer" aria-label="Time until the wedding">
      {[
        ["months", parts.months],
        ["days", parts.days],
        ["hours", parts.hours],
        ["min", parts.minutes],
        ["sec", parts.seconds],
      ].map(([label, value], i) => (
        <div key={label as string} className="flex items-end gap-3 sm:gap-5">
          {i > 0 && <span aria-hidden className="mb-3 h-1.5 w-1.5 rotate-45 bg-brass" />}
          <div>
            <div className="font-display text-4xl leading-none tabular-nums text-ink sm:text-5xl">
              {String(value).padStart(2, "0")}
            </div>
            <div className="mt-1 text-sm text-ink-soft">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
