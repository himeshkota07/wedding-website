"use client";

import { useEffect, useState } from "react";

function getParts(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    diff,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

export default function Countdown({ targetIso, compact = false }: { targetIso: string; compact?: boolean }) {
  const targetMs = new Date(targetIso).getTime();
  // Computed only after mount (not during the server-rendered pass) so the
  // ticking value never mismatches between server and client render.
  const [parts, setParts] = useState<ReturnType<typeof getParts> | null>(null);

  useEffect(() => {
    const tick = () => setParts(getParts(targetMs));
    const firstTick = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(firstTick);
      clearInterval(id);
    };
  }, [targetMs]);

  if (!parts) {
    return compact ? <span className="text-xs text-zinc-400">&nbsp;</span> : <div className="h-16" />;
  }

  if (parts.diff <= 0) {
    return (
      <span className={compact ? "text-xs text-zinc-500" : "text-lg text-zinc-600"}>
        {compact ? "Happening now" : "It's happening!"}
      </span>
    );
  }

  if (compact) {
    return (
      <span className="text-xs text-zinc-500">
        {parts.days}d {parts.hours}h {parts.minutes}m
      </span>
    );
  }

  return (
    <div className="flex justify-center gap-3 text-center sm:gap-6">
      {[
        ["Days", parts.days],
        ["Hours", parts.hours],
        ["Min", parts.minutes],
        ["Sec", parts.seconds],
      ].map(([label, value]) => (
        <div key={label as string} className="w-12 sm:w-16">
          <div className="text-2xl font-semibold text-accent sm:text-4xl">{value}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">{label}</div>
        </div>
      ))}
    </div>
  );
}
