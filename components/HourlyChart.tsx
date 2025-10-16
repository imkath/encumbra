"use client";

import React, { useState } from "react";
import type { HourlyWind } from "@/lib/types";
import { Wind } from "lucide-react";
import { FaStar } from "react-icons/fa";
import { ScoreTooltip } from "@/components/ScoreTooltip";
import {
  convertWindSpeed,
  getWindUnitLabel,
  type WindUnits,
} from "@/lib/utils";

interface HourlyChartProps {
  hourlyData: HourlyWind[];
  maxHours?: number;
  windUnits?: WindUnits;
}

type ViewMode = "next20" | "tomorrow" | "dayAfter";

export function HourlyChart({
  hourlyData,
  maxHours = 20,
  windUnits = "kmh",
}: HourlyChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("next20");

  const now = new Date();

  // Calcular límites de fechas
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const tomorrowStart = new Date(todayEnd);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  const dayAfterStart = new Date(tomorrowEnd);
  const dayAfterEnd = new Date(dayAfterStart);
  dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);

  // Nombres de días en español
  const getDayName = (date: Date) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return days[date.getDay()];
  };

  const tomorrowName = getDayName(tomorrowStart);
  const dayAfterName = getDayName(dayAfterStart);

  // Encontrar el índice de la hora actual
  const currentIndex = hourlyData.findIndex((hour) => {
    const hourDate = new Date(hour.time);
    return hourDate >= now;
  });

  const startIndex = currentIndex >= 0 ? currentIndex : 0;

  // Filtrar datos según el modo de vista
  let displayData: HourlyWind[];

  if (viewMode === "next20") {
    // Mostrar próximas 20 horas desde ahora
    displayData = hourlyData.slice(startIndex, startIndex + maxHours);
  } else if (viewMode === "tomorrow") {
    // Mostrar todo el día de mañana
    displayData = hourlyData.filter((hour) => {
      const hourDate = new Date(hour.time);
      return hourDate >= tomorrowStart && hourDate < tomorrowEnd;
    });
  } else {
    // dayAfter: Mostrar el día después de mañana
    displayData = hourlyData.filter((hour) => {
      const hourDate = new Date(hour.time);
      return hourDate >= dayAfterStart && hourDate < dayAfterEnd;
    });
  }

  // Si no hay datos disponibles, mostrar mensaje
  if (displayData.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        <Wind className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay datos disponibles</p>
      </div>
    );
  }

  // Encontrar el valor máximo para escalar las barras
  const maxSpeed = Math.max(...displayData.map((d) => d.wind_speed_10m));
  const maxScore = 100;

  return (
    <div className="flex flex-col h-full">
      {/* Selector de vista */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <button
          onClick={() => setViewMode("next20")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            viewMode === "next20"
              ? "bg-blue-600 dark:bg-purple-600 text-white shadow-md"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Próximas 20h
        </button>
        <button
          onClick={() => setViewMode("tomorrow")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            viewMode === "tomorrow"
              ? "bg-blue-600 dark:bg-purple-600 text-white shadow-md"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Mañana
        </button>
        <button
          onClick={() => setViewMode("dayAfter")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            viewMode === "dayAfter"
              ? "bg-blue-600 dark:bg-purple-600 text-white shadow-md"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          {dayAfterName}
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 pb-2 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
        <span>
          {viewMode === "next20" &&
            `Próximas ${displayData.length} horas (desde ahora)`}
          {viewMode === "tomorrow" &&
            `Mañana (todo el ${tomorrowName.toLowerCase()})`}
          {viewMode === "dayAfter" &&
            `${dayAfterName} (todo el ${dayAfterName.toLowerCase()})`}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-brand-500 dark:bg-purple-500"></div>
            <span>Velocidad</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-ok-500 dark:bg-green-500"></div>
            <ScoreTooltip side="bottom">
              <span>Puntuación</span>
            </ScoreTooltip>
          </div>
        </div>
      </div>

      {/* Gráfico de barras con scroll vertical */}
      <div className="relative flex-1 mt-4 min-h-0">
        <div className="space-y-2 h-full overflow-y-auto pr-2 scrollbar-thin">
          {displayData.map((hour, index) => {
            const time = new Date(hour.time);
            const timeStr = time.toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });

            // Calcular porcentajes para las barras
            const speedPercent = (hour.wind_speed_10m / maxSpeed) * 100;
            const scorePercent = (hour.score / maxScore) * 100;

            // Determinar si es la hora actual o una buena hora
            // Solo mostrar "Ahora" en modo "Próximas 20h" y si es el primer elemento
            const isNow = viewMode === "next20" && index === 0;
            const isBestHour = hour.score >= 60;

            return (
              <div
                key={hour.time}
                className={`group relative ${
                  isNow
                    ? "bg-brand-50 dark:bg-purple-950/30 border-l-4 border-brand-500 dark:border-purple-500 pl-3 -ml-3 pr-3 py-2 rounded-r-lg"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Hora */}
                  <div className="w-14 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {timeStr}
                    {isNow && (
                      <span className="block text-[10px] text-brand-600 dark:text-purple-400 font-normal">
                        Ahora
                      </span>
                    )}
                  </div>

                  {/* Barras */}
                  <div className="flex-1 space-y-1">
                    {/* Barra de velocidad */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 transition-all duration-500"
                          style={{ width: `${Math.max(speedPercent, 5)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 drop-shadow-sm">
                            {convertWindSpeed(
                              hour.wind_speed_10m,
                              windUnits
                            ).toFixed(1)}{" "}
                            {getWindUnitLabel(windUnits)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de score */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full transition-all duration-500 ${
                            hour.score >= 80
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600"
                              : hour.score >= 60
                              ? "bg-gradient-to-r from-blue-400 to-sky-500 dark:from-blue-500 dark:to-cyan-600"
                              : hour.score >= 40
                              ? "bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600"
                              : "bg-gradient-to-r from-red-400 to-rose-500 dark:from-red-500 dark:to-rose-600"
                          }`}
                          style={{ width: `${Math.max(scorePercent, 5)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-1">
                          <span className="text-[9px] font-bold text-white dark:text-white drop-shadow-sm">
                            Q{Math.round(hour.score)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge de mejor hora */}
                  {isBestHour && (
                    <div className="flex-shrink-0">
                      <div className="px-1.5 py-0.5 bg-ok-100 dark:bg-green-950/30 text-ok-700 dark:text-green-400 text-[10px] font-semibold rounded-full border border-ok-300 dark:border-green-700/50 flex items-center gap-1">
                        <FaStar className="w-2.5 h-2.5" />
                        <span>Buena</span>
                      </div>
                    </div>
                  )}

                  {/* Ráfagas (tooltip) */}
                  <div className="flex-shrink-0 w-10 text-right">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      <span className="font-mono">
                        {Math.round(hour.wind_gusts_10m)}
                      </span>
                      <span className="block text-[9px] text-neutral-400 dark:text-neutral-500">
                        ráfagas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen compacto */}
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-3 gap-2 text-center flex-shrink-0">
        <div>
          <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {convertWindSpeed(
              displayData.reduce((sum, h) => sum + h.wind_speed_10m, 0) /
                displayData.length,
              windUnits
            ).toFixed(1)}
          </div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
            Promedio {getWindUnitLabel(windUnits)}
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-ok-600 dark:text-green-400">
            {displayData.filter((h) => h.score >= 60).length}
          </div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
            Horas buenas
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-brand-600 dark:text-purple-400">
            {Math.round(Math.max(...displayData.map((h) => h.score)))}
          </div>
          <ScoreTooltip side="top">
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Mejor Q-score
            </div>
          </ScoreTooltip>
        </div>
      </div>
    </div>
  );
}
