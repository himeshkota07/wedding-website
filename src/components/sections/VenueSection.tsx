import { Accessibility, Car, ExternalLink, Landmark } from "lucide-react";
import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabase";
import { getHomeHero } from "@/lib/site-settings";
import WeatherWidget from "@/components/WeatherWidget";

function Detail({ icon: Icon, label, children }: { icon: typeof Car; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-t border-hairline py-3">
      <Icon size={20} className="mt-0.5 shrink-0 text-leaf" aria-hidden />
      <div>
        <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">{label}</dt>
        <dd className="text-ink">{children}</dd>
      </div>
    </div>
  );
}

export default async function VenueSection() {
  const [{ data: venues }, hero] = await Promise.all([
    supabase
      .from("venues")
      .select("id, name, address, parking_info, accessibility_info, nearby_landmarks")
      .order("created_at", { ascending: true }),
    getHomeHero(),
  ]);

  // Until a venue is saved in the admin panel, show the location from the home settings.
  const [place, ...area] = hero.location.split(",").map((s) => s.trim());
  const list = venues?.length
    ? venues
    : [
        {
          id: "fallback",
          name: place,
          address: area.join(", "),
          parking_info: null,
          accessibility_info: null,
          nearby_landmarks: null,
        },
      ].filter(() => area.length > 0);

  return (
    <PageSection id="venue" title="Venue & Location" subtitle="Getting you to the right place, with directions for the driver.">
      {hero.wedding_datetime && (
        <WeatherWidget lat={hero.weather_lat} lon={hero.weather_lon} targetIso={hero.wedding_datetime} />
      )}

      <div className="space-y-20">
        {list.map((venue) => {
          const query = encodeURIComponent(`${venue.name}, ${venue.address}`);
          const mapsLink = `https://www.google.com/maps/search/?api=1&query=${query}`;
          return (
            <article key={venue.id} className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
              <div>
                <h3 className="font-display text-3xl text-ink sm:text-4xl">{venue.name}</h3>
                <p className="mt-2 text-lg text-ink-soft">{venue.address}</p>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-kumkum px-6 font-semibold text-paper transition-colors hover:bg-kumkum-deep"
                >
                  Open in Google Maps
                  <ExternalLink size={16} />
                </a>
                <dl className="mt-8">
                  {venue.id === "fallback" && (
                    <p className="border-t border-hairline py-3 text-ink-soft">
                      Parking, accessibility and landmark notes for the driver will be added here soon.
                    </p>
                  )}
                  {venue.parking_info && (
                    <Detail icon={Car} label="Parking">
                      {venue.parking_info}
                    </Detail>
                  )}
                  {venue.accessibility_info && (
                    <Detail icon={Accessibility} label="Accessibility">
                      {venue.accessibility_info}
                    </Detail>
                  )}
                  {venue.nearby_landmarks && (
                    <Detail icon={Landmark} label="Nearby landmarks">
                      {venue.nearby_landmarks}
                    </Detail>
                  )}
                </dl>
              </div>
              <div className="border border-brass/60 p-2">
                <iframe
                  title={`Map of ${venue.name}`}
                  className="block h-72 w-full sm:h-96"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${query}&output=embed`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </PageSection>
  );
}
