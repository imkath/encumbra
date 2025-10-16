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

  // Función para obtener el número de posición
  const getMedalIcon = (index: number) => {
    return (
      <span className="text-2xl font-extrabold tracking-tight">
        {index + 1}
      </span>
    );
  };

  // Función para obtener el estilo del círculo de posición
  const getRankStyle = (index: number) => {
    if (index === 0) {
      // Primer lugar: oro limpio
      return "bg-gradient-to-br from-amber-400 to-yellow-500 text-white";
    }
    if (index === 1) {
      // Segundo lugar: plata limpia
      return "bg-gradient-to-br from-gray-400 to-slate-500 text-white";
    }
    if (index === 2) {
      // Tercer lugar: bronce limpio
      return "bg-gradient-to-br from-orange-500 to-amber-600 text-white";
    }
    // Resto: diseño neutro
    return "bg-white border-2 border-neutral-300 text-neutral-600";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-brand-600";
    if (score >= 60) return "text-ok-600";
    if (score >= 40) return "text-mid-600";
    return "text-bad-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-brand-50 border-brand-200";
    if (score >= 60) return "bg-ok-50 border-ok-200";
    if (score >= 40) return "bg-mid-50 border-mid-200";
    return "bg-bad-50 border-bad-200";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-500" />
          Mejores Parques Ahora
        </h3>
        <div className="text-xs text-neutral-500">
          Actualizado:{" "}
          {new Date().toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
      </div>

      {/* Filtro por zona */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-200">
        {zones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedZone === zone
                ? "bg-brand-500 text-white shadow-md"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
              className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-lg scale-[1.02]"
                  : isTopThree
                  ? "border-neutral-200 bg-white hover:border-brand-300 hover:shadow-md"
                  : "border-neutral-200 bg-neutral-50 hover:bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Círculo con número de posición - limpio */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${getRankStyle(
                    index
                  )}`}
                >
                  {getMedalIcon(index)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-neutral-900 truncate">
                          {park.name}
                        </h4>
                        {isNearest && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-300 whitespace-nowrap">
                            <Navigation className="w-3 h-3" />
                            Más cercano
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 flex items-center gap-1">
                        <FaMapMarkerAlt className="w-3 h-3" />
                        {park.comuna}
                      </p>
                    </div>

                    {/* Contenedor del score - más ancho */}
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

                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">Mejor:</span>
                      <span className="font-mono text-brand-600">
                        {new Date(park.bestTime).toLocaleTimeString("es-CL", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <FaWind className="w-3 h-3" />
                      <span className="font-mono text-neutral-900">
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
                          <span className="text-neutral-500">
                            · {park.etaMin} min
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-2 text-xs text-brand-600 font-medium flex items-center gap-1">
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

      <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600">
        <p className="flex items-center gap-2">
          <IoSparkles className="text-brand-500" />
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
