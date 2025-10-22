"use client";

import React, { useState, useEffect } from "react";
import { WindowBadge } from "./WindowBadge";
import {
  FaBullseye,
  FaClock,
  FaCalendarDay,
  FaBell,
  FaCheck,
} from "react-icons/fa";
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
  // Estado para el permiso de notificaciones
  const [notificationPermission, setNotificationPermission] = useState<
    "granted" | "denied" | "default"
  >("default");

  useEffect(() => {
    // Verificar permiso inicial
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Escuchar cambios en el permiso
    const checkPermission = () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationPermission(Notification.permission);
      }
    };

    // Verificar periódicamente por cambios
    const interval = setInterval(checkPermission, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <section aria-labelledby="agl">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2
          id="agl"
          className="text-xl font-display font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2"
        >
          <FaBullseye className="w-5 h-5 text-brand-500 dark:text-purple-500" />
          <span>Decisión Rápida</span>
        </h2>
        <div className="text-xs font-bold text-blue-700 dark:text-purple-300 bg-blue-100 dark:bg-purple-950/40 px-3 py-1 rounded-full border-2 border-blue-300 dark:border-purple-700/50 whitespace-nowrap">
          {parkName}
        </div>
      </div>

      <div className="space-y-3">
        {/* AHORA */}
        <div
          className={`rounded-xl border-2 p-6 text-center transition-all duration-300 ${
            now?.ok
              ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-700 shadow-lg shadow-green-500/20 dark:shadow-green-500/10"
              : "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-300 dark:border-red-700 shadow-lg shadow-red-500/20 dark:shadow-red-500/10"
          }`}
        >
          <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-3 flex items-center justify-center gap-1.5">
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
                  now.ok
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }`}
              >
                {now.reason}
              </p>
            </>
          ) : (
            <div className="text-sm text-neutral-500 dark:text-neutral-400 py-4">
              Cargando datos...
            </div>
          )}
        </div>

        {/* HOY y MAÑANA en grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* MEJOR HOY - Siempre con el mismo título, pero datos dinámicos */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800 hover:shadow-md dark:hover:shadow-black/40 transition-all">
            <div className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <FaCalendarDay className="w-3 h-3" />
              <span>Mejor Hoy</span>
            </div>
            {today ? (
              <>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {formatTime(today.start)}-{formatTime(today.end)}
                </div>
                <WindowBadge
                  score={today.score}
                  label={formatWindSpeed(today.meanS, windUnits, 0)}
                  size="sm"
                />
              </>
            ) : (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 py-2">
                No hay ventana
              </div>
            )}
          </div>

          {/* MAÑANA */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-800 hover:shadow-md dark:hover:shadow-black/40 transition-all">
            <div className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <FaCalendarDay className="w-3 h-3" />
              <span>Mejor Mañana</span>
            </div>
            {tomorrow ? (
              <>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {formatTime(tomorrow.start)}-{formatTime(tomorrow.end)}
                </div>
                <WindowBadge
                  score={tomorrow.score}
                  label={formatWindSpeed(tomorrow.meanS, windUnits, 0)}
                  size="sm"
                />
              </>
            ) : (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 py-2">
                No detectada
              </div>
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
          className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-purple-600 dark:to-violet-600 text-white text-sm font-bold hover:from-blue-600 hover:to-cyan-600 dark:hover:from-purple-700 dark:hover:to-violet-700 hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-neutral-300 disabled:to-neutral-400 dark:disabled:from-neutral-700 dark:disabled:to-neutral-600 disabled:shadow-none cursor-pointer"
          onClick={onCreateAlert}
          disabled={!today && !tomorrow}
          aria-label="Activar alerta para la mejor ventana"
        >
          <span className="flex items-center justify-center gap-2">
            <FaBell className="w-4 h-4" />
            <span>
              {notificationPermission === "granted"
                ? "Crear alerta"
                : "Crear alerta (activar notificaciones)"}
            </span>
          </span>
        </button>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 text-center flex items-center justify-center gap-1">
          {notificationPermission === "granted" ? (
            <>
              <FaCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
              Te avisamos cuando sea el momento ideal
            </>
          ) : (
            <>
              <FaBell className="w-3 h-3" />
              Primero necesitas permitir notificaciones
            </>
          )}
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
