import { getHomeHero } from "@/lib/site-settings";
import WeddingDancer from "@/components/ui/WeddingDancer";

export default async function Footer() {
  const hero = await getHomeHero();

  return (
    <footer className="border-t-2 border-brass bg-ivory px-5 pb-28 pt-14 text-center text-ink">
      <div className="flex items-end justify-center gap-4 sm:gap-10">
        <WeddingDancer variant="bride" size={112} />
        <div className="pb-3">
          <p className="font-script text-4xl text-kumkum sm:text-5xl">
            {hero.bride_name} &amp; {hero.groom_name}
          </p>
          <p className="mt-2 text-ink-soft">With love, from both our families.</p>
        </div>
        <WeddingDancer variant="groom" size={112} />
      </div>
    </footer>
  );
}
