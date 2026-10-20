import { getHomeHero } from "@/lib/site-settings";
import { getLinkScope, linkUrl, type InviteLink } from "@/lib/invite-links";
import SiteQrCode from "@/components/SiteQrCode";
import IntroSequence from "@/components/IntroSequence";
import Hero from "@/components/sections/Hero";
import OurStorySection from "@/components/sections/OurStorySection";
import EventsSection from "@/components/sections/EventsSection";
import VenueSection from "@/components/sections/VenueSection";
import GallerySection from "@/components/sections/GallerySection";
import WishesSection from "@/components/sections/WishesSection";
import ContactSection from "@/components/sections/ContactSection";
import SectionMenu from "@/components/SectionMenu";

/**
 * The whole invitation, as one guest list sees it. The plain address and
 * every secret /i/<code> link render this with their own link: events,
 * venues and the QR code follow the link; everything else is shared.
 */
export default async function InvitationPage({ link }: { link: InviteLink }) {
  const [hero, scope] = await Promise.all([getHomeHero(), getLinkScope(link)]);

  return (
    <>
      <IntroSequence brideName={hero.bride_name} groomName={hero.groom_name} />
      <Hero hero={hero} eventDates={scope.eventDates} />

      <OurStorySection />
      <EventsSection scope={scope} />
      <WishesSection />
      <VenueSection scope={scope} />
      <GallerySection />
      <ContactSection qrCode={<SiteQrCode url={linkUrl(link)} />} />
      <SectionMenu />
    </>
  );
}
