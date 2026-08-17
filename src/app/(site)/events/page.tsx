import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import Countdown from "@/components/Countdown";
import AddToCalendar from "@/components/AddToCalendar";

export const revalidate = 60;

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  theme_color: string | null;
  special_instructions: string | null;
  venue: { name: string; address: string } | { name: string; address: string }[] | null;
};

function venue(v: EventRow["venue"]) {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default async function EventsPage() {
  const { data: events } = await supabase
    .from("events")
    .select("id, name, description, event_date, theme_color, special_instructions, venue:venues(name, address)")
    .order("sort_order", { ascending: true })
    .returns<EventRow[]>();

  return (
    <PageSection
      title="Events"
      subtitle="One entry per function — Mehendi, Haldi, Sangeet, Wedding, Reception"
    >
      {!events?.length && <p>No events have been added yet.</p>}
      <div className="space-y-6">
        {events?.map((event) => {
          const v = venue(event.venue);
          return (
            <div
              key={event.id}
              className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
              style={{ borderLeft: `4px solid ${event.theme_color ?? "#3e6690"}` }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-semibold text-zinc-900">{event.name}</h2>
                <span className="text-sm text-zinc-500">
                  {new Date(event.event_date).toLocaleString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <Countdown targetIso={event.event_date} compact />
              {event.description && <p className="mt-1 text-zinc-600">{event.description}</p>}
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-zinc-600 sm:grid-cols-2">
                {v && (
                  <div>
                    <dt className="inline font-medium text-zinc-800">Venue: </dt>
                    <dd className="inline">{v.name}</dd>
                  </div>
                )}
                {event.special_instructions && (
                  <div className="sm:col-span-2">
                    <dt className="inline font-medium text-zinc-800">Note: </dt>
                    <dd className="inline">{event.special_instructions}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-3">
                <AddToCalendar
                  title={event.name}
                  description={event.description}
                  location={v?.address}
                  startIso={event.event_date}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
}
