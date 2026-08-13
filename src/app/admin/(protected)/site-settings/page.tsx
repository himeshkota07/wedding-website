import { getHomeHero, getOurStory } from "@/lib/site-settings";
import { createAdminSupabase } from "@/lib/supabase-admin";
import { toIstDatetimeLocal } from "@/lib/ist-datetime";
import { Field, TextAreaField } from "@/components/admin/Field";
import { updateHomeHero, updateOurStory } from "./actions";

export default async function AdminSiteSettingsPage() {
  const admin = createAdminSupabase();
  const [hero, story] = await Promise.all([getHomeHero(admin), getOurStory(admin)]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Site Content</h1>
      <p className="mt-1 text-zinc-600">The Home hero and Our Story text.</p>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">Home</h2>
      <form action={updateHomeHero} className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Bride's name" name="bride_name" defaultValue={hero.bride_name} required />
          <Field label="Groom's name" name="groom_name" defaultValue={hero.groom_name} required />
          <Field label="Wedding date (display text)" name="wedding_date_label" defaultValue={hero.wedding_date_label} required />
          <label className="text-sm">
            Wedding date &amp; time (IST, used for the countdown)
            <input
              type="datetime-local"
              name="wedding_datetime"
              defaultValue={hero.wedding_datetime ? toIstDatetimeLocal(hero.wedding_datetime) : ""}
              className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
            />
          </label>
          <Field label="Location" name="location" defaultValue={hero.location} required />
          <TextAreaField label="Welcome note" name="welcome_note" defaultValue={hero.welcome_note} span2 />
        </div>
        <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Save Home</button>
      </form>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">Our Story</h2>
      <form action={updateOurStory} className="mt-3 space-y-3 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
        <label className="text-sm">
          Story (separate paragraphs with a blank line)
          <textarea
            name="content"
            defaultValue={story.content}
            rows={8}
            className="mt-1 w-full rounded-md border border-black/20 px-2 py-1.5 text-sm"
          />
        </label>
        <button type="submit" className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Save Our Story</button>
      </form>
    </div>
  );
}
