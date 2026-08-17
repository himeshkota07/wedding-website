import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";

type FamilyMember = {
  id: string;
  side: string;
  role: string;
  name: string;
  bio: string | null;
};

function FamilyGroup({ title, people }: { title: string; people: FamilyMember[] }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>
      <div className="mt-4 space-y-4">
        {people.map((p) => (
          <div key={p.id} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="font-medium text-zinc-900">
              {p.name} <span className="font-normal text-zinc-500">— {p.role}</span>
            </div>
            {p.bio && <p className="mt-1 text-sm text-zinc-600">{p.bio}</p>}
          </div>
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
    <PageSection id="family" title="Bride & Groom + Family" subtitle="Introducing both families to each other" tint>
      {!members?.length && <p>Family introductions will be added soon.</p>}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {bride.length > 0 && <FamilyGroup title="Bride's Family" people={bride} />}
        {groom.length > 0 && <FamilyGroup title="Groom's Family" people={groom} />}
      </div>
    </PageSection>
  );
}
