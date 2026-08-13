import { createAdminSupabase } from "@/lib/supabase-admin";
import { Field, FormActions } from "@/components/admin/Field";
import { createContact, updateContact, deleteContact } from "./actions";

export default async function AdminContactsPage() {
  const admin = createAdminSupabase();
  const { data: contacts } = await admin
    .from("contacts")
    .select("id, name, role, phone, whatsapp_link, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Contacts</h1>

      <div className="mt-6 space-y-6">
        {contacts?.map((contact) => (
          <form key={contact.id} action={updateContact} className="space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <input type="hidden" name="id" value={contact.id} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name" name="name" defaultValue={contact.name} required />
              <Field label="Role" name="role" defaultValue={contact.role ?? ""} />
              <Field label="Phone" name="phone" defaultValue={contact.phone ?? ""} />
              <Field label="WhatsApp link" name="whatsapp_link" defaultValue={contact.whatsapp_link ?? ""} />
              <Field label="Sort order" name="sort_order" type="number" defaultValue={contact.sort_order} />
            </div>
            <FormActions deleteAction={deleteContact} />
          </form>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Add contact</h2>
      <form action={createContact} className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" name="name" required />
          <Field label="Role" name="role" />
          <Field label="Phone" name="phone" />
          <Field label="WhatsApp link" name="whatsapp_link" />
          <Field label="Sort order" name="sort_order" type="number" defaultValue={0} />
        </div>
        <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Add contact</button>
      </form>
    </div>
  );
}
