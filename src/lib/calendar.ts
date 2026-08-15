export type CalendarEvent = {
  title: string;
  description?: string | null;
  location?: string | null;
  startIso: string;
  durationHours?: number;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toUtcIcsDate(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcsText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function getRange(e: CalendarEvent) {
  const start = new Date(e.startIso);
  const end = new Date(start.getTime() + (e.durationHours ?? 2) * 3_600_000);
  return { start, end };
}

export function buildGoogleCalendarUrl(e: CalendarEvent) {
  const { start, end } = getRange(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${toUtcIcsDate(start)}/${toUtcIcsDate(end)}`,
    details: e.description ?? "",
    location: e.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsDataUrl(e: CalendarEvent) {
  const { start, end } = getRange(e);
  const uid = `${start.getTime()}-${e.title.replace(/\s+/g, "-")}@wedding`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Website//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUtcIcsDate(new Date())}`,
    `DTSTART:${toUtcIcsDate(start)}`,
    `DTEND:${toUtcIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(e.title)}`,
    e.description ? `DESCRIPTION:${escapeIcsText(e.description)}` : null,
    e.location ? `LOCATION:${escapeIcsText(e.location)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines)}`;
}
