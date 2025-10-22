"use client";

import type { HourlyWind } from "@/lib/types";
import type { KiteProfile } from "@/lib/volantin-score";
import { convertWindSpeed, type WindUnits } from "@/lib/utils";
import Link from "next/link";
import { FaTrafficLight } from "react-icons/fa";

const PROFILE_CONFIG: Record<
  KiteProfile,
  {
    label: string;
    safeScore: number;
    cautionScore: number;
    safeGF: number;
    cautionGF: number;
  }
> = {
  liviano: {
    label: "Perfil liviano",
    safeScore: 60,
    cautionScore: 45,
    safeGF: 1.25,
    cautionGF: 1.4,
  },
  estandar: {
    label: "Perfil estándar",
    safeScore: 65,
    cautionScore: 50,
    safeGF: 1.3,
    cautionGF: 1.5,
  },
  acrobatico: {
    label: "Perfil acrobático",
    safeScore: 60,
    cautionScore: 45,
    safeGF: 1.4,
    cautionGF: 1.6,
  },
};

type SafetyLevel = "safe" | "caution" | "danger";

const LEVEL_STYLES: Record<
  SafetyLevel,
  {
    badge: string;
    badgeText: string;
    dot: string;
    border: string;
    bg: string;
    label: string;
  }
> = {
  safe: {
    badge: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-700/40",
    badgeText: "text-green-700 dark:text-green-300",
    dot: "bg-green-500 dark:bg-green-400",
    border: "border-green-200 dark:border-green-700/60",
    bg: "bg-white dark:bg-neutral-900",
    label: "Seguro",
  },
  caution: {
    badge: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-700/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500 dark:bg-amber-400",
    border: "border-amber-200 dark:border-amber-700/60",
    bg: "bg-white dark:bg-neutral-900",
    label: "Precaución",
  },
  danger: {
    badge: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-700/40",
    badgeText: "text-red-700 dark:text-red-300",
    dot: "bg-red-500 dark:bg-red-400",
    border: "border-red-200 dark:border-red-700/60",
    bg: "bg-white dark:bg-neutral-900",
    label: "Evita",
  },
};

type SafetyTrafficLightProps = {
  hourlyData: HourlyWind[];
  profile: KiteProfile;
  windUnits?: WindUnits;
  hoursToShow?: number;
  parkName?: string;
};

type HourSafetyInfo = {
  level: SafetyLevel;
  reason: string;
  gustFactor: number;
};

function evaluateHourSafety(
  hour: HourlyWind,
  profile: KiteProfile
): HourSafetyInfo {
  const config = PROFILE_CONFIG[profile];
  const gustFactor =
    hour.wind_speed_10m > 0
      ? hour.wind_gusts_10m / Math.max(hour.wind_speed_10m, 1)
      : 1;

  if (
    hour.score < config.cautionScore ||
    gustFactor >= config.cautionGF ||
    hour.wind_gusts_10m >= 55
  ) {
    return {
      level: "danger",
      reason:
        hour.wind_gusts_10m >= 55
          ? "Ráfagas extremas"
          : hour.score < config.cautionScore
          ? "Viento insuficiente"
          : "Ráfagas muy inestables",
      gustFactor,
    };
  }

  if (
    hour.score < config.safeScore ||
    gustFactor >= config.safeGF ||
    hour.wind_gusts_10m >= 40
  ) {
    return {
      level: "caution",
      reason:
        hour.wind_gusts_10m >= 40
          ? "Ráfagas moderadas"
          : hour.score < config.safeScore
          ? "Viento marginal"
          : "Ráfagas variables",
      gustFactor,
    };
  }

  return {
    level: "safe",
    reason: gustFactor <= 1.15 ? "Viento estable" : "Ráfagas controladas",
    gustFactor,
  };
}

export function SafetyTrafficLight({
  hourlyData,
  profile,
  windUnits = "kmh",
  hoursToShow = 12,
  parkName,
}: SafetyTrafficLightProps) {
  if (!hourlyData.length) return null;

  const upcoming = hourlyData.slice(0, hoursToShow);

  let peakGust = 0;
  let peakHour = "";

  for (const hour of upcoming) {
    if (hour.wind_gusts_10m > peakGust) {
      peakGust = hour.wind_gusts_10m;
      peakHour = hour.time;
    }
  }

  const unitLabel = windUnits === "kmh" ? "km/h" : windUnits === "ms" ? "m/s" : "kt";

  const peakGustDisplay = convertWindSpeed(peakGust, windUnits).toFixed(1);

  const peakTimeDisplay = peakHour
    ? new Date(peakHour).toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  return (
    <section
      aria-labelledby="safe-mode-heading"
      className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/90 shadow-lg dark:shadow-black/40 p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FaTrafficLight className="w-5 h-5 text-red-500 dark:text-red-400" />
              <h3
                id="safe-mode-heading"
                className="text-lg font-display font-bold text-neutral-900 dark:text-neutral-100"
              >
                Modo Volantín Seguro
              </h3>
            </div>
            {parkName && (
              <div className="text-xs font-bold text-blue-700 dark:text-purple-300 bg-blue-100 dark:bg-purple-950/40 px-3 py-1 rounded-full border-2 border-blue-300 dark:border-purple-700/50 whitespace-nowrap">
                {parkName}
              </div>
            )}
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
            Semáforo horario según {PROFILE_CONFIG[profile].label.toLowerCase()}.
          </p>
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-300">
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
            Ráfaga máxima prevista: {peakGustDisplay} {unitLabel}
            {peakTimeDisplay ? ` (${peakTimeDisplay})` : ""}
          </p>
          <p className="text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
            Ajusta el hilo si las ráfagas superan tu tolerancia.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
        {(["safe", "caution", "danger"] as SafetyLevel[]).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                LEVEL_STYLES[level].dot
              }`}
            />
            <span className="font-semibold text-neutral-600 dark:text-neutral-300">
              {LEVEL_STYLES[level].label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto overflow-x-hidden pr-1">
        {upcoming.map((hour) => {
          const safety = evaluateHourSafety(hour, profile);
          const styles = LEVEL_STYLES[safety.level];
          const isPeak = hour.time === peakHour;
          const timeLabel = new Date(hour.time).toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          const gustValue = convertWindSpeed(
            hour.wind_gusts_10m,
            windUnits
          ).toFixed(1);
          const windValue = convertWindSpeed(
            hour.wind_speed_10m,
            windUnits
          ).toFixed(1);

          return (
            <div
              key={hour.time}
              className={`relative rounded-xl border ${styles.border} ${styles.bg} p-3 transition-all overflow-hidden`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${styles.dot}`}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {timeLabel}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${styles.badge} ${styles.badgeText}`}
                >
                  {styles.label}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-300">
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                    Viento
                  </p>
                  <p className="font-mono">
                    {windValue} {unitLabel}
                  </p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Q{Math.round(hour.score)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                    Ráfagas
                  </p>
                  <p className="font-mono">
                    {gustValue} {unitLabel}
                  </p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    GF {safety.gustFactor.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                {safety.reason}
              </p>
              {isPeak && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 text-[10px] font-semibold text-red-600 dark:text-red-300">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400"></span>
                  <span>Máxima ráfaga</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-neutral-200 dark:border-neutral-700 pt-3 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          Recuerda:
        </span>{" "}
        El hilo curado está prohibido por la{" "}
        <Link
          href="https://www.bcn.cl/leychile/navegar?idNorma=1054358"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
        >
          Ley 20.700
        </Link>
        . Usa materiales no conductores y mantente lejos de cables eléctricos.
      </div>
    </section>
  );
}
