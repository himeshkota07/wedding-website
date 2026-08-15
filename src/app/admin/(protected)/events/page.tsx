import { createAdminSupabase } from "@/lib/supabase-admin";
import { toIstDatetimeLocal } from "@/lib/ist-datetime";
import { createEvent, updateEvent, deleteEvent } from "./actions";

export default async function AdminEventsPage() {
  const admin = createAdminSupabase();
  const [{ data: events }, { data: venues }] = await Promise.all([
    admin
      .from("events")
      .select("id, name, description, event_date, venue_id, dress_code, theme_color, special_instructions, sort_order")
      .order("sort_order", { ascending: true }),
    admin.from("venues").select("id, name").order("name", { ascending: true }),
  ]);

  const venueOptions = venues ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Events</h1>

      <div className="mt-6 space-y-6">
        {events?.map((event) => (
          <form
            key={event.id}
            action={updateEvent}
            className="space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm"
          >
            <input type="hidden" name="id" value={event.id} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Name
                <input name="name" defaultValue={event.name} required className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
              </label>
              <label className="text-sm">
                Date &amp; time (IST)
                <input
                  type="datetime-local"
                  name="event_date"
                  defaultValue={toIstDatetimeLocal(event.event_date)}
                  required
                  className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Description
                <textarea name="description" defaultValue={event.description ?? ""} rows={2} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
              </label>
              <label className="text-sm">
                Venue
                <select name="venue_id" defaultValue={event.venue_id ?? ""} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm">
                  <option value="">— none —</option>
                  {venueOptions.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Dress code
                <input name="dress_code" defaultValue={event.dress_code ?? ""} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
              </label>
              <label className="text-sm">
                Theme color (hex)
                <input name="theme_color" defaultValue={event.theme_color ?? ""} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
              </label>
              <label className="text-sm">
                Sort order
                <input type="number" name="sort_order" defaultValue={event.sort_order} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
              </label>
              <label className="text-sm sm:col-span-2">
                Special instructions
                <input name="special_instructions" defaultValue={event.special_instructions ?? ""} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Save</button>
              <button type="submit" formAction={deleteEvent} className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600">Delete</button>
            </div>
          </form>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Add event</h2>
      <form action={createEvent} className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Name
            <input name="name" required className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-sm">
            Date &amp; time (IST)
            <input type="datetime-local" name="event_date" required className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-sm sm:col-span-2">
            Description
            <textarea name="description" rows={2} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-sm">
            Venue
            <select name="venue_id" className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm">
              <option value="">— none —</option>
              {venueOptions.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Dress code
            <input name="dress_code" className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-sm">
            Theme color (hex)
            <input name="theme_color" placeholder="#8b3a5c" className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-sm">
            Sort order
            <input type="number" name="sort_order" defaultValue={0} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-sm sm:col-span-2">
            Special instructions
            <input name="special_instructions" className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
        </div>
        <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Add event</button>
      </form>
    </div>
  );
}
