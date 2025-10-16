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
            // Usar nuestra API interna que llama a Nominatim desde el servidor
            const geoResponse = await fetch(
              `/api/geocode?lat=${latitude}&lon=${longitude}`
            );

            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              setLocationName(geoData.locationName || "Tu ubicación");
            } else {
              setLocationName("Tu ubicación");
            }
          } catch (geoError) {
            console.error("Error fetching location name:", geoError);
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
