import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";

type FamilyMember = {
  id: string;
  side: string;
  role: string;
  name: string;
  bio: string | null;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function FamilyGroup({ title, people }: { title: string; people: FamilyMember[] }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      <div className="mt-4 space-y-4">
        {people.map((p) => (
          <Reveal key={p.id}>
            <Card padding="sm" className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-soft font-display text-sm font-semibold text-accent-deep">
                {initials(p.name)}
              </div>
              <div>
                <div className="font-medium text-ink">
                  {p.name} <span className="font-normal text-foreground/60">— {p.role}</span>
                </div>
                {p.bio && <p className="mt-1 text-sm text-foreground/70">{p.bio}</p>}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default async function FamilySection() {
  const { data: members } = await supabase
    .from("family_members")
    .select("id, side, role, name, bio")
    .order("sort_order", { ascending: true });

  const bride = members?.filter((m) => m.side === "bride") ?? [];
  const groom = members?.filter((m) => m.side === "groom") ?? [];

  return (
    <PageSection id="family" title="Bride & Groom + Family" subtitle="Introducing both families to each other">
      {!members?.length && <p>Family introductions will be added soon.</p>}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {bride.length > 0 && <FamilyGroup title="Bride's Family" people={bride} />}
        {groom.length > 0 && <FamilyGroup title="Groom's Family" people={groom} />}
      </div>
    </PageSection>
  );
}
