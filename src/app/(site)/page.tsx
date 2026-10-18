import type { Metadata } from "next";
import { getHomeHero } from "@/lib/site-settings";
import { resolveLink } from "@/lib/invite-links";
import InvitationPage from "@/components/InvitationPage";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getHomeHero();
  return {
    title: `${hero.bride_name} & ${hero.groom_name}`,
    description: `Join us as we celebrate the wedding of ${hero.bride_name} & ${hero.groom_name}.`,
  };
}

/** The plain address: the invitation link with the smallest set of events. */
export default async function Home() {
  return <InvitationPage link={await resolveLink(null)} />;
}
