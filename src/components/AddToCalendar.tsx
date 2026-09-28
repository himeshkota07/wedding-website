import { CalendarPlus, Download } from "lucide-react";
import { buildGoogleCalendarUrl, buildIcsDataUrl, type CalendarEvent } from "@/lib/calendar";

const linkClass =
  "inline-flex h-10 items-center gap-2 rounded-full border border-ink/25 px-4 text-sm font-medium text-ink transition-colors hover:border-kumkum hover:text-kumkum";

export default function AddToCalendar(event: CalendarEvent) {
  const filename = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;

  return (
    <div className="flex flex-wrap gap-2">
      <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <CalendarPlus size={16} />
        Google Calendar
      </a>
      <a href={buildIcsDataUrl(event)} download={filename} className={linkClass}>
        <Download size={16} />
        Apple / Outlook
      </a>
    </div>
  );
}
