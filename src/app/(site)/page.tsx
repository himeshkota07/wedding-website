import Link from "next/link";
import { getHomeHero } from "@/lib/site-settings";
import Countdown from "@/components/Countdown";
import SiteQrCode from "@/components/SiteQrCode";
import OurStorySection from "@/components/sections/OurStorySection";
import EventsSection from "@/components/sections/EventsSection";
import VenueSection from "@/components/sections/VenueSection";
import FamilySection from "@/components/sections/FamilySection";
import GallerySection from "@/components/sections/GallerySection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";

export const revalidate = 60;

const quickNav = [
  { href: "#our-story", label: "Our Story", blurb: "How we met" },
  { href: "#events", label: "Events", blurb: "Full itinerary" },
  { href: "#venue", label: "Venue", blurb: "Getting there" },
  { href: "#family", label: "Family", blurb: "Meet the family" },
  { href: "#gallery", label: "Gallery", blurb: "Photos" },
  { href: "#faq", label: "FAQ & Chat", blurb: "Questions? Ask away" },
  { href: "#contact", label: "Contact", blurb: "Reach the coordinators" },
];

export default async function Home() {
  const hero = await getHomeHero();

  return (
    <>
      <div id="top" className="scroll-mt-20 flex flex-col items-center bg-accent-soft/40 px-6 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          We&apos;re getting married
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          {hero.bride_name} &amp; {hero.groom_name}
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          {hero.wedding_date_label} &middot; {hero.location}
        </p>
        {hero.welcome_note && <p className="mt-6 max-w-xl text-zinc-600">{hero.welcome_note}</p>}

        {hero.wedding_datetime && (
          <div className="mt-8">
            <Countdown targetIso={hero.wedding_datetime} />
          </div>
        )}

        <div className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {quickNav.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-lg border border-black/10 bg-white p-4 text-left shadow-sm transition hover:border-accent hover:shadow-md"
            >
              <div className="font-medium text-zinc-900">{s.label}</div>
              <div className="text-sm text-zinc-500">{s.blurb}</div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <SiteQrCode />
        </div>
      </div>

      <OurStorySection />
      <EventsSection />
      <VenueSection />
      <FamilySection />
      <GallerySection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
