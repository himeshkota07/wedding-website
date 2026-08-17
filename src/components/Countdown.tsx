"use client";

import { useEffect, useState } from "react";

function getParts(targetMs: number) {
  const now = new Date();
  const diff = Math.max(0, targetMs - now.getTime());

  if (diff <= 0) {
    return { diff, months: 0, days: 0, hours: 0 };
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

  return { diff, months, days, hours };
}

export default function Countdown({ targetIso, compact = false }: { targetIso: string; compact?: boolean }) {
  const targetMs = new Date(targetIso).getTime();
  // Computed only after mount (not during the server-rendered pass) so the
  // ticking value never mismatches between server and client render.
  const [parts, setParts] = useState<ReturnType<typeof getParts> | null>(null);

  useEffect(() => {
    const tick = () => setParts(getParts(targetMs));
    const firstTick = setTimeout(tick, 0);
    // Hours is the finest unit shown, so a per-minute tick is plenty.
    const id = setInterval(tick, 60_000);
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
        {parts.months}mo {parts.days}d {parts.hours}h
      </span>
    );
  }

  return (
    <div className="flex justify-center gap-3 text-center sm:gap-6">
      {[
        ["Months", parts.months],
        ["Days", parts.days],
        ["Hours", parts.hours],
      ].map(([label, value]) => (
        <div key={label as string} className="w-14 sm:w-16">
          <div className="text-2xl font-semibold text-accent sm:text-4xl">{value}</div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">{label}</div>
        </div>
      ))}
    </div>
  );
}
