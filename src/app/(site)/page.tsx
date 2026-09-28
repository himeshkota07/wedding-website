import type { Metadata } from "next";
import { getHomeHero } from "@/lib/site-settings";
import SiteQrCode from "@/components/SiteQrCode";
import IntroSequence from "@/components/IntroSequence";
import Hero from "@/components/sections/Hero";
import OurStorySection from "@/components/sections/OurStorySection";
import EventsSection from "@/components/sections/EventsSection";
import VenueSection from "@/components/sections/VenueSection";
import FamilySection from "@/components/sections/FamilySection";
import GallerySection from "@/components/sections/GallerySection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getHomeHero();
  return {
    title: `${hero.bride_name} & ${hero.groom_name}`,
    description: `Join us as we celebrate the wedding of ${hero.bride_name} & ${hero.groom_name}.`,
  };
}

export default async function Home() {
  const hero = await getHomeHero();

  return (
    <>
      <IntroSequence brideName={hero.bride_name} groomName={hero.groom_name} />
      <Hero hero={hero} />

      <OurStorySection />
      <EventsSection />
      <VenueSection />
      <FamilySection />
      <GallerySection />
      <FaqSection />
      <ContactSection qrCode={<SiteQrCode />} />
    </>
  );
}
