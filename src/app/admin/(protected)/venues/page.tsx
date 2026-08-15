import { createAdminSupabase } from "@/lib/supabase-admin";
import { Field, FormActions } from "@/components/admin/Field";
import { createVenue, updateVenue, deleteVenue } from "./actions";

export default async function AdminVenuesPage() {
  const admin = createAdminSupabase();
  const { data: venues } = await admin
    .from("venues")
    .select("id, name, address, parking_info, accessibility_info, nearby_landmarks")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Venues</h1>

      <div className="mt-6 space-y-6">
        {venues?.map((venue) => (
          <form key={venue.id} action={updateVenue} className="space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <input type="hidden" name="id" value={venue.id} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name" name="name" defaultValue={venue.name} required />
              <Field label="Address" name="address" defaultValue={venue.address} required />
              <Field label="Parking" name="parking_info" defaultValue={venue.parking_info ?? ""} span2 />
              <Field label="Accessibility" name="accessibility_info" defaultValue={venue.accessibility_info ?? ""} span2 />
              <Field label="Nearby landmarks" name="nearby_landmarks" defaultValue={venue.nearby_landmarks ?? ""} span2 />
            </div>
            <FormActions deleteAction={deleteVenue} />
          </form>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Add venue</h2>
      <form action={createVenue} className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" name="name" required />
          <Field label="Address" name="address" required />
          <Field label="Parking" name="parking_info" span2 />
          <Field label="Accessibility" name="accessibility_info" span2 />
          <Field label="Nearby landmarks" name="nearby_landmarks" span2 />
        </div>
        <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Add venue</button>
      </form>
    </div>
  );
}
