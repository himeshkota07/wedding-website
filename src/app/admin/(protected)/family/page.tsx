import { supabase } from "@/lib/supabase";
import { Field, TextAreaField, FormActions } from "@/components/admin/Field";
import { createFamilyMember, updateFamilyMember, deleteFamilyMember } from "./actions";

export default async function AdminFamilyPage() {
  const { data: members } = await supabase
    .from("family_members")
    .select("id, side, role, name, bio, sort_order")
    .order("side", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Family</h1>

      <div className="mt-6 space-y-6">
        {members?.map((member) => (
          <form key={member.id} action={updateFamilyMember} className="space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <input type="hidden" name="id" value={member.id} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Side
                <select name="side" defaultValue={member.side} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm">
                  <option value="bride">Bride</option>
                  <option value="groom">Groom</option>
                </select>
              </label>
              <Field label="Role" name="role" defaultValue={member.role} required />
              <Field label="Name" name="name" defaultValue={member.name} required span2 />
              <TextAreaField label="Bio" name="bio" defaultValue={member.bio ?? ""} span2 />
              <Field label="Sort order" name="sort_order" type="number" defaultValue={member.sort_order} />
            </div>
            <FormActions deleteAction={deleteFamilyMember} />
          </form>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Add family member</h2>
      <form action={createFamilyMember} className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Side
            <select name="side" defaultValue="bride" className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm">
              <option value="bride">Bride</option>
              <option value="groom">Groom</option>
            </select>
          </label>
          <Field label="Role" name="role" required />
          <Field label="Name" name="name" required span2 />
          <TextAreaField label="Bio" name="bio" span2 />
          <Field label="Sort order" name="sort_order" type="number" defaultValue={0} />
        </div>
        <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Add family member</button>
      </form>
    </div>
  );
}
