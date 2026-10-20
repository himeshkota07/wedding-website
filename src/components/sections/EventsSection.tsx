import PageSection from "@/components/PageSection";
import { createAdminSupabase } from "@/lib/supabase-admin";
import type { LinkScope } from "@/lib/invite-links";
import { partsFromIso } from "@/lib/date-display";
import Countdown from "@/components/Countdown";
import AddToCalendar from "@/components/AddToCalendar";
import { Marigold } from "@/components/ui/motifs";
import { getMusic } from "@/lib/music";

type Venue = { name: string; address: string };

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  event_end: string | null;
  time_label: string | null;
  special_instructions: string | null;
  venue: Venue | Venue[] | null;
};

function venue(v: EventRow["venue"]) {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const TBA = "To be announced";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-hairline pt-2">
      <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}

/**
 * Where card i of n sits, so every row is either full or centred and no card
 * is left alone at the left edge (adding a fourth event left "Reception" by
 * itself on a second row). Tablets use a 4-track grid with cards two tracks
 * wide; desktops a 6-track grid with cards two tracks wide (three a row), or
 * three tracks wide for exactly four events, which reads better as 2 x 2 than
 * as 3 + 1. A short last row is pushed in by one track to centre it. Each
 * branch returns literal class names so Tailwind can see them.
 */
function cardPlacement(i: number, n: number) {
  const tablet = n % 2 === 1 && i === n - 1 ? "sm:col-span-2 sm:col-start-2" : "sm:col-span-2";
  if (n === 4) return `${tablet} lg:col-span-3 lg:col-start-auto`;
  const lastRow = n % 3;
  if (lastRow === 1 && i === n - 1) return `${tablet} lg:col-span-2 lg:col-start-3`;
  if (lastRow === 2 && i === n - 2) return `${tablet} lg:col-span-2 lg:col-start-2`;
  return `${tablet} lg:col-span-2 lg:col-start-auto`;
}

type CardProps = {
  className?: string;
  day: React.ReactNode;
  month?: string;
  weekday?: string;
  name: string;
  aside?: React.ReactNode;
  description?: string | null;
  when: React.ReactNode;
  where: React.ReactNode;
  note: React.ReactNode;
  footer?: React.ReactNode;
  /** This event's song on phones ("" for none: the Events song plays). See BackgroundMusic. */
  song?: string;
};

/**
 * Every event gets the same card: painted umbrellas and jasmine hanging
 * over a scalloped arch, with the details written inside the arch. The same
 * fields sit in the same places on every card, so a guest who has read one
 * knows where to look on the rest.
 *
 * The art is a background pinned to the top at full width; the card keeps
 * the art's proportions but grows past them when an event has a lot to
 * say. Behind the art, a 67px strip of its lower body (exactly two lace
 * scallops, and the art ends on a strip boundary) repeats down, so the lace
 * edge carries on seamlessly. The top padding (a % of the card's width)
 * drops the text to just inside the arch's crown. min-w-0 matters: in a grid,
 * a tall card would otherwise widen itself to keep its aspect ratio. And
 * self-stretch: a grid item with an aspect ratio doesn't stretch by default,
 * so cards in a row ended at different heights; now each row matches its
 * tallest card (the lace strip keeps repeating to fill the extra height).
 * w-full pins the width to the column: with a stretched height alone, the
 * aspect ratio widened each card into its neighbour.
 */
function UmbrellaCard(p: CardProps) {
  return (
    <li
      data-event-song={p.song}
      className={`${p.className ?? ""} aspect-[816/1273] w-full min-w-0 self-stretch rounded-[1.75rem] bg-[#fbfef7] bg-[url(/theme/event-card.jpg),url(/theme/event-card-body.jpg)] bg-[length:100%_auto] bg-top [background-repeat:no-repeat,repeat-y] shadow-[0_10px_30px_-12px_rgb(74_42_29/0.35)] ring-1 ring-ink/10`}
    >
      <div className="flex flex-col items-center px-[11%] pb-8 pt-[58%] text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {[p.weekday, p.month].filter(Boolean).join(" · ") || "\u00a0"}
        </p>
        <span className="font-display text-6xl leading-tight tabular-nums text-kumkum">{p.day}</span>
        <h3 className="mt-1 font-display text-3xl leading-tight text-ink">{p.name}</h3>
        {p.aside && <p className="mt-1 text-ink-soft">{p.aside}</p>}
        {p.description && <p className="mt-3 text-ink-soft">{p.description}</p>}

        <dl className="mt-5 grid w-full gap-y-3">
          <Field label="When">{p.when}</Field>
          <Field label="Where">{p.where}</Field>
          <Field label="Please note">{p.note}</Field>
        </dl>

        {p.footer && <div className="mt-6 [&>div]:justify-center">{p.footer}</div>}
      </div>
    </li>
  );
}

/**
 * Only the events this invitation link shows. Read with the server's key:
 * events aren't publicly readable, so a guest can't list the ones their link
 * leaves out.
 */
export default async function EventsSection({ scope }: { scope: LinkScope }) {
  const [{ data: events }, music] = await Promise.all([
    createAdminSupabase()
      .from("events")
      .select("id, name, description, event_date, event_end, time_label, special_instructions, venue:venues(name, address)")
      .order("sort_order", { ascending: true })
      .returns<EventRow[]>(),
    getMusic(),
  ]);

  const normalized = (events ?? [])
    .filter((event) => scope.eventIds.has(event.id))
    .map((event) => ({ ...event, venue: venue(event.venue) }));

  return (
    // The Events section's song takes over from the background song while it's on screen.
    <div data-music-section data-song={music.events_section?.url}>
      <PageSection
        id="events"
        tone="paper"
        title="The Events"
        subtitle="Every event, when and where, with anything you should know before you come."
      >
        <ol className="grid gap-8 sm:grid-cols-4 lg:grid-cols-6">
          {normalized.length === 0 && (
            <UmbrellaCard
              className={cardPlacement(0, 1)}
              day={
                <span className="flex items-center gap-2 text-4xl">
                  <Marigold size={28} />
                  Soon
                </span>
              }
              name="The schedule is being finalised"
              description="Each event will be set out here, like this, as soon as its date is fixed."
              when={TBA}
              where={TBA}
              note={TBA}
            />
          )}
          {normalized.map((event, i) => {
            const when = partsFromIso(event.event_date);
            const v = event.venue;
            return (
              <UmbrellaCard
                key={event.id}
                className={cardPlacement(i, normalized.length)}
                day={when?.day ?? "—"}
                month={when?.month}
                weekday={when?.weekday}
                name={event.name}
                song={music.events[event.id]?.url ?? ""}
                aside={<Countdown targetIso={event.event_date} compact />}
                description={event.description}
                when={event.time_label || when?.time || TBA}
                where={
                  v ? (
                    <>
                      {v.name}
                      <span className="block text-sm text-ink-soft">{v.address}</span>
                    </>
                  ) : (
                    TBA
                  )
                }
                note={event.special_instructions ?? "Nothing special"}
                footer={
                  <AddToCalendar
                    title={event.name}
                    description={event.description}
                    location={v?.address}
                    startIso={event.event_date}
                    endIso={event.event_end}
                  />
                }
              />
            );
          })}
        </ol>
      </PageSection>
    </div>
  );
}
