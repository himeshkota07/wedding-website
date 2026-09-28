/** The pieces of a date as the printed invite sets them: a large day numeral beside weekday / month / time. */
export type DateParts = { day: string; weekday?: string; month?: string; time?: string };

const TZ = "Asia/Kolkata";

export function partsFromIso(iso: string): DateParts | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const fmt = (options: Intl.DateTimeFormatOptions) => date.toLocaleString("en-IN", { timeZone: TZ, ...options });
  return {
    day: fmt({ day: "2-digit" }),
    weekday: fmt({ weekday: "long" }),
    month: fmt({ month: "long" }),
    time: fmt({ hour: "numeric", minute: "2-digit" }).toLowerCase(),
  };
}

/** Best-effort read of a free-text label such as "Sunday, 06 September · 10:30 am". */
export function partsFromLabel(label: string): DateParts | null {
  const match = label.match(/^\s*(?:([A-Za-z]+day)[,\s]+)?(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:\s+\d{4})?\s*(?:[·|,-]\s*(.+))?$/);
  if (!match) return null;
  const [, weekday, day, month, time] = match;
  return { day: day.padStart(2, "0"), weekday, month, time: time?.trim() };
}

export function dateParts(iso: string | null | undefined, label: string): DateParts | null {
  return (iso ? partsFromIso(iso) : null) ?? partsFromLabel(label);
}
