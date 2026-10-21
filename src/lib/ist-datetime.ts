// Shared helpers for converting between a <input type="datetime-local"> value
// and a timestamptz stored/interpreted as India Standard Time.

export function toIstTimestamp(datetimeLocalValue: string) {
  return `${datetimeLocalValue}:00+05:30`;
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
