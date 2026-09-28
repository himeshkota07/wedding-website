import { CloudSun } from "lucide-react";
import { getForecastForDate, getHistoricalAverageForDate } from "@/lib/weather";

function toF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

export default async function WeatherWidget({
  lat,
  lon,
  targetIso,
}: {
  lat: number;
  lon: number;
  targetIso: string;
}) {
  if (!targetIso) return null;

  const forecast = await getForecastForDate(lat, lon, targetIso);
  const day = forecast ?? (await getHistoricalAverageForDate(lat, lon, targetIso));
  if (!day) return null;

  const maxC = Math.round(day.tempMaxC);
  const minC = Math.round(day.tempMinC);

  return (
    <div className="mb-12 flex max-w-2xl items-start gap-4 border-y border-hairline py-4">
      <CloudSun size={32} className="shrink-0 text-marigold" aria-hidden />
      <div>
        <p className="font-display text-2xl text-ink">
          {maxC}&deg;C <span className="text-ink-soft">/ {minC}&deg;C</span>
          <span className="ml-2 text-base text-ink-soft">
            ({toF(day.tempMaxC)}&deg;F / {toF(day.tempMinC)}&deg;F)
            {day.precipitationMm > 1 && ` · ${Math.round(day.precipitationMm)} mm rain`}
          </span>
        </p>
        <p className="text-ink-soft">
          {forecast
            ? `Forecast for ${new Date(targetIso).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}.`
            : "Typical weather around the date, from past years. A real forecast appears closer to the day."}
        </p>
      </div>
    </div>
  );
}
