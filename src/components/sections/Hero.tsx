import Image from "next/image";
import type { HomeHero } from "@/lib/site-settings";
import { dateParts, partsFromIso } from "@/lib/date-display";
import Countdown from "@/components/Countdown";
import HeroActions from "@/components/sections/HeroActions";

function splitLocation(location: string) {
  const [place, ...rest] = location.split(",").map((s) => s.trim());
  return { place, area: rest.join(", ") };
}

/**
 * The painted couple standing at the foot of the page -- her henna'd feet on
 * tiptoe beside his, petals scattered around them -- with the invitation
 * written above them like the words on a card.
 */
export default function Hero({ hero, eventDates = [] }: { hero: HomeHero; eventDates?: string[] }) {
  const when = dateParts(hero.wedding_datetime, hero.wedding_date_label);
  const { place, area } = splitLocation(hero.location);
  const welcomeParagraphs = (hero.welcome_note ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // When this link's events span more than one day, the date reads as a
  // range ("12 | 13", "Sat & Sun") from its first event's day to its last.
  const first = eventDates.length ? partsFromIso(eventDates[0]) : null;
  const last = eventDates.length ? partsFromIso(eventDates[eventDates.length - 1]) : null;
  const span =
    first && last && (first.day !== last.day || first.month !== last.month)
      ? {
          weekday: `${first.weekday?.slice(0, 3)} & ${last.weekday?.slice(0, 3)}`,
          month: first.month === last.month ? first.month : `${first.month?.slice(0, 3)} – ${last.month?.slice(0, 3)}`,
        }
      : null;

  return (
    <div id="top" className="relative isolate -mt-3 overflow-hidden bg-paper">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 pt-14 text-center sm:pt-20">
        <Image src="/invite/ganesha.jpg" alt="" width={100} height={115} className="mb-6 h-12 w-auto mix-blend-multiply sm:h-14" />

        <p className="text-xl italic text-ink-soft sm:text-2xl">You are warmly invited to the wedding of</p>

        <h1 className="mt-4 font-script leading-[1.05] text-ink">
          <span className="block text-[clamp(4.5rem,15vw,8rem)]">{hero.bride_name}</span>
          <span className="block text-[clamp(3rem,8vw,4.5rem)] text-kumkum">&amp;</span>
          <span className="block text-[clamp(4.5rem,15vw,8rem)]">{hero.groom_name}</span>
        </h1>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {span && first && last ? (
            <div className="flex items-center gap-3 text-left sm:gap-4">
              <span className="font-display text-[2.75rem] leading-none tabular-nums text-ink sm:text-[3.25rem]">
                {first.day}
                <span className="text-brass">,</span>
                {last.day}
              </span>
              <span className="h-12 w-px bg-brass sm:h-14" aria-hidden />
              <span className="font-display text-lg leading-snug text-ink-soft">
                <span className="block">{span.weekday}</span>
                {span.month && <span className="block">{span.month}</span>}
              </span>
            </div>
          ) : when ? (
            <div className="flex items-center gap-4 text-left">
              <span className="font-display text-6xl leading-none tabular-nums text-ink sm:text-7xl">{when.day}</span>
              <span className="h-12 w-px bg-brass sm:h-14" aria-hidden />
              <span className="font-display text-lg leading-snug text-ink-soft">
                {when.weekday && <span className="block">{when.weekday}</span>}
                {when.month && <span className="block">{when.month}</span>}
              </span>
            </div>
          ) : (
            <p className="font-display text-xl text-ink-soft">{hero.wedding_date_label}</p>
          )}
          {place && (
            <p className="leading-snug">
              <span className="block font-display text-2xl uppercase tracking-[0.14em] text-ink">{place}</span>
              {area && <span className="block text-lg text-ink-soft">{area}</span>}
            </p>
          )}
        </div>

        {/* Each line of the note, as typed in admin, is its own paragraph. */}
        {welcomeParagraphs.length > 0 && (
          <div className="mt-8 max-w-xl space-y-3 text-lg text-ink-soft">
            {welcomeParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}

        {hero.wedding_datetime && (
          <div className="mt-10">
            <Countdown targetIso={hero.wedding_datetime} />
          </div>
        )}

        <HeroActions />
      </div>

      {/* The painting's paper was lifted to white so it multiplies into this page's paper; its cropped top edge fades in. */}
      <Image
        src="/theme/couple-feet.jpg"
        alt="A watercolour of the bride's henna-painted feet beside the groom's, with flower petals scattered around them"
        width={714}
        height={506}
        preload
        sizes="(min-width: 768px) 720px, 100vw"
        className="mx-auto mt-6 block w-full max-w-[45rem] mix-blend-multiply [mask-image:linear-gradient(to_bottom,transparent,black_30%)]"
      />
    </div>
  );
}
