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
 * The painted couple standing at the foot of the page -- her henna'd feet on
 * tiptoe beside his, petals scattered around them -- with the invitation
 * written above them like the words on a card.
 */
export default function Hero({ hero }: { hero: HomeHero }) {
  const when = dateParts(hero.wedding_datetime, hero.wedding_date_label);
  const { place, area } = splitLocation(hero.location);

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
          {when ? (
            <div className="flex items-center gap-4 text-left">
              <span className="font-script text-7xl font-bold leading-none text-ink sm:text-8xl">{when.day}</span>
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
