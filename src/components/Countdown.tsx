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
    return compact ? <span className="text-xs text-foreground/40">&nbsp;</span> : <div className="h-16" />;
  }

  if (parts.diff <= 0) {
    return (
      <span className={compact ? "text-xs text-foreground/60" : "text-lg text-foreground/70"}>
        {compact ? "Happening now" : "It's happening!"}
      </span>
    );
  }

  if (compact) {
    return (
      <span className="text-xs text-foreground/60">
        {parts.months}mo {parts.days}d {parts.hours}h
      </span>
    );
  }

  return (
    <div className="flex justify-center gap-2 text-center sm:gap-4">
      {[
        ["Months", parts.months],
        ["Days", parts.days],
        ["Hours", parts.hours],
        ["Min", parts.minutes],
        ["Sec", parts.seconds],
      ].map(([label, value]) => (
        <div
          key={label as string}
          className="w-12 rounded-xl border border-hairline/50 bg-white/70 py-2 shadow-sm backdrop-blur sm:w-16 sm:py-3"
        >
          <div className="font-display text-xl font-semibold text-accent sm:text-4xl">{value}</div>
          <div className="text-[9px] uppercase tracking-wide text-foreground/50 sm:text-xs">{label}</div>
        </div>
      ))}
    </div>
  );
}
