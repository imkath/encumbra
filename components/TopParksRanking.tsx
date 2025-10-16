"use client";

import React, { useState } from "react";
import { MapPin, Navigation, Clock, TrendingUp } from "lucide-react";
import {
  FaTrophy,
  FaMedal,
  FaAward,
  FaMapMarkerAlt,
  FaWind,
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import { SafetyBadges } from "./SafetyBadges";
import { ScoreTooltip } from "./ScoreTooltip";
import { TopParksRankingSkeleton } from "./LoadingSkeleton";
import { formatWindSpeed, type WindUnits } from "@/lib/utils";

// Interfaces de TypeScript

type Zona = "Todas" | "Oriente" | "Centro" | "Poniente" | "Norte" | "Sur";

interface ParkRanking {
  id: string;
  name: string;
  comuna: string;
  zona?: Zona;
  bestScore: number;
  bestTime: string;
  avgSpeed: number;
  distance?: number;
  etaMin?: number;
}

interface TopParksRankingProps {
  parks: ParkRanking[];
  onSelectPark: (id: string) => void;
  selectedId?: string;
  windUnits?: WindUnits;
  nearestParkId?: string; // ID del parque más cercano a la ubicación del usuario
}

export function TopParksRanking({
  parks,
  onSelectPark,
  selectedId,
  windUnits = "kmh",
  nearestParkId,
}: TopParksRankingProps) {
  const [selectedZone, setSelectedZone] = useState<Zona>("Todas");

  const zones: Zona[] = [
    "Todas",
    "Oriente",
    "Centro",
    "Poniente",
    "Norte",
    "Sur",
  ];

  // Determinar si el usuario compartió ubicación (si algún parque tiene distance)
  const hasLocation = parks.some((p) => p.distance !== undefined);

  // LÓGICA NUEVA:
  // - Si zona === "Todas" Y hay ubicación → Mostrar 5 más cercanos
  // - Si zona !== "Todas" → Mostrar mejores 5 de esa zona (sin filtro de cercanía)

  let parksToShow = parks;
  let nearestInZone: string | undefined = undefined;

  if (selectedZone === "Todas" && hasLocation) {
    // CASO 1: "Todas" con ubicación → 5 más cercanos
    parksToShow = [...parks]
      .filter((p) => p.distance !== undefined)
      .sort((a, b) => a.distance! - b.distance!)
      .slice(0, 5);

    // El más cercano es el primero de la lista
    if (parksToShow.length > 0) {
      nearestInZone = parksToShow[0].id;
    }
  } else if (selectedZone !== "Todas") {
    // CASO 2: Zona específica → Todos los de esa zona (sin límite de cercanía)
    parksToShow = parks.filter((p) => p.zona === selectedZone);

    // Encontrar el más cercano de esa zona si hay ubicación
    if (hasLocation && parksToShow.length > 0) {
      const parksWithDistance = parksToShow.filter(
        (p) => p.distance !== undefined
      );
      if (parksWithDistance.length > 0) {
        const nearestPark = parksWithDistance.reduce((nearest, current) =>
          current.distance! < nearest.distance! ? current : nearest
        );
        nearestInZone = nearestPark.id;
      }
    }
  }
  // CASO 3: "Todas" sin ubicación → Mostrar todos (parksToShow = parks por defecto)

  // Ordenar por score y tomar top 5
  const topParks = [...parksToShow]
    .filter((p) => p.bestScore !== undefined && p.bestScore !== null)
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 5);

  if (topParks.length === 0) {
    // Mostrar skeleton si está cargando, mensaje si no hay datos
    if (parks.length === 0) {
      return <TopParksRankingSkeleton />;
    }
    return (
      <div className="text-center py-12 text-neutral-500">
        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No hay parques en esta zona</p>
        <p className="text-sm mt-1">Intenta seleccionar otra zona</p>
      </div>
    );
  }

  // Función para obtener el estilo del círculo de posición
  const getRankStyle = (index: number) => {
    if (index === 0) {
      // Primer lugar: oro limpio
      return "bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-amber-500 dark:to-yellow-600 text-white";
    }
    if (index === 1) {
      // Segundo lugar: plata limpia
      return "bg-gradient-to-br from-gray-400 to-slate-500 dark:from-gray-500 dark:to-slate-600 text-white";
    }
    if (index === 2) {
      // Tercer lugar: bronce limpio
      return "bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 text-white";
    }
    // Resto: diseño neutro
    return "bg-white dark:bg-neutral-700 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-brand-600 dark:text-purple-400";
    if (score >= 60) return "text-ok-600 dark:text-green-400";
    if (score >= 40) return "text-mid-600 dark:text-yellow-400";
    return "text-bad-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80)
      return "bg-brand-50 dark:bg-purple-950/30 border-brand-200 dark:border-purple-700";
    if (score >= 60)
      return "bg-ok-50 dark:bg-green-950/30 border-ok-200 dark:border-green-700";
    if (score >= 40)
      return "bg-mid-50 dark:bg-yellow-950/30 border-mid-200 dark:border-yellow-700";
    return "bg-bad-50 dark:bg-red-950/30 border-bad-200 dark:border-red-700";
  };

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500 dark:text-purple-500 flex-shrink-0" />
            Mejores Parques Ahora
          </h3>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 sm:text-right">
            Actualizado:{" "}
            {new Date().toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </div>
        </div>
      </div>

      {/* Filtro por zona */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedZone === zone
                ? "bg-brand-500 dark:bg-purple-600 text-white shadow-md"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {zone}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {topParks.map((park, index) => {
          const isSelected = selectedId === park.id;
          const isTopThree = index < 3;
          // Usar el más cercano de la zona filtrada si hay ubicación
          const isNearest = hasLocation
            ? nearestInZone === park.id
            : nearestParkId === park.id;

          return (
            <button
              key={park.id}
              onClick={() => onSelectPark(park.id)}
              className={`w-full text-left rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-brand-500 dark:border-purple-500 bg-brand-50 dark:bg-purple-950/30 shadow-lg dark:shadow-purple-500/20 scale-[1.02]"
                  : isTopThree
                  ? "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-brand-300 dark:hover:border-purple-600 hover:shadow-md dark:hover:shadow-black/40"
                  : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-750 hover:shadow-md dark:hover:shadow-black/40"
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-4">
                {/* Círculo con número de posición - más pequeño en mobile */}
                <div
                  className={`flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm ${getRankStyle(
                    index
                  )}`}
                >
                  <span className="text-lg sm:text-2xl font-extrabold tracking-tight">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Mobile: Layout vertical optimizado */}
                  <div className="sm:hidden">
                    {/* Título completo arriba */}
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                        {park.name}
                      </h4>
                      {isNearest && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[9px] font-bold rounded-full border border-blue-300 dark:border-blue-700 whitespace-nowrap">
                          <Navigation className="w-2.5 h-2.5" />
                          Cercano
                        </span>
                      )}
                    </div>

                    {/* Comuna y distancia */}
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-neutral-600 dark:text-neutral-200 flex items-center gap-1">
                        <FaMapMarkerAlt className="w-2.5 h-2.5" />
                        {park.comuna}
                      </p>
                      {park.distance !== undefined && (
                        <div className="flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300">
                          <Navigation className="w-2.5 h-2.5" />
                          <span className="font-mono">
                            {park.distance.toFixed(1)} km
                          </span>
                          {park.etaMin !== undefined && (
                            <span className="text-neutral-500 dark:text-neutral-400">
                              · {park.etaMin} min
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Score */}
                    <div className="mb-2">
                      <div
                        className={`inline-flex px-3 py-1 rounded-full border-2 ${getScoreBg(
                          park.bestScore
                        )}`}
                      >
                        <div
                          className={`text-base font-bold ${getScoreColor(
                            park.bestScore
                          )} leading-none`}
                        >
                          {Math.round(park.bestScore)}
                        </div>
                        <ScoreTooltip side="right">
                          <span className="text-[9px] text-neutral-500 ml-1">
                            score
                          </span>
                        </ScoreTooltip>
                      </div>
                    </div>

                    {/* Safety Badges */}
                    <SafetyBadges />

                    {/* Hora y viento */}
                    <div className="flex items-center gap-3 text-[11px] text-neutral-600 dark:text-neutral-300 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="font-medium">Mejor:</span>
                        <span className="font-mono text-brand-600 dark:text-purple-400">
                          {new Date(park.bestTime).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FaWind className="w-2.5 h-2.5" />
                        <span className="font-mono text-neutral-900 dark:text-neutral-100">
                          {formatWindSpeed(park.avgSpeed, windUnits)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Layout horizontal original */}
                  <div className="hidden sm:block">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate">
                            {park.name}
                          </h4>
                          {isNearest && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-300 dark:border-blue-700 whitespace-nowrap">
                              <Navigation className="w-3 h-3" />
                              Más cercano
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-200 flex items-center gap-1">
                          <FaMapMarkerAlt className="w-3 h-3" />
                          {park.comuna}
                        </p>
                      </div>

                      {/* Score */}
                      <div
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full border-2 min-w-[70px] ${getScoreBg(
                          park.bestScore
                        )}`}
                      >
                        <div
                          className={`text-lg font-bold ${getScoreColor(
                            park.bestScore
                          )} leading-none text-center`}
                        >
                          {Math.round(park.bestScore)}
                        </div>
                        <ScoreTooltip side="right">
                          <div className="text-[10px] text-neutral-500 text-center">
                            score
                          </div>
                        </ScoreTooltip>
                      </div>
                    </div>

                    {/* Safety Badges */}
                    <SafetyBadges />

                    {/* Info row */}
                    <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">Mejor:</span>
                        <span className="font-mono text-brand-600 dark:text-purple-400">
                          {new Date(park.bestTime).toLocaleTimeString("es-CL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FaWind className="w-3 h-3" />
                        <span className="font-mono text-neutral-900 dark:text-neutral-100">
                          {formatWindSpeed(park.avgSpeed, windUnits)}
                        </span>
                      </div>

                      {park.distance !== undefined && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Navigation className="w-3 h-3" />
                          <span className="font-mono">
                            {park.distance.toFixed(1)} km
                          </span>
                          {park.etaMin !== undefined && (
                            <span className="text-neutral-500 dark:text-neutral-400">
                              · {park.etaMin} min
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2 text-[10px] xs:text-xs text-brand-600 dark:text-purple-400 font-medium flex items-center gap-1">
                      <IoSparkles className="w-3 h-3" />
                      Parque seleccionado
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300">
        <p className="flex items-center gap-2">
          <IoSparkles className="text-brand-500 dark:text-purple-500" />
          <span>
            {selectedZone === "Todas" && hasLocation
              ? "Mostrando los 5 parques más cercanos a tu ubicación ordenados por mejores condiciones"
              : selectedZone !== "Todas"
              ? `Mostrando los mejores parques de la zona ${selectedZone} ordenados por condiciones de viento`
              : "Los parques se ordenan por las mejores condiciones de viento en las próximas 3 horas"}
          </span>
        </p>
      </div>
    </div>
  );
}
