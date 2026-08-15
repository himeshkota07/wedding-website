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
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <h3 className="font-medium text-zinc-900">Weather</h3>
      <p className="mt-1 text-sm text-zinc-500">
        {forecast
          ? `Forecast for ${new Date(targetIso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
          : "Typical conditions around this time (based on past years) — a real forecast opens up closer to the date"}
      </p>
      <p className="mt-2 text-2xl font-semibold text-accent">
        {maxC}&deg;C <span className="text-base font-normal text-zinc-500">/ {minC}&deg;C</span>
      </p>
      <p className="text-xs text-zinc-500">
        ({toF(day.tempMaxC)}&deg;F / {toF(day.tempMinC)}&deg;F)
        {day.precipitationMm > 1 && ` · ${Math.round(day.precipitationMm)}mm rain`}
      </p>
    </div>
  );
}
