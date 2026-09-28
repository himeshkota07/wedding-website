import { Calendar, Download } from "lucide-react";
import { buildGoogleCalendarUrl, buildIcsDataUrl, type CalendarEvent } from "@/lib/calendar";

export default function AddToCalendar(event: CalendarEvent) {
  const filename = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <a
        href={buildGoogleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-md border border-hairline/60 px-2 py-1 font-medium text-foreground/60 transition-colors hover:border-accent hover:text-accent"
      >
        <Calendar size={13} />
        Add to Google Calendar
      </a>
      <a
        href={buildIcsDataUrl(event)}
        download={filename}
        className="flex items-center gap-1.5 rounded-md border border-hairline/60 px-2 py-1 font-medium text-foreground/60 transition-colors hover:border-accent hover:text-accent"
      >
        <Download size={13} />
        Apple / Outlook (.ics)
      </a>
    </div>
  );
}
