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

/** A dab of turmeric, as families mark the corners of a wedding patrika. */
function TurmericDab({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={`absolute h-5 w-5 ${className}`}>
      <path d="M10,1 C15,1 19,5 18.5,10 C18,15 14,19 9.5,18.5 C4.5,18 1,14.5 1.5,9.5 C2,4.5 5.5,1 10,1 Z" fill="var(--turmeric)" />
      <circle cx="10" cy="10" r="3" fill="var(--kumkum)" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-hairline pt-2">
      <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}

type SlipProps = {
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
 * Every function is set out as the same slip, with the same fields in the
 * same places, so a guest who has read one knows where to look on the rest.
 * Depth is a second sheet of paper laid underneath, not a shadow.
 */
function Slip(p: SlipProps) {
  return (
    <li className="relative isolate">
      <div aria-hidden className="absolute inset-0 -z-10 translate-x-2 translate-y-2.5 rotate-[0.7deg] bg-paper-deep" />
      <div className="relative bg-paper p-2">
        <TurmericDab className="-left-2 -top-2" />
        <TurmericDab className="-right-2 -top-2" />
        <TurmericDab className="-bottom-2 -left-2" />
        <TurmericDab className="-bottom-2 -right-2" />

        <div className="grid border border-brass/60 sm:grid-cols-[10rem_1fr]">
          <div className="flex items-center gap-4 border-b border-dashed border-brass px-5 py-4 sm:flex-col sm:items-start sm:justify-center sm:gap-1 sm:border-b-0 sm:border-r sm:py-6">
            <span className="font-script text-6xl leading-none text-kumkum">{p.day}</span>
            <span className="font-display text-lg leading-snug text-ink-soft">
              {p.month && <span className="block">{p.month}</span>}
              {p.weekday && <span className="block">{p.weekday}</span>}
            </span>
          </div>

          <div className="px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-display text-3xl text-ink">{p.name}</h3>
              {p.aside && <span className="text-ink-soft">{p.aside}</span>}
            </div>
            {p.description && <p className="mt-2 max-w-[60ch] text-ink-soft">{p.description}</p>}

            <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field label="When">{p.when}</Field>
              <Field label="Where">{p.where}</Field>
              <Field label="Colour">{p.colour}</Field>
              <Field label="Please note">{p.note}</Field>
            </dl>

            {p.footer && <div className="mt-6">{p.footer}</div>}
          </div>
        </div>
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
      tone="turmeric"
      title="The Functions"
      subtitle="Every function, when and where, with anything you should know before you come."
    >
      <ol className="space-y-12">
        {normalized.length === 0 && (
          <Slip
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
            <Slip
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
