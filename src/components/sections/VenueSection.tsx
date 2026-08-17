import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import { getHomeHero } from "@/lib/site-settings";
import WeatherWidget from "@/components/WeatherWidget";

export default async function VenueSection() {
  const [{ data: venues }, hero] = await Promise.all([
    supabase
      .from("venues")
      .select("id, name, address, parking_info, accessibility_info, nearby_landmarks")
      .order("created_at", { ascending: true }),
    getHomeHero(),
  ]);

  return (
    <PageSection id="venue" title="Venue & Location" subtitle="Getting guests to the right place">
      {hero.wedding_datetime && (
        <WeatherWidget lat={hero.weather_lat} lon={hero.weather_lon} targetIso={hero.wedding_datetime} />
      )}

      {!venues?.length && <p>Venue details will be added soon.</p>}
      <div className="space-y-8">
        {venues?.map((venue) => (
          <div key={venue.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900">{venue.name}</h3>
            <p className="mt-1 text-zinc-600">{venue.address}</p>
            <iframe
              className="mt-4 h-64 w-full rounded-md border border-black/10"
              loading="lazy"
              src={`https://www.google.com/maps?q=${encodeURIComponent(venue.address)}&output=embed`}
            />
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-zinc-600 sm:grid-cols-2">
              {venue.parking_info && (
                <div>
                  <dt className="inline font-medium text-zinc-800">Parking: </dt>
                  <dd className="inline">{venue.parking_info}</dd>
                </div>
              )}
              {venue.accessibility_info && (
                <div>
                  <dt className="inline font-medium text-zinc-800">Accessibility: </dt>
                  <dd className="inline">{venue.accessibility_info}</dd>
                </div>
              )}
              {venue.nearby_landmarks && (
                <div className="sm:col-span-2">
                  <dt className="inline font-medium text-zinc-800">Nearby: </dt>
                  <dd className="inline">{venue.nearby_landmarks}</dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
