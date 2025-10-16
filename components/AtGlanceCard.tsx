"use client";

import React from "react";
import { WindowBadge } from "./WindowBadge";
import { FaBullseye, FaClock, FaCalendarDay, FaBell } from "react-icons/fa";
import { TipCard } from "./TipCard";
import { formatWindSpeed, type WindUnits } from "@/lib/utils";

type AtGlanceProps = {
  parkName: string;
  now: {
    ok: boolean;
    reason: string;
    score: number;
    inWindow?: boolean;
    activeWindow?: { start: string; end: string; meanS: number; Q: number };
  } | null;
  today: { start: string; end: string; meanS: number; score: number } | null;
  tomorrow: { start: string; end: string; meanS: number; score: number } | null;
  onCreateAlert?: () => void;
  // Datos para TipCard
  windSpeed?: number;
  gustFactor?: number;
  precipProb?: number;
  nextWindowTime?: string;
  // Configuración de usuario
  windUnits?: WindUnits;
};

export function AtGlanceCard({
  parkName,
  now,
  today,
  tomorrow,
  onCreateAlert,
  windSpeed = 0,
  gustFactor = 1,
  precipProb = 0,
  nextWindowTime,
  windUnits = "kmh",
}: AtGlanceProps) {
  return (
    <section aria-labelledby="agl">
      <div className="text-center mb-4">
        <h2
          id="agl"
          className="text-xl font-display font-bold text-neutral-900 flex items-center justify-center gap-2"
        >
          <FaBullseye className="w-5 h-5 text-brand-500" />
          <span>Decisión Rápida</span>
        </h2>
      </div>

      <div className="space-y-3">
        {/* AHORA */}
        <div
          className={`rounded-xl border-2 p-6 text-center transition-all duration-300 ${
            now?.ok
              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg shadow-green-500/20"
              : "bg-gradient-to-br from-red-50 to-orange-50 border-red-300 shadow-lg shadow-red-500/20"
          }`}
        >
          <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-3 flex items-center justify-center gap-1.5">
            <FaClock className="w-3.5 h-3.5" />
            <span>Ahora Mismo</span>
          </div>
          {now ? (
            <>
              <div
                className={`text-6xl font-black mb-3 ${
                  now.ok ? "text-green-600" : "text-red-600"
                }`}
              >
                {now.ok ? "¡SÍ!" : "NO"}
              </div>
              <div className="mb-3 flex justify-center">
                <WindowBadge score={now.score} size="lg" />
              </div>
              <p
                className={`text-sm leading-relaxed font-semibold ${
                  now.ok ? "text-green-700" : "text-red-700"
                }`}
              >
                {now.reason}
              </p>
            </>
          ) : (
            <div className="text-sm text-neutral-500 py-4">
              Cargando datos...
            </div>
          )}
        </div>

        {/* HOY y MAÑANA en grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* MEJOR HOY - Siempre con el mismo título, pero datos dinámicos */}
          <div className="rounded-xl border border-neutral-200 p-4 bg-white hover:shadow-md transition-all">
            <div className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <FaCalendarDay className="w-3 h-3" />
              <span>Mejor Hoy</span>
            </div>
            {today ? (
              <>
                <div className="text-sm font-bold text-neutral-900 mb-2">
                  {formatTime(today.start)}-{formatTime(today.end)}
                </div>
                <WindowBadge
                  score={today.score}
                  label={formatWindSpeed(today.meanS, windUnits, 0)}
                  size="sm"
                />
              </>
            ) : (
              <div className="text-xs text-neutral-500 py-2">
                No hay ventana
              </div>
            )}
          </div>

          {/* MAÑANA */}
          <div className="rounded-xl border border-neutral-200 p-4 bg-white hover:shadow-md transition-all">
            <div className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <FaCalendarDay className="w-3 h-3" />
              <span>Mejor Mañana</span>
            </div>
            {tomorrow ? (
              <>
                <div className="text-sm font-bold text-neutral-900 mb-2">
                  {formatTime(tomorrow.start)}-{formatTime(tomorrow.end)}
                </div>
                <WindowBadge
                  score={tomorrow.score}
                  label={formatWindSpeed(tomorrow.meanS, windUnits, 0)}
                  size="sm"
                />
              </>
            ) : (
              <div className="text-xs text-neutral-500 py-2">No detectada</div>
            )}
          </div>
        </div>
      </div>

      {/* Consejo del momento */}
      <TipCard
        windSpeed={windSpeed}
        gustFactor={gustFactor}
        precipProb={precipProb}
        nextWindowTime={nextWindowTime}
        isGoodToFly={now?.ok}
        inWindow={now?.inWindow}
      />

      {/* Botón de alerta */}
      <div className="mt-4">
        <button
          className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-neutral-300 disabled:to-neutral-400 disabled:shadow-none cursor-pointer"
          onClick={onCreateAlert}
          disabled={!today && !tomorrow}
          aria-label="Activar alerta para la mejor ventana"
        >
          <span className="flex items-center justify-center gap-2">
            <FaBell className="w-4 h-4" />
            <span>Activar alerta</span>
          </span>
        </button>
        <p className="text-xs text-neutral-600 mt-2 text-center">
          Te avisamos cuando sea el momento ideal
        </p>
      </div>
    </section>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
