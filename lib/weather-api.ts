import type { WeatherForecast, HourlyWind } from "./types";
import { calculateVolantinScore } from "./volantin-score";

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  forecastDays = 3
): Promise<HourlyWind[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m&forecast_days=${forecastDays}&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
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
    console.error("[v0] Error fetching weather data:", error);
    throw error;
  }
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
  const weatherPromises = parks.map(async (park) => {
    try {
      const forecast = await fetchWeatherForecast(
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

  const results = await Promise.all(weatherPromises);

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
