import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  dress_code: string | null;
  theme_color: string | null;
  special_instructions: string | null;
  venue: { name: string } | { name: string }[] | null;
};

function venueName(venue: EventRow["venue"]) {
  if (!venue) return null;
  return Array.isArray(venue) ? venue[0]?.name : venue.name;
}

export default async function EventsPage() {
  const { data: events } = await supabase
    .from("events")
    .select("id, name, description, event_date, dress_code, theme_color, special_instructions, venue:venues(name)")
    .order("sort_order", { ascending: true })
    .returns<EventRow[]>();

  return (
    <PageSection
      title="Events"
      subtitle="One entry per function — Mehendi, Haldi, Sangeet, Wedding, Reception"
    >
      {!events?.length && <p>No events have been added yet.</p>}
      <div className="space-y-6">
        {events?.map((event) => (
          <div
            key={event.id}
            className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
            style={{ borderLeft: `4px solid ${event.theme_color ?? "#8b3a5c"}` }}
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
            {event.description && <p className="mt-1 text-zinc-600">{event.description}</p>}
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-zinc-600 sm:grid-cols-2">
              {venueName(event.venue) && (
                <div>
                  <dt className="inline font-medium text-zinc-800">Venue: </dt>
                  <dd className="inline">{venueName(event.venue)}</dd>
                </div>
              )}
              {event.dress_code && (
                <div>
                  <dt className="inline font-medium text-zinc-800">Dress code: </dt>
                  <dd className="inline">{event.dress_code}</dd>
                </div>
              )}
              {event.special_instructions && (
                <div className="sm:col-span-2">
                  <dt className="inline font-medium text-zinc-800">Note: </dt>
                  <dd className="inline">{event.special_instructions}</dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
