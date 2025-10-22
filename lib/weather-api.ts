import type { WeatherForecast, HourlyWind } from "./types";
import { calculateVolantinScore } from "./volantin-score";

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  forecastDays = 3
): Promise<HourlyWind[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&forecast_days=${forecastDays}&timezone=auto`;

  // Helper: sleep ms
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url);

      if (response.status === 429) {
        // Too many requests: respect Retry-After if provided
        const ra = response.headers.get("Retry-After");
        const waitSec = ra ? parseInt(ra, 10) || 1 : Math.pow(2, attempt);
        const waitMs = Math.max(500, waitSec * 1000);
        console.warn(`[v0] Open-Meteo 429 received. Retrying after ${waitMs}ms (attempt ${attempt})`);
        if (attempt < maxAttempts) await sleep(waitMs + Math.random() * 200);
        else throw new Error("Open-Meteo: too many requests (429)");
        continue;
      }

      if (!response.ok) {
        // For 5xx or other errors, attempt retry with backoff
        const errText = await response.text().catch(() => "");
        const status = response.status;
        const msg = `Open-Meteo error ${status}: ${errText}`;
        if (attempt < maxAttempts) {
          const backoff = Math.pow(2, attempt) * 300 + Math.random() * 200;
          console.warn(`[v0] ${msg}. Retrying in ${backoff}ms (attempt ${attempt})`);
          await sleep(backoff);
          continue;
        }
        throw new Error(msg);
      }

      const data: WeatherForecast = await response.json();

      // Transform API response into HourlyWind array with scores
      const hourlyData: HourlyWind[] = data.hourly.time.map((time, index) => {
        const windSpeed = data.hourly.wind_speed_10m[index];
        const gustSpeed = data.hourly.wind_gusts_10m[index];
        const direction = data.hourly.wind_direction_10m[index];

        return {
          time,
          wind_speed_10m: windSpeed,
          wind_gusts_10m: gustSpeed,
          wind_direction_10m: direction,
          score: calculateVolantinScore(windSpeed, gustSpeed),
        };
      });

      return hourlyData;
    } catch (error) {
      console.error(`[v0] Error fetching weather data (attempt ${attempt}):`, error);
      if (attempt >= maxAttempts) throw error;
      const backoff = Math.pow(2, attempt) * 300 + Math.random() * 200;
      await sleep(backoff);
    }
  }

  // Shouldn't reach here, but TypeScript needs a return
  throw new Error("Failed to fetch weather data after retries");
}

export function getBestHoursToday(
  hourlyData: HourlyWind[],
  count = 3
): HourlyWind[] {
  const now = new Date();
  const todayData = hourlyData.filter((hour) => {
    const hourDate = new Date(hour.time);
    return (
      hourDate.getDate() === now.getDate() &&
      hourDate.getMonth() === now.getMonth() &&
      hourDate >= now
    );
  });

  return todayData.sort((a, b) => b.score - a.score).slice(0, count);
}

// Fetch weather data for multiple parks simultaneously
export async function fetchMultiParkWeather(
  parks: Array<{ id: string; lat: number; lon: number }>,
  forecastDays = 3
): Promise<Record<string, HourlyWind[]>> {
  // Process parks in small batches and use cache to avoid bursts
  const results: Array<{ parkId: string; forecast: HourlyWind[] }> = [];

  const chunkSize = 4; // concurrent requests
  for (let i = 0; i < parks.length; i += chunkSize) {
    const chunk = parks.slice(i, i + chunkSize);
    const chunkPromises = chunk.map(async (park) => {
      try {
        const forecast = await fetchWeatherWithCache(
          park.lat,
          park.lon,
          forecastDays
        );
        return { parkId: park.id, forecast };
      } catch (error) {
        console.error(`Failed to fetch weather for park ${park.id}:`, error);
        return { parkId: park.id, forecast: [] };
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    // small pause between chunks to avoid bursting the API
    if (i + chunkSize < parks.length) await new Promise((r) => setTimeout(r, 200));
  }

  return results.reduce((acc, { parkId, forecast }) => {
    acc[parkId] = forecast;
    return acc;
  }, {} as Record<string, HourlyWind[]>);
}

// Cache for weather data to avoid repeated API calls
const weatherCache = new Map<
  string,
  { data: HourlyWind[]; timestamp: number }
>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function fetchWeatherWithCache(
  latitude: number,
  longitude: number,
  forecastDays = 3
): Promise<HourlyWind[]> {
  const cacheKey = `${latitude.toFixed(4)}-${longitude.toFixed(
    4
  )}-${forecastDays}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const data = await fetchWeatherForecast(latitude, longitude, forecastDays);
    weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    // Return cached data if available, even if expired
    if (cached) {
      console.warn("Using expired cache due to API error");
      return cached.data;
    }
    throw error;
  }
}
