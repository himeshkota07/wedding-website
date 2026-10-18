import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getHomeHero } from "@/lib/site-settings";
import { findLinkByCode } from "@/lib/invite-links";
import InvitationPage from "@/components/InvitationPage";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const hero = await getHomeHero();
  return {
    title: `${hero.bride_name} & ${hero.groom_name}`,
    description: `Join us as we celebrate the wedding of ${hero.bride_name} & ${hero.groom_name}.`,
    // Secret invitation links must never turn up in search results.
    robots: { index: false, follow: false },
  };
}

/** A guest list's secret link. An unknown code goes to the plain address, which shows the least. */
export default async function InviteLinkPage({ params }: PageProps<"/i/[code]">) {
  const { code } = await params;
  const link = await findLinkByCode(code);
  if (!link) redirect("/");
  return <InvitationPage link={link} />;
}
