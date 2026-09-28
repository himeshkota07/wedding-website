import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import { getHomeHero } from "@/lib/site-settings";

type FamilyMember = {
  id: string;
  side: string;
  role: string;
  name: string;
  bio: string | null;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
}

function FamilyGroup({ title, people, tone }: { title: string; people: FamilyMember[]; tone: "marigold" | "leaf" }) {
  return (
    <div>
      <h3 className="font-display text-3xl text-ink">{title}</h3>
      <ul className="mt-6">
        {people.map((p) => (
          <li key={p.id} className="flex items-start gap-4 border-t border-hairline py-4">
            <span
              aria-hidden
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg ${
                tone === "marigold" ? "bg-turmeric text-teak" : "bg-leaf text-paper"
              }`}
            >
              {initials(p.name)}
            </span>
            <div>
              <p className="font-display text-xl text-ink">{p.name}</p>
              <p className="text-ink-soft">{p.role}</p>
              {p.bio && <p className="mt-1.5 max-w-[55ch] text-ink-soft">{p.bio}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function FamilySection() {
  const [{ data: members }, hero] = await Promise.all([
    supabase.from("family_members").select("id, side, role, name, bio").order("sort_order", { ascending: true }),
    getHomeHero(),
  ]);

  const bride = members?.filter((m) => m.side === "bride") ?? [];
  const groom = members?.filter((m) => m.side === "groom") ?? [];

  return (
    <PageSection
      id="family"
      tone="deep"
      title="Bride & Groom + Family"
      subtitle="So both sides can put names to faces before the day."
    >
      {!members?.length && (
        <p className="max-w-[60ch] text-lg text-ink-soft">Family introductions from both sides will be added soon.</p>
      )}
      <div className="grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-12">
        {bride.length > 0 && <FamilyGroup title={`${hero.bride_name}'s family`} people={bride} tone="marigold" />}
        {groom.length > 0 && <FamilyGroup title={`${hero.groom_name}'s family`} people={groom} tone="leaf" />}
      </div>
    </PageSection>
  );
}
