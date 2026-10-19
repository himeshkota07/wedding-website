import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { toIstDatetimeLocal, toIstTime } from "@/lib/ist-datetime";
import { createEvent, updateEvent, deleteEvent } from "./actions";

export default async function AdminEventsPage() {
  const admin = createAdminSupabase();
  const [{ data: events }, { data: venues }] = await Promise.all([
    admin
      .from("events")
      .select("id, name, description, event_date, event_end, venue_id, special_instructions, sort_order")
      .order("sort_order", { ascending: true }),
    admin.from("venues").select("id, name").order("name", { ascending: true }),
  ]);

  const venueOptions = venues ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Events</h1>
      <p className="mt-1 text-zinc-600">
        A new event shows only on the &ldquo;all events&rdquo; invitation link until you choose its guest lists on the{" "}
        <Link href="/admin/links" className="text-accent underline">
          Links
        </Link>{" "}
        page.
      </p>

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
                Date &amp; start time (IST)
                <input
                  type="datetime-local"
                  name="event_date"
                  defaultValue={toIstDatetimeLocal(event.event_date)}
                  required
                  className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="text-sm">
                End time (IST, optional)
                <input
                  type="time"
                  name="event_end"
                  defaultValue={toIstTime(event.event_end)}
                  className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
                />
                <span className="mt-1 block text-xs text-zinc-500">An end before the start means it runs past midnight.</span>
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
                Sort order
                <input type="number" name="sort_order" defaultValue={event.sort_order} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
              </label>
              <label className="text-sm sm:col-span-2">
                Special instructions
                <input name="special_instructions" defaultValue={event.special_instructions ?? ""} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
              </label>
            </div>
            <div className="flex gap-2">
              <SubmitButton>Save</SubmitButton>
              <SubmitButton formAction={deleteEvent} pendingLabel="Deleting…" doneLabel="Deleted" className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600">Delete</SubmitButton>
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
            Date &amp; start time (IST)
            <input type="datetime-local" name="event_date" required className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-sm">
            End time (IST, optional)
            <input type="time" name="event_end" className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
            <span className="mt-1 block text-xs text-zinc-500">An end before the start means it runs past midnight.</span>
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
            Sort order
            <input type="number" name="sort_order" defaultValue={0} className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
          <label className="text-sm sm:col-span-2">
            Special instructions
            <input name="special_instructions" className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm" />
          </label>
        </div>
        <SubmitButton pendingLabel="Adding…" doneLabel="Added" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Add event</SubmitButton>
      </form>
    </div>
  );
}
