import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import { getHomeHero } from "@/lib/site-settings";
import WishingToran from "@/components/sections/WishingToran";
import { WISH_COLUMNS, LEGACY_WISH_COLUMNS, isMissingColumnError, withWishDefaults, type Wish } from "@/lib/wishes";

async function readWishes() {
  const read = (columns: string) =>
    supabase.from("wishes").select(columns).eq("approved", true).order("created_at", { ascending: false });
  let result = await read(WISH_COLUMNS);
  if (isMissingColumnError(result.error)) result = await read(LEGACY_WISH_COLUMNS);
  if (result.error) console.error("[wishes] read failed:", result.error.message);
  return ((result.data ?? []) as unknown as Wish[]).map(withWishDefaults);
}

export default async function WishesSection() {
  const [wishes, hero] = await Promise.all([readWishes(), getHomeHero()]);

  return (
    <PageSection
      id="wishes"
      tone="deep"
      title="Wishes"
      subtitle={`Tie a wish to ${hero.bride_name} & ${hero.groom_name}'s toran. Every note stays here, and goes into a keepsake book for them after the wedding.`}
    >
      {/* Newest first: the latest notes hang at the start of the string. */}
      <WishingToran initialWishes={wishes} />
    </PageSection>
  );
}
