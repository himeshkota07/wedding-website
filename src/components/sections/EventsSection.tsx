import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import EventsTimeline from "@/components/sections/EventsTimeline";

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

export default async function EventsSection() {
  const { data: events } = await supabase
    .from("events")
    .select("id, name, description, event_date, theme_color, special_instructions, venue:venues(name, address)")
    .order("sort_order", { ascending: true })
    .returns<EventRow[]>();

  const normalized = (events ?? []).map((event) => ({ ...event, venue: venue(event.venue) }));

  return (
    <PageSection
      id="events"
      title="Events"
      subtitle="One entry per function — Mehendi, Haldi, Sangeet, Wedding, Reception"
    >
      {!normalized.length && <p>No events have been added yet.</p>}
      {normalized.length > 0 && <EventsTimeline events={normalized} />}
    </PageSection>
  );
}
