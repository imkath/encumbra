"use client";

import React from "react";
import { WindowBadge } from "./WindowBadge";
import { Clock, Wind } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { formatWindSpeed, type WindUnits } from "@/lib/utils";

interface WindowInfo {
  start: string;
  end: string;
  score: number;
  meanS: number;
  gf: number;
}

interface BestWindowPanelProps {
  windows: WindowInfo[];
  parkName?: string;
  windUnits?: WindUnits;
}

export function BestWindowPanel({
  windows,
  parkName,
  windUnits = "kmh",
}: BestWindowPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-neutral-600" />
          <h2 id="best" className="text-xl font-semibold text-neutral-900">
            Ventanas próximas
          </h2>
        </div>

        {parkName && (
          <p className="text-sm text-neutral-600 mb-6 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 flex items-center gap-2">
            <FaMapMarkerAlt className="w-3 h-3 text-brand-500" />
            <span>{parkName}</span>
          </p>
        )}

        {windows.length === 0 ? (
          <div className="text-center py-12">
            <Wind className="mx-auto h-12 w-12 text-neutral-400" />
            <p className="mt-4 text-sm font-medium text-neutral-600">
              No hay ventanas recomendadas
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Las condiciones de viento no son favorables en las próximas 24h
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {windows.slice(0, 8).map((window, index) => (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 p-4 hover:shadow-card transition-shadow duration-180"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="text-sm font-semibold text-neutral-900">
                        {formatTime(window.start)} - {formatTime(window.end)}
                      </div>
                      <div className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                        {getDuration(window.start, window.end)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-600">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 cursor-help">
                            <span className="font-medium">GF:</span>
                            <span
                              className={`font-mono ${
                                window.gf <= 1.3
                                  ? "text-ok-600"
                                  : window.gf <= 1.35
                                  ? "text-mid-600"
                                  : "text-bad-600"
                              }`}
                            >
                              {window.gf.toFixed(2)}
                            </span>
                            {window.gf <= 1.3 && (
                              <FaCheckCircle className="w-3 h-3 text-ok-600" />
                            )}
                            {window.gf > 1.35 && (
                              <FaExclamationTriangle className="w-3 h-3 text-mid-600" />
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-white border border-slate-700">
                          <p className="font-semibold">
                            Factor de Ráfagas (Gust Factor)
                          </p>
                          <p className="text-xs opacity-90">
                            Ráfagas ÷ Velocidad promedio
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <span>
                        <span className="font-medium">Viento:</span>{" "}
                        <span className="font-mono">
                          {formatWindSpeed(window.meanS, windUnits)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    <WindowBadge score={window.score} size="md" />
                  </div>
                </div>

                {/* Indicador de proximidad */}
                {index === 0 && isUpcoming(window.start) && (
                  <div className="mt-3 flex items-center gap-2 text-xs bg-ok-50 border border-ok-200 rounded-lg px-3 py-2">
                    <div className="flex-shrink-0 w-2 h-2 bg-ok-500 rounded-full animate-pulse" />
                    <span className="text-ok-700 font-medium">
                      Próxima ventana • {getTimeUntil(window.start)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {windows.length > 8 && (
          <div className="mt-6 text-center border-t border-neutral-200 pt-4">
            <button className="text-sm text-brand-600 hover:text-brand-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg px-3 py-1 cursor-pointer">
              Ver {windows.length - 8} ventanas más
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getDuration(start: string, end: string): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.round(diffMs / (1000 * 60 * 60));
  return `${hours}h`;
}

function getQualityLabel(score: number): string {
  if (score >= 80) return "Óptimo";
  if (score >= 60) return "Bueno";
  if (score >= 40) return "Marginal";
  return "Bajo";
}

function isUpcoming(startTime: string): boolean {
  const start = new Date(startTime);
  const now = new Date();
  const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= 6; // Próximas 6 horas
}

function getTimeUntil(startTime: string): string {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();

  if (diffMs <= 0) return "Ahora";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `en ${hours}h ${minutes}min`;
  } else {
    return `en ${minutes}min`;
  }
}
