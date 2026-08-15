import { buildGoogleCalendarUrl, buildIcsDataUrl, type CalendarEvent } from "@/lib/calendar";

export default function AddToCalendar(event: CalendarEvent) {
  const filename = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <a
        href={buildGoogleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-black/20 px-2 py-1 font-medium text-zinc-600 hover:border-accent hover:text-accent"
      >
        Add to Google Calendar
      </a>
      <a
        href={buildIcsDataUrl(event)}
        download={filename}
        className="rounded-md border border-black/20 px-2 py-1 font-medium text-zinc-600 hover:border-accent hover:text-accent"
      >
        Apple / Outlook (.ics)
      </a>
    </div>
  );
}
