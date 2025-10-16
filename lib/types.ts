export interface HourlyWind {
  time: string;
  wind_speed_10m: number; // km/h
  wind_gusts_10m: number; // km/h
  wind_direction_10m: number; // degrees
  score: number;
}

export interface WeatherForecast {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    wind_direction_10m: number[];
  };
}

export interface Park {
  id: string;
  name: string;
  lat: number;
  lon: number;
  comuna: string;
  area?: string;
  zona?: "Oriente" | "Centro" | "Poniente" | "Norte" | "Sur";
  warnings?: string[];
}

export interface ScoreLevel {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}
