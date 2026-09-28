import { getHomeHero } from "@/lib/site-settings";
import SiteQrCode from "@/components/SiteQrCode";
import Hero from "@/components/sections/Hero";
import OurStorySection from "@/components/sections/OurStorySection";
import EventsSection from "@/components/sections/EventsSection";
import VenueSection from "@/components/sections/VenueSection";
import FamilySection from "@/components/sections/FamilySection";
import GallerySection from "@/components/sections/GallerySection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";

export const revalidate = 60;

export default async function Home() {
  const hero = await getHomeHero();

  return (
    <>
      <Hero hero={hero} qrCode={<SiteQrCode />} />

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
