import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getHomeHero } from "@/lib/site-settings";
import { findLinkByCode, nameFromOldCode } from "@/lib/invite-links";
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

/**
 * A guest list's link. An old "name-xxxxx" address goes on to "/i/name"; any
 * other unknown code goes to the plain address, which shows the least.
 */
export default async function InviteLinkPage({ params }: PageProps<"/i/[code]">) {
  const { code } = await params;
  const link = await findLinkByCode(code);
  if (!link) {
    const name = nameFromOldCode(code);
    redirect(name && (await findLinkByCode(name)) ? `/i/${name}` : "/");
  }
  return <InvitationPage link={link} />;
}
