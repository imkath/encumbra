"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MapView } from "@/components/map-view";
import { AtGlanceCard } from "@/components/AtGlanceCard";
import { useAlertMonitor } from "@/hooks/use-alert-monitor";
import { saveAlert, requestNotificationPermission } from "@/lib/notifications";
import { NearbyList } from "@/components/NearbyList";
import { BestWindowPanel } from "@/components/BestWindowPanel";
import { SettingsSheet } from "@/components/SettingsSheet";
import { TemperatureWidget } from "@/components/TemperatureWidget";
import { HourlyChart } from "@/components/HourlyChart";
import { TopParksRanking } from "@/components/TopParksRanking";
import { ScoreInfoTooltip } from "@/components/ScoreInfoTooltip";
import { SafetyStrip } from "@/components/SafetyStrip";
import { TipCard } from "@/components/TipCard";
import { SafetyBadges } from "@/components/SafetyBadges";
import { EducationalWindows } from "@/components/EducationalWindows";
import { SafetyTrafficLight } from "@/components/SafetyTrafficLight";
import { SafetyCallout } from "@/components/SafetyCallout";
import { WelcomeHero } from "@/components/WelcomeHero";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AlertsList } from "@/components/AlertsList";
import { Footer } from "@/components/Footer";
import { FullPageSkeleton } from "@/components/LoadingSkeleton";
import { SANTIAGO_PARKS } from "@/lib/parks-data";
import type { Park, HourlyWind } from "@/lib/types";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/lib/use-toast";
import {
  fetchWeatherForecast,
  fetchMultiParkWeather,
  fetchWeatherWithCache,
} from "@/lib/weather-api";
import { findNearestPark } from "@/lib/parks-data";
import {
  findWindows,
  shouldFlyNow,
  getNextTodayWindow,
  getBestToday,
  getBestTomorrow,
  profileOpts,
  normalizeQScore,
  type HourPoint,
} from "@/lib/find-windows";
import { calculateVolantinScore } from "@/lib/volantin-score";
import { Settings, MapPin, AlertTriangle } from "lucide-react";
import {
  FaWind,
  FaCog,
  FaBell,
  FaMapMarkerAlt,
  FaCalendarDay,
  FaClock,
  FaStar,
} from "react-icons/fa";
import { formatWindSpeed } from "@/lib/utils";

// Función helper para hacer scroll con offset del header
const scrollToElementWithOffset = (element: Element | null) => {
  if (!element) return;

  const headerHeight = 64; // h-16 = 64px
  const extraPadding = 16; // Padding extra para mejor visibilidad
  const elementPosition =
    element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - headerHeight - extraPadding;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
};

export default function Home() {
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [nearestParkId, setNearestParkId] = useState<string | undefined>(
    undefined
  );
  const [hourlyForecast, setHourlyForecast] = useState<HourlyWind[]>([]);
  const [allParksWeather, setAllParksWeather] = useState<
    Record<string, HourlyWind[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [kiteProfile, setKiteProfile] = useState<
    "liviano" | "estandar" | "acrobatico"
  >("estandar");
  const [windUnits, setWindUnits] = useState<"kmh" | "ms" | "kn">("kmh");

  const { latitude, longitude, error } = useGeolocation();
  const { toast } = useToast();

  // Monitorear alertas configuradas
  useAlertMonitor();

  // Cargar preferencias desde localStorage al iniciar
  useEffect(() => {
    const savedProfile = localStorage.getItem("kiteProfile") as
      | "liviano"
      | "estandar"
      | "acrobatico"
      | null;
    const savedUnits = localStorage.getItem("windUnits") as
      | "kmh"
      | "ms"
      | "kn"
      | null;

    if (savedProfile) {
      setKiteProfile(savedProfile);
    }
    if (savedUnits) {
      setWindUnits(savedUnits);
    }
  }, []);

  // Guardar preferencias en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem("kiteProfile", kiteProfile);
  }, [kiteProfile]);

  useEffect(() => {
    localStorage.setItem("windUnits", windUnits);
  }, [windUnits]);

  // Manejar scroll al cargar página con hash (ej: /#parques)
  useEffect(() => {
    if (window.location.hash) {
      // Esperar a que la página cargue completamente
      setTimeout(() => {
        const hash = window.location.hash.substring(1);
        const element = document.getElementById(hash);
        if (element) {
          const headerHeight = 64; // h-16 del header
          const padding = 16;
          const top =
            element.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            padding;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }, 500); // Esperar 500ms para asegurar que todo esté renderizado
    }
  }, []);

  // Cargar datos iniciales: obtiene clima de todos los parques y selecciona el más cercano
  useEffect(() => {
    async function loadInitialData() {
      setInitialLoading(true);
      try {
        const parksData = SANTIAGO_PARKS.map((park) => ({
          id: park.id,
          lat: park.lat,
          lon: park.lon,
        }));

        const weatherData = await fetchMultiParkWeather(parksData, 3);
        setAllParksWeather(weatherData);

        // Calcular el mejor parque para selección inicial
        const parksWithScores = SANTIAGO_PARKS.map((park) => {
          const parkWeather = weatherData[park.id] || [];
          if (parkWeather.length === 0) return { park, score: -1 };

          const parkHourlyData: HourPoint[] = parkWeather.map((h) => ({
            time: h.time,
            speed: h.wind_speed_10m,
            gust: h.wind_gusts_10m,
            score: calculateVolantinScore(
              h.wind_speed_10m,
              h.wind_gusts_10m,
              kiteProfile
            ),
          }));

          const parkWindows = findWindows(
            parkHourlyData,
            profileOpts(kiteProfile)
          );
          const bestToday = getBestToday(parkWindows);

          return {
            park,
            score: bestToday ? normalizeQScore(bestToday.Q) : -1,
          };
        }).sort((a, b) => b.score - a.score);

        // Seleccionar parque más cercano si hay ubicación disponible
        if (latitude && longitude) {
          const nearest = findNearestPark(latitude, longitude);
          if (nearest && weatherData[nearest.id]) {
            setNearestParkId(nearest.id);
            setSelectedPark(nearest);
            setHourlyForecast(weatherData[nearest.id]);
          }
        } else {
          // Por defecto: primer parque del ranking (mejor score)
          const topPark = parksWithScores.find((p) => p.score >= 0);
          if (topPark) {
            setNearestParkId(undefined);
            setSelectedPark(topPark.park);
            setHourlyForecast(weatherData[topPark.park.id]);
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    }

    loadInitialData();
  }, [latitude, longitude]);

  // Actualizar pronóstico cuando cambia el parque seleccionado
  useEffect(() => {
    if (!selectedPark) {
      setHourlyForecast([]);
      return;
    }

    // Usar datos en caché si están disponibles
    if (allParksWeather[selectedPark.id]) {
      setHourlyForecast(allParksWeather[selectedPark.id]);
      return;
    }

    // Obtener datos frescos si no están en caché
    setLoading(true);
    fetchWeatherWithCache(selectedPark.lat, selectedPark.lon, 3)
      .then((forecast) => {
        setHourlyForecast(forecast);
        setAllParksWeather((prev) => ({
          ...prev,
          [selectedPark.id]: forecast,
        }));
      })
      .catch((error) => {
        console.error("Error loading weather:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedPark]);

  // Recalcular scores con el perfil actual cuando cambia
  const hourlyForecastWithRecalculatedScores: HourlyWind[] = useMemo(() => {
    return hourlyForecast.map((h) => ({
      ...h,
      score: calculateVolantinScore(
        h.wind_speed_10m,
        h.wind_gusts_10m,
        kiteProfile
      ),
    }));
  }, [hourlyForecast, kiteProfile, selectedPark?.id, selectedPark?.name]);

  // Convertir HourlyWind a HourPoint para componentes
  const hourlyData: HourPoint[] = useMemo(() => {
    return hourlyForecastWithRecalculatedScores.map((h) => ({
      time: h.time,
      speed: h.wind_speed_10m,
      gust: h.wind_gusts_10m,
      score: h.score,
    }));
  }, [
    hourlyForecastWithRecalculatedScores,
    selectedPark?.id,
    selectedPark?.name,
  ]);

  // Buscar ventanas usando el algoritmo
  const windows = useMemo(() => {
    return findWindows(hourlyData, profileOpts(kiteProfile));
  }, [hourlyData, kiteProfile, selectedPark?.id, selectedPark?.name]);

  // Si no hay ventanas con el perfil estricto, buscar con umbral más bajo
  const fallbackWindows = useMemo(() => {
    if (windows.length === 0 && hourlyData.length > 0) {
      return findWindows(hourlyData, { S_min: 35, GF_max: 2.0 });
    }
    return windows;
  }, [windows, hourlyData, selectedPark?.id, selectedPark?.name]);

  // Datos de decisión para AtGlanceCard
  const now = useMemo(() => {
    return shouldFlyNow(hourlyData, profileOpts(kiteProfile), fallbackWindows);
  }, [
    hourlyData,
    kiteProfile,
    fallbackWindows,
    selectedPark?.id,
    selectedPark?.name,
  ]);

  // Próxima ventana buena (si estamos en una ventana activa ahora, usar esa. Si no, usar la próxima)
  const nextToday = useMemo(() => {
    return now?.inWindow && now.activeWindow
      ? now.activeWindow
      : getNextTodayWindow(fallbackWindows);
  }, [now, fallbackWindows, selectedPark?.id, selectedPark?.name]);

  // Mejor ventana del día completo
  const bestToday = useMemo(() => {
    return getBestToday(fallbackWindows);
  }, [fallbackWindows, selectedPark?.id, selectedPark?.name]);

  const tomorrow = useMemo(() => {
    return getBestTomorrow(fallbackWindows);
  }, [fallbackWindows, selectedPark?.id, selectedPark?.name]);

  // Preparar datos para componentes
  const atGlanceData = useMemo(() => {
    return {
      now,
      today: nextToday
        ? {
            start: nextToday.start,
            end: nextToday.end,
            meanS: nextToday.meanS,
            score: normalizeQScore(nextToday.Q),
          }
        : null,
      tomorrow: tomorrow
        ? {
            start: tomorrow.start,
            end: tomorrow.end,
            meanS: tomorrow.meanS,
            score: normalizeQScore(tomorrow.Q),
          }
        : null,
    };
  }, [now, nextToday, tomorrow, selectedPark?.id, selectedPark?.name]);

  const windowsData = fallbackWindows.slice(0, 6).map((w: any) => {
    const normalizedScore = normalizeQScore(w.Q);
    return {
      start: w.start,
      end: w.end,
      score: normalizedScore, // Normalizar Q-score a 0-100 para el badge
      meanS: w.meanS,
      gf: w.maxGF,
    };
  });

  // Prepare parks data for NearbyList with real weather data
  const parksData = SANTIAGO_PARKS.map((park) => {
    // Get weather data for this park
    const parkWeather = allParksWeather[park.id] || [];

    let best:
      | { start: string; end: string; score: number; meanS: number }
      | undefined;

    if (parkWeather.length > 0) {
      const parkHourlyData: HourPoint[] = parkWeather.map((h) => ({
        time: h.time,
        speed: h.wind_speed_10m,
        gust: h.wind_gusts_10m,
        score: calculateVolantinScore(
          h.wind_speed_10m,
          h.wind_gusts_10m,
          kiteProfile
        ),
      }));

      // Find best window for this park
      const parkWindows = findWindows(parkHourlyData, profileOpts(kiteProfile));
      const bestToday = getBestToday(parkWindows);

      if (bestToday) {
        best = {
          start: bestToday.start,
          end: bestToday.end,
          score: normalizeQScore(bestToday.Q), // Normalizar Q-score a 0-100
          meanS: bestToday.meanS,
        };
      }
    }

    // Calculate distance and ETA from user location
    let distance: number | undefined;
    let etaMin: number | undefined;

    if (latitude && longitude) {
      // Haversine formula for distance calculation
      const R = 6371; // Earth's radius in km
      const dLat = ((park.lat - latitude) * Math.PI) / 180;
      const dLon = ((park.lon - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((park.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;
      etaMin = Math.round((distance / 30) * 60); // Assuming 30 km/h travel speed
    }

    return {
      id: park.id,
      name: park.name,
      comuna: park.comuna,
      best,
      distance,
      etaMin,
    };
  }).sort((a, b) => {
    // Sort by best score first, then by distance
    if (a.best && b.best) {
      return b.best.score - a.best.score;
    }
    if (a.best && !b.best) return -1;
    if (!a.best && b.best) return 1;
    if (a.distance && b.distance) {
      return a.distance - b.distance;
    }
    return 0;
  });

  // Prepare ranking data for TopParksRanking
  const rankingData = SANTIAGO_PARKS.map((park) => {
    const parkWeather = allParksWeather[park.id] || [];

    if (parkWeather.length === 0) {
      return null;
    }

    // Filtrar hasta las 20:00 del día actual
    const now = new Date();
    const today20h = new Date(now);
    today20h.setHours(20, 0, 0, 0);

    const hoursUntil20 = parkWeather.filter((h) => {
      const hourDate = new Date(h.time);
      return hourDate >= now && hourDate <= today20h;
    });

    // Si no hay horas hasta las 20:00, usar las próximas 3 horas
    const hoursToConsider =
      hoursUntil20.length > 0 ? hoursUntil20 : parkWeather.slice(0, 3);

    // Validar que tengamos horas para considerar
    if (hoursToConsider.length === 0) {
      return null;
    }

    const hoursWithRecalculatedScores = hoursToConsider.map((h) => ({
      ...h,
      score: calculateVolantinScore(
        h.wind_speed_10m,
        h.wind_gusts_10m,
        kiteProfile
      ),
    }));

    // Encontrar la mejor hora en ese rango
    const bestHour = hoursWithRecalculatedScores.reduce(
      (best, current) => (current.score > best.score ? current : best),
      hoursWithRecalculatedScores[0]
    );

    // Calcular promedio de velocidad de las próximas 3 horas para el ranking
    const next3Hours = parkWeather.slice(0, 3);
    if (next3Hours.length === 0) {
      return null;
    }

    const avgSpeed =
      next3Hours.reduce((sum, h) => sum + h.wind_speed_10m, 0) /
      next3Hours.length;

    // Calculate distance
    let distance: number | undefined;
    let etaMin: number | undefined;

    if (latitude && longitude) {
      const R = 6371;
      const dLat = ((park.lat - latitude) * Math.PI) / 180;
      const dLon = ((park.lon - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((park.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;
      etaMin = Math.round((distance / 30) * 60);
    }

    return {
      id: park.id,
      name: park.name,
      comuna: park.comuna || "",
      zona: park.zona,
      bestScore: bestHour.score,
      bestTime: bestHour.time,
      avgSpeed,
      distance,
      etaMin,
    };
  }).filter(Boolean) as any[];

  // Schema.org JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Encumbra",
    description:
      "Aplicación web para encontrar las mejores condiciones de viento para volar volantín en Santiago de Chile",
    url: "https://encumbra.vercel.app",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CLP",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
    author: {
      "@type": "Organization",
      name: "Encumbra",
      url: "https://encumbra.vercel.app",
    },
    provider: {
      "@type": "Organization",
      name: "Open-Meteo",
      url: "https://open-meteo.com",
    },
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-slate-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 dark:bg-neutral-900/90 border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-lg shadow-black/5 dark:shadow-black/20">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2.5 sm:py-4">
            {/* Mobile: Layout de dos filas */}
            <div className="sm:hidden">
              {/* Fila 1: Logo + Theme + Settings */}
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 p-2 rounded-lg shadow-md">
                    <FaWind className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                      Encumbra
                    </h1>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-tight">
                      Vuela cuando el viento es perfecto
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md text-neutral-700 dark:text-neutral-200 font-medium transition-all duration-200 cursor-pointer text-sm touch-manipulation active:scale-95"
                    onClick={() => setSettingsOpen(true)}
                    aria-label="Abrir ajustes"
                  >
                    <FaCog className="h-5 w-5" />
                  </button>
                </div>
              </div>{" "}
              {/* Fila 2: Widgets + Loading */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ScoreInfoTooltip />
                  <TemperatureWidget
                    latitude={latitude}
                    longitude={longitude}
                  />
                </div>
                {(loading || initialLoading) && (
                  <div className="flex items-center gap-1.5 text-xs text-neutral-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                    <div className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Todo en una línea (diseño original) */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 p-2.5 rounded-xl shadow-md">
                    <FaWind className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display font-bold text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                      Encumbra
                    </h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      Vuela cuando el viento es perfecto
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-3">
                  <ScoreInfoTooltip />
                  <TemperatureWidget
                    latitude={latitude}
                    longitude={longitude}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {error && (
                  <div className="text-sm text-red-100 bg-red-500/80 px-3 py-2 rounded-full border-2 border-red-300 font-medium">
                    {error}
                  </div>
                )}
                {(loading || initialLoading) && (
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 bg-blue-50 dark:bg-purple-500/10 border border-blue-200 dark:border-purple-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-blue-500 dark:border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    {initialLoading ? "Cargando..." : "Actualizando..."}
                  </div>
                )}

                <ThemeToggle />

                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md text-neutral-700 dark:text-neutral-200 font-medium transition-all duration-200 cursor-pointer text-sm touch-manipulation active:scale-95"
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Abrir ajustes"
                >
                  <FaCog className="h-4 w-4" />
                  <span>Ajustes</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Hero */}
        <WelcomeHero
          hasLocation={!!(latitude && longitude)}
          onUseLocation={() => {
            // Geolocation is already active via useGeolocation hook
            // Just scroll to the top parks section
            const topParksSection = document.querySelector(
              ".bg-gradient-to-br.from-white.via-sky-50"
            );
            scrollToElementWithOffset(topParksSection);
          }}
          onChoosePark={() => {
            // Scroll to the map section
            const mapSection = document.querySelector("[data-map-container]");
            scrollToElementWithOffset(mapSection);
          }}
        />

        {/* Alertas Activas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AlertsList />
        </div>

        {/* Safety Strip - Franja educativa */}
        <SafetyStrip />

        <div className="mx-auto max-w-7xl px-4 py-6">
          {initialLoading ? (
            <FullPageSkeleton />
          ) : (
            <div className="space-y-8">
              {/* Sección 1: Top Parques - FULL WIDTH */}
              <div
                id="parques"
                data-top-parks
                className="bg-gradient-to-br from-white via-sky-50 to-blue-50 dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-800 rounded-3xl shadow-2xl dark:shadow-black/40 p-8"
              >
                <TopParksRanking
                  parks={rankingData}
                  onSelectPark={(id) => {
                    const park = SANTIAGO_PARKS.find((p) => p.id === id);
                    if (park) {
                      setSelectedPark(park);

                      // Scroll suave a la sección de detalles con offset por el header
                      setTimeout(() => {
                        const detailsSection = document.querySelector(
                          "[data-park-details]"
                        );
                        scrollToElementWithOffset(detailsSection);
                      }, 100); // Pequeño delay para asegurar que el DOM se actualizó
                    }
                  }}
                  selectedId={selectedPark?.id}
                  windUnits={windUnits}
                  nearestParkId={nearestParkId}
                />
              </div>

              {/* Sección 2: Detalles del Parque Seleccionado - 2 COLUMNAS */}
              {selectedPark && (
                <div
                  data-park-details
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Columna Izquierda: Gráfico Horario - Usa todo el espacio disponible */}
                  <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl dark:shadow-black/40 p-6 overflow-hidden flex flex-col border border-neutral-100 dark:border-neutral-700">
                    <div className="mb-4 flex-shrink-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                          <FaWind className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-purple-400" />
                          Condiciones por Hora
                        </h2>
                        <div className="text-xs font-bold text-blue-700 dark:text-purple-300 bg-blue-100 dark:bg-purple-950/40 px-3 py-1 rounded-full border-2 border-blue-300 dark:border-purple-700/50 whitespace-nowrap">
                          {selectedPark.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      <HourlyChart
                        hourlyData={hourlyForecastWithRecalculatedScores}
                        maxHours={20}
                        windUnits={windUnits}
                      />
                    </div>
                  </div>

                  {/* Columna Derecha: Decisión + Mejores Ventanas */}
                  <div className="space-y-6">
                    {/* Decisión Inmediata */}
                    <div className="bg-white/80 dark:bg-neutral-800/90 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-black/40 border border-neutral-200 dark:border-neutral-700 p-6">
                      <AtGlanceCard
                        key={`atglance-${selectedPark.id}`}
                        parkName={selectedPark.name}
                        now={atGlanceData.now}
                        today={atGlanceData.today}
                        tomorrow={atGlanceData.tomorrow}
                        onCreateAlert={async () => {
                          // Solicitar permiso para notificaciones
                          const hasPermission =
                            await requestNotificationPermission();

                          if (!hasPermission) {
                            toast({
                              title: "Activa las notificaciones",
                              description: (
                                <div className="space-y-2 text-sm">
                                  <p className="font-semibold">
                                    Para recibir alertas, necesitas habilitar
                                    las notificaciones:
                                  </p>
                                  <div className="bg-white/10 p-3 rounded-lg space-y-1">
                                    <p className="text-xs">
                                      <strong>En móvil:</strong> Ve a
                                      Configuración → Notificaciones → Permite
                                      notificaciones de este sitio
                                    </p>
                                    <p className="text-xs">
                                      <strong>En escritorio:</strong> Click en
                                      el candado/ícono junto a la URL → Permisos
                                      → Notificaciones: Permitir
                                    </p>
                                  </div>
                                  <p className="text-xs opacity-90">
                                    Luego intenta crear la alerta nuevamente
                                  </p>
                                </div>
                              ),
                              variant: "destructive",
                              duration: 10000,
                            });
                            return;
                          }

                          // Obtener información de la mejor ventana
                          const bestWindow =
                            atGlanceData.today || atGlanceData.tomorrow;
                          const windowType = atGlanceData.today
                            ? "hoy"
                            : "mañana";

                          if (bestWindow) {
                            // Calcular cuándo notificar (30 min antes)
                            const windowStart = new Date(bestWindow.start);
                            const notifyAt = new Date(
                              windowStart.getTime() - 30 * 60 * 1000
                            );

                            // Guardar la alerta
                            const alert = saveAlert({
                              parkName: selectedPark.name,
                              parkId: selectedPark.id,
                              windowStart: bestWindow.start,
                              windowEnd: bestWindow.end,
                              meanSpeed: bestWindow.meanS,
                              score: bestWindow.score,
                              notifyAt: notifyAt.toISOString(),
                            });

                            const startTime = new Date(
                              bestWindow.start
                            ).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            });
                            const endTime = new Date(
                              bestWindow.end
                            ).toLocaleTimeString("es-CL", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            });

                            toast({
                              title: "¡Alerta Configurada!",
                              description: (
                                <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-2.5 text-xs sm:text-sm bg-gradient-to-br from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-lg border border-brand-200 shadow-sm">
                                  <div className="flex items-center gap-2 pb-2 border-b border-brand-200 mb-1 sm:mb-2">
                                    <div className="bg-blue-500 p-1 sm:p-1.5 rounded-lg">
                                      <FaBell className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <span className="font-bold text-sm sm:text-base text-neutral-900">
                                      Detalles de tu alerta
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-1.5 sm:gap-2">
                                    <div className="bg-red-500 p-1 sm:p-1.5 rounded-lg flex-shrink-0">
                                      <FaMapMarkerAlt className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white mt-0" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-semibold text-neutral-700">
                                        Parque:
                                      </span>{" "}
                                      <span className="text-neutral-900 break-words">
                                        {selectedPark.name}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-1.5 sm:gap-2">
                                    <div className="bg-purple-500 p-1 sm:p-1.5 rounded-lg flex-shrink-0">
                                      <FaCalendarDay className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white mt-0" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-semibold text-neutral-700">
                                        Cuándo:
                                      </span>{" "}
                                      <span className="text-neutral-900 capitalize">
                                        {windowType}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-1.5 sm:gap-2">
                                    <div className="bg-amber-500 p-1 sm:p-1.5 rounded-lg flex-shrink-0">
                                      <FaClock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white mt-0" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-semibold text-neutral-700">
                                        Horario:
                                      </span>{" "}
                                      <span className="text-neutral-900 font-mono text-[11px] sm:text-xs">
                                        {startTime} - {endTime}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-1.5 sm:gap-2">
                                    <div className="bg-cyan-500 p-1 sm:p-1.5 rounded-lg flex-shrink-0">
                                      <FaWind className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white mt-0" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-semibold text-neutral-700">
                                        Viento:
                                      </span>{" "}
                                      <span className="text-neutral-900 font-mono text-[11px] sm:text-xs">
                                        {formatWindSpeed(
                                          bestWindow.meanS,
                                          windUnits,
                                          0
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-1.5 sm:gap-2">
                                    <div className="bg-yellow-500 p-1 sm:p-1.5 rounded-lg flex-shrink-0">
                                      <FaStar className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white mt-0" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-semibold text-neutral-700">
                                        Calidad:
                                      </span>{" "}
                                      <span className="text-brand-600 font-bold">
                                        {Math.round(bestWindow.score)}/100
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-brand-200 bg-green-50 rounded-lg p-2 sm:p-3">
                                    <div className="flex items-start gap-1.5 sm:gap-2">
                                      <div className="bg-green-500 p-0.5 sm:p-1 rounded flex-shrink-0">
                                        <FaBell className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] sm:text-xs font-semibold text-green-900 mb-0.5 sm:mb-1">
                                          ✅ Alerta activada exitosamente
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-green-700">
                                          Recibirás una notificación{" "}
                                          <strong>30 minutos antes</strong> (
                                          {new Date(
                                            notifyAt
                                          ).toLocaleTimeString("es-CL", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                          })}
                                          ) para que no pierdas esta ventana
                                          ideal.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ),
                              duration: 8000,
                            });
                          }
                        }}
                        windSpeed={hourlyForecast[0]?.wind_speed_10m || 0}
                        gustFactor={
                          hourlyForecast[0]?.wind_speed_10m > 0
                            ? hourlyForecast[0].wind_gusts_10m /
                              hourlyForecast[0].wind_speed_10m
                            : 1
                        }
                        precipProb={0}
                        nextWindowTime={
                          nextToday?.start && !atGlanceData.now?.ok
                            ? new Date(nextToday.start).toLocaleTimeString(
                                "es-CL",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                }
                              )
                            : undefined
                        }
                        windUnits={windUnits}
                      />
                    </div>

                    {/* Mejores Ventanas */}
                    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200">
                      <BestWindowPanel
                        windows={windowsData}
                        parkName={selectedPark.name}
                        windUnits={windUnits}
                      />
                    </div>
                  </div>

                  {/* Modo Volantín Seguro - Ancho completo */}
                  <div className="lg:col-span-2">
                    <SafetyTrafficLight
                      hourlyData={hourlyForecastWithRecalculatedScores}
                      profile={kiteProfile}
                      windUnits={windUnits}
                      hoursToShow={12}
                      parkName={selectedPark.name}
                    />
                  </div>

                  {/* Ventanas recomendadas - Ancho completo abajo */}
                  <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg dark:shadow-black/40 border border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                      <h3 className="text-xl font-display font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <FaCalendarDay className="w-4 h-4 text-blue-600 dark:text-purple-400" />
                        Ventanas recomendadas
                      </h3>
                      <div className="text-xs font-bold text-blue-700 dark:text-purple-300 bg-blue-100 dark:bg-purple-950/40 px-3 py-1 rounded-full border-2 border-blue-300 dark:border-purple-700/50 whitespace-nowrap">
                        {selectedPark.name}
                      </div>
                    </div>
                    <EducationalWindows
                      nextWindow={nextToday || undefined}
                      bestWindow={bestToday || undefined}
                      alternativeWindow={fallbackWindows[1]}
                      parkName={selectedPark.name}
                      windUnits={windUnits}
                    />
                  </div>
                </div>
              )}

              {/* Mapa de parques */}
              <div
                data-map-container
                className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg dark:shadow-black/40 border border-neutral-200 dark:border-neutral-700 p-6 relative z-10"
              >
                <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                  Mapa de Parques
                </h2>
                <div className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 relative z-10">
                  <MapView
                    selectedPark={selectedPark}
                    onSelectPark={(park: Park) => {
                      setSelectedPark(park);
                    }}
                    userLocation={
                      latitude && longitude ? { latitude, longitude } : null
                    }
                  />
                </div>

                {/* Información del parque seleccionado */}
                {selectedPark && (
                  <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-xl border border-blue-200 dark:border-purple-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {selectedPark.name}
                          </h3>
                          <TemperatureWidget
                            latitude={selectedPark.lat}
                            longitude={selectedPark.lon}
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {selectedPark.comuna}, Santiago
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="bg-white dark:bg-neutral-700 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-600 whitespace-nowrap">
                            Área: {selectedPark.area}
                          </span>
                          <span className="text-neutral-400 dark:text-neutral-500 hidden xs:inline">
                            •
                          </span>
                          <span className="text-[10px] xs:text-xs">
                            {selectedPark.lat.toFixed(4)}°,{" "}
                            {selectedPark.lon.toFixed(4)}°
                          </span>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedPark.lat},${selectedPark.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-purple-600 dark:to-violet-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 dark:hover:from-purple-700 dark:hover:to-violet-700 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        Cómo llegar
                      </a>
                    </div>
                    {selectedPark.warnings &&
                      selectedPark.warnings.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700/50">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Advertencias:
                          </p>
                          <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                            {selectedPark.warnings.map((warning, idx) => (
                              <li key={idx}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Mensaje si no hay parque seleccionado */}
              {!selectedPark && (
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-12 text-center">
                  <div className="text-6xl mb-4">
                    <svg
                      className="w-16 h-16 mx-auto text-brand-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    Selecciona un Parque
                  </h3>
                  <p className="text-neutral-600">
                    Elige un parque del ranking o del mapa para ver las
                    condiciones detalladas
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Safety Callout - CTA de seguridad persistente */}
        <SafetyCallout />

        {/* Footer */}
        <Footer />

        {/* Settings Sheet */}
        <SettingsSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          profile={kiteProfile}
          setProfile={setKiteProfile}
          units={windUnits}
          setUnits={setWindUnits}
        />
      </main>
    </>
  );
}
