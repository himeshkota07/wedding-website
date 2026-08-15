// Open-Meteo is free and requires no API key: https://open-meteo.com

const MS_PER_DAY = 86_400_000;
const FORECAST_HORIZON_DAYS = 15; // Open-Meteo's daily forecast reliably covers ~16 days out

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

export type DailyWeather = {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
};

type OpenMeteoDailyResponse = {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
};

async function fetchDaily(url: string): Promise<DailyWeather[]> {
  const res = await fetch(url, { next: { revalidate: 86_400 } });
  if (!res.ok) return [];
  const data: OpenMeteoDailyResponse = await res.json();
  if (!data.daily) return [];
  return data.daily.time.map((date, i) => ({
    date,
    tempMaxC: data.daily!.temperature_2m_max[i],
    tempMinC: data.daily!.temperature_2m_min[i],
    precipitationMm: data.daily!.precipitation_sum[i],
  }));
}

/** True live forecast, only meaningful within ~15 days of the target date. */
export async function getForecastForDate(lat: number, lon: number, targetIso: string): Promise<DailyWeather | null> {
  const target = new Date(targetIso);
  const daysAway = Math.round((target.getTime() - Date.now()) / MS_PER_DAY);
  if (daysAway < 0 || daysAway > FORECAST_HORIZON_DAYS) return null;

  const dateStr = ymd(target);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;
  const days = await fetchDaily(url);
  return days[0] ?? null;
}

/** Average conditions on this calendar date over the last few years -- a stand-in for a forecast when the date is too far out. */
export async function getHistoricalAverageForDate(lat: number, lon: number, targetIso: string): Promise<DailyWeather | null> {
  const target = new Date(targetIso);
  const years = [1, 2, 3].map((n) => target.getFullYear() - n);

  const windows = await Promise.all(
    years.map((year) => {
      const start = new Date(Date.UTC(year, target.getUTCMonth(), target.getUTCDate() - 2));
      const end = new Date(Date.UTC(year, target.getUTCMonth(), target.getUTCDate() + 2));
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${ymd(start)}&end_date=${ymd(end)}`;
      return fetchDaily(url);
    }),
  );

  const allDays = windows.flat().filter((d) => Number.isFinite(d.tempMaxC) && Number.isFinite(d.tempMinC));
  if (allDays.length === 0) return null;

  const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
  return {
    date: ymd(target),
    tempMaxC: avg(allDays.map((d) => d.tempMaxC)),
    tempMinC: avg(allDays.map((d) => d.tempMinC)),
    precipitationMm: avg(allDays.map((d) => d.precipitationMm)),
  };
}
