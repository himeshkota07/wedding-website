import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import { getHomeHero } from "@/lib/site-settings";
import WeatherWidget from "@/components/WeatherWidget";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";

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
          <Reveal key={venue.id}>
            <Card padding="lg">
              <h3 className="font-display text-xl font-semibold text-ink">{venue.name}</h3>
              <p className="mt-1 text-foreground/70">{venue.address}</p>
              <iframe
                className="mt-4 h-64 w-full rounded-md border border-hairline/60"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(venue.address)}&output=embed`}
              />
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-foreground/70 sm:grid-cols-2">
                {venue.parking_info && (
                  <div>
                    <dt className="inline font-medium text-ink">Parking: </dt>
                    <dd className="inline">{venue.parking_info}</dd>
                  </div>
                )}
                {venue.accessibility_info && (
                  <div>
                    <dt className="inline font-medium text-ink">Accessibility: </dt>
                    <dd className="inline">{venue.accessibility_info}</dd>
                  </div>
                )}
                {venue.nearby_landmarks && (
                  <div className="sm:col-span-2">
                    <dt className="inline font-medium text-ink">Nearby: </dt>
                    <dd className="inline">{venue.nearby_landmarks}</dd>
                  </div>
                )}
              </dl>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageSection>
  );
}
