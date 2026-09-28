import Image from "next/image";
import type { HomeHero } from "@/lib/site-settings";
import { dateParts } from "@/lib/date-display";
import Countdown from "@/components/Countdown";
import HeroActions from "@/components/sections/HeroActions";

function splitLocation(location: string) {
  const [place, ...rest] = location.split(",").map((s) => s.trim());
  return { place, area: rest.join(", ") };
}

/**
 * The first page of the printed invite, standing up: the carved pillar with
 * its banana stem and brass elephant on the left, marigold strings hanging
 * from the beam, and the names cascading in the card's own brush lettering.
 */
export default function Hero({ hero }: { hero: HomeHero }) {
  const when = dateParts(hero.wedding_datetime, hero.wedding_date_label);
  const { place, area } = splitLocation(hero.location);

  return (
    <div id="top" className="relative isolate -mt-3 overflow-hidden bg-paper">
      {/* The invite's own watercolour art; its paper was lifted to white so it multiplies into this page's paper. */}
      <Image
        src="/invite/pillar-vignette.jpg"
        alt=""
        width={520}
        height={1542}
        priority
        className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden h-full w-auto mix-blend-multiply sm:block"
      />
      {/* On phones the card's lower corner -- pillar foot, elephant, flower pots -- sits beneath the text, as on the card. */}
      <Image
        src="/invite/pillar-foot.jpg"
        alt=""
        width={520}
        height={842}
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-[21rem] w-auto mix-blend-multiply [mask-image:linear-gradient(to_bottom,transparent,black_28%)] sm:hidden"
      />
      <Image
        src="/invite/garland.jpg"
        alt=""
        width={283}
        height={470}
        priority
        className="animate-sway pointer-events-none absolute right-1 top-3 -z-10 h-28 w-auto mix-blend-multiply sm:right-[4%] sm:h-48 lg:right-[6%] lg:h-72"
      />

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-5 pb-[21rem] pt-14 sm:pb-20 sm:pl-[34%] sm:pr-[20%] lg:pl-[30%] lg:pr-8">
        <Image
          src="/invite/ganesha.jpg"
          alt=""
          width={100}
          height={115}
          className="mb-6 h-11 w-auto self-start mix-blend-multiply sm:h-14"
        />

        <p className="font-display text-xl text-ink-soft sm:text-2xl">You are warmly invited to the wedding of</p>

        <h1 className="mt-4 font-script leading-[1.05] text-ink">
          <span className="block text-[clamp(3.25rem,10vw,6rem)]">{hero.bride_name}</span>
          <span className="block pl-[18%] text-[clamp(2.25rem,6vw,3.75rem)] text-kumkum">&amp;</span>
          <span className="block pl-[30%] text-[clamp(3.25rem,10vw,6rem)]">{hero.groom_name}</span>
        </h1>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          {when ? (
            <div className="flex items-center gap-4">
              <span className="font-script text-6xl leading-none text-ink sm:text-7xl">{when.day}</span>
              <span className="h-16 w-px bg-brass" aria-hidden />
              <span className="font-display text-lg leading-snug text-ink-soft">
                {when.weekday && <span className="block">{when.weekday}</span>}
                {when.month && <span className="block">{when.month}</span>}
                {when.time && <span className="block">{when.time}</span>}
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

        {hero.welcome_note && <p className="mt-8 max-w-xl text-lg text-ink-soft">{hero.welcome_note}</p>}

        {hero.wedding_datetime && (
          <div className="mt-10">
            <Countdown targetIso={hero.wedding_datetime} />
          </div>
        )}

        <HeroActions />
      </div>
    </div>
  );
}
