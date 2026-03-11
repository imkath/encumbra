"use client";

import { useEffect, useState } from "react";
import { Thermometer, MapPin } from "lucide-react";

interface TemperatureWidgetProps {
  latitude?: number | null;
  longitude?: number | null;
}

export function TemperatureWidget({
  latitude,
  longitude,
}: TemperatureWidgetProps) {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("Santiago");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Usar ubicación del usuario o Santiago por defecto
        const lat = latitude ?? -33.4489;
        const lon = longitude ?? -70.6693;

        // Fetch temperatura actual desde Open-Meteo
        const tempResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`
        );

        if (!tempResponse.ok) throw new Error("Error fetching temperature");

        const tempData = await tempResponse.json();
        setTemperature(tempData.current.temperature_2m);

        // Geocodificación inversa para obtener la comuna
        if (latitude && longitude) {
          try {
            // Si la API interna no está disponible (dev server no arrancado), evitamos logs repetidos
            const geoUrl = `/api/geocode?lat=${latitude}&lon=${longitude}`;

            // pequeño timeout para no colgar la UI
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);

            const geoResponse = await fetch(geoUrl, {
              signal: controller.signal,
            });
            clearTimeout(timeout);

            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              setLocationName(geoData.locationName || "Tu ubicación");
            } else {
              // no hacer console.error para evitar spam en dev cuando el back no está
              setLocationName("Tu ubicación");
            }
          } catch (geoError) {
            // Evitar logging repetido: solo loguear la primera vez
            if (!(window as any).__geo_fetch_failed) {
              console.error("Error fetching location name:", geoError);
              (window as any).__geo_fetch_failed = true;
            }
            setLocationName("Tu ubicación");
          }
        } else {
          setLocationName("Santiago");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setTemperature(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Thermometer className="w-4 h-4 text-orange-500 dark:text-amber-400 animate-pulse" />
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          --°
        </span>
      </div>
    );
  }

  if (temperature === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <Thermometer className="w-4 h-4 text-orange-500 dark:text-amber-400" />
      <span className="text-sm font-bold text-orange-700 dark:text-amber-400">
        {Math.round(temperature)}°C
      </span>
      <div className="w-px h-4 bg-orange-300 dark:bg-amber-600" />
      <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-amber-500" />
      <span className="text-xs font-medium text-orange-600 dark:text-amber-400">
        {locationName}
      </span>
    </div>
  );
}
