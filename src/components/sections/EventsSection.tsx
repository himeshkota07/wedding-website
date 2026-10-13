import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import { partsFromIso } from "@/lib/date-display";
import Countdown from "@/components/Countdown";
import AddToCalendar from "@/components/AddToCalendar";
import { Marigold } from "@/components/ui/motifs";

type Venue = { name: string; address: string };

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  theme_color: string | null;
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

type CardProps = {
  day: React.ReactNode;
  month?: string;
  weekday?: string;
  name: string;
  aside?: React.ReactNode;
  description?: string | null;
  when: React.ReactNode;
  where: React.ReactNode;
  colour: React.ReactNode;
  note: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Every function gets the same card: painted umbrellas and jasmine hanging
 * over a scalloped arch, with the details written inside the arch. The same
 * fields sit in the same places on every card, so a guest who has read one
 * knows where to look on the rest.
 *
 * The art is a background pinned to the top at full width; the card keeps
 * the art's proportions but grows past them when a function has a lot to
 * say. Behind the art, a 67px strip of its lower body (exactly two lace
 * scallops, and the art ends on a strip boundary) repeats down, so the lace
 * edge carries on seamlessly. The top padding (a % of the card's width)
 * drops the text to just inside the arch's crown. min-w-0 matters: in a grid,
 * a tall card would otherwise widen itself to keep its aspect ratio.
 */
function UmbrellaCard(p: CardProps) {
  return (
    <li className="aspect-[816/1273] min-w-0 rounded-[1.75rem] bg-[#fbfef7] bg-[url(/theme/event-card.jpg),url(/theme/event-card-body.jpg)] bg-[length:100%_auto] bg-top [background-repeat:no-repeat,repeat-y] shadow-[0_10px_30px_-12px_rgb(74_42_29/0.35)] ring-1 ring-ink/10">
      <div className="flex flex-col items-center px-[11%] pb-8 pt-[58%] text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {[p.weekday, p.month].filter(Boolean).join(" · ") || "\u00a0"}
        </p>
        <span className="font-script text-7xl font-bold leading-tight text-kumkum">{p.day}</span>
        <h3 className="mt-1 font-display text-3xl leading-tight text-ink">{p.name}</h3>
        {p.aside && <p className="mt-1 text-ink-soft">{p.aside}</p>}
        {p.description && <p className="mt-3 text-ink-soft">{p.description}</p>}

        <dl className="mt-5 grid w-full gap-y-3">
          <Field label="When">{p.when}</Field>
          <Field label="Where">{p.where}</Field>
          <Field label="Colour">{p.colour}</Field>
          <Field label="Please note">{p.note}</Field>
        </dl>

        {p.footer && <div className="mt-6 [&>div]:justify-center">{p.footer}</div>}
      </div>
    </li>
  );
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
      tone="deep"
      title="The Functions"
      subtitle="Every function, when and where, with anything you should know before you come."
    >
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {normalized.length === 0 && (
          <UmbrellaCard
            day={
              <span className="flex items-center gap-2 text-4xl">
                <Marigold size={28} />
                Soon
              </span>
            }
            name="The schedule is being finalised"
            description="Each function will be set out here, like this, as soon as its date is fixed."
            when={TBA}
            where={TBA}
            colour={TBA}
            note={TBA}
          />
        )}
        {normalized.map((event) => {
          const when = partsFromIso(event.event_date);
          const v = event.venue;
          return (
            <UmbrellaCard
              key={event.id}
              day={when?.day ?? "—"}
              month={when?.month}
              weekday={when?.weekday}
              name={event.name}
              aside={<Countdown targetIso={event.event_date} compact />}
              description={event.description}
              when={when?.time ?? TBA}
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
              colour={
                event.theme_color ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-5 w-5 rounded-full ring-1 ring-ink/20"
                      style={{ background: event.theme_color }}
                    />
                    The colour for this function
                  </span>
                ) : (
                  "Any festive colour"
                )
              }
              note={event.special_instructions ?? "Nothing special"}
              footer={
                <AddToCalendar
                  title={event.name}
                  description={event.description}
                  location={v?.address}
                  startIso={event.event_date}
                />
              }
            />
          );
        })}
      </ol>
    </PageSection>
  );
}
