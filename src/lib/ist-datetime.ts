// Shared helpers for converting between a <input type="datetime-local"> value
// and a timestamptz stored/interpreted as India Standard Time.

export function toIstTimestamp(datetimeLocalValue: string) {
  return `${datetimeLocalValue}:00+05:30`;
}

/**
 * An event's end, from its start (a datetime-local value) and an <input
 * type="time"> value on the same day. An end before the start means the
 * event runs past midnight, so it lands on the next day. Blank, or the same
 * as the start -> null (no end shown).
 */
export function toIstEndTimestamp(startLocalValue: string, endTimeValue: string) {
  if (!endTimeValue || !startLocalValue) return null;
  const start = new Date(toIstTimestamp(startLocalValue));
  const end = new Date(`${startLocalValue.slice(0, 10)}T${endTimeValue}:00+05:30`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (end.getTime() === start.getTime()) return null;
  if (end < start) end.setTime(end.getTime() + 24 * 3_600_000);
  return end.toISOString();
}

/** "HH:mm" in India time, for an <input type="time">. */
export function toIstTime(iso: string | null | undefined) {
  return iso ? toIstDatetimeLocal(iso).slice(11) : "";
}

export function toIstDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
