import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import { getHomeHero } from "@/lib/site-settings";
import WishingToran from "@/components/sections/WishingToran";
import type { Wish } from "@/lib/wishes";

export default async function WishesSection() {
  const [{ data, error }, hero] = await Promise.all([
    supabase
      .from("wishes")
      .select("id, name, relation, message, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: true }),
    getHomeHero(),
  ]);
  if (error) console.error("[wishes] read failed:", error.message);

  return (
    <PageSection
      id="wishes"
      tone="deep"
      title="Wishes"
      subtitle={`Tie a wish to ${hero.bride_name} & ${hero.groom_name}'s toran. Every leaf stays here, and goes into a keepsake book for them after the wedding.`}
    >
      <WishingToran initialWishes={(data ?? []) as Wish[]} />
    </PageSection>
  );
}
