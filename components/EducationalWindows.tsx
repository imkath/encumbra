"use client";

import { FaClock, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import type { Window } from "@/lib/find-windows";
import { normalizeQScore } from "@/lib/find-windows";
import { formatWindSpeed, type WindUnits } from "@/lib/utils";

interface EducationalWindowsProps {
  nextWindow?: Window;
  bestWindow?: Window;
  alternativeWindow?: Window;
  parkName?: string;
  windUnits?: WindUnits;
}

export function EducationalWindows({
  nextWindow,
  bestWindow,
  alternativeWindow,
  parkName,
  windUnits = "kmh",
}: EducationalWindowsProps) {
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80)
      return {
        label: "Excelente",
        color: "bg-green-500",
        textColor: "text-green-900",
      };
    if (score >= 60)
      return {
        label: "Bueno",
        color: "bg-blue-500",
        textColor: "text-blue-900",
      };
    if (score >= 40)
      return {
        label: "Marginal",
        color: "bg-amber-500",
        textColor: "text-amber-900",
      };
    return {
      label: "Malo",
      color: "bg-red-500",
      textColor: "text-red-900",
    };
  };

  const getEducationalTip = (window: Window) => {
    if (window.maxGF < 1.3) {
      return "Ráfagas bajas, ideal para empezar";
    } else if (window.maxGF < 1.5) {
      return "Condiciones estables para volar cómodo";
    } else if (window.meanS < 15) {
      return "Viento suave, perfecto para volantines livianos";
    } else if (window.meanS > 20) {
      return "Viento fuerte, usa volantines resistentes";
    }
    return "Condiciones variables, mantén atención";
  };

  const cards = [
    {
      title: "Próxima ventana",
      subtitle: parkName || "Parque seleccionado",
      window: nextWindow,
      icon: FaClock,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Mejor ventana del día",
      subtitle: "Mayor calidad",
      window: bestWindow,
      icon: FaStar,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
    },
    {
      title: "Alternativa cercana",
      subtitle: "Opción adicional",
      window: alternativeWindow,
      icon: FaMapMarkerAlt,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const window = card.window;

        if (!window) {
          return (
            <div
              key={index}
              className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 opacity-60"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`${card.iconBg} dark:bg-neutral-700 p-2 rounded-lg`}
                >
                  <Icon
                    className={`${card.iconColor} dark:text-purple-400 text-lg`}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    {card.title}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {card.subtitle}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                No disponible
              </p>
            </div>
          );
        }

        const normalizedScore = normalizeQScore(window.Q);
        const quality = getQualityLabel(normalizedScore);
        const tip = getEducationalTip(window);

        return (
          <div
            key={index}
            className="bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-5 hover:shadow-lg dark:hover:shadow-black/40 transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`${card.iconBg} dark:bg-neutral-700 p-2 rounded-lg`}
              >
                <Icon
                  className={`${card.iconColor} dark:text-purple-400 text-lg`}
                />
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                  {card.title}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {card.subtitle}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Franja horaria */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Horario
                </span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatTime(window.start)} - {formatTime(window.end)}
                </span>
              </div>

              {/* Media de viento */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Viento promedio
                </span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatWindSpeed(window.meanS, windUnits)}
                </span>
              </div>

              {/* Etiqueta de calidad */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Calidad
                </span>
                <span
                  className={`text-xs font-bold ${quality.color} dark:bg-neutral-700 bg-opacity-20 ${quality.textColor} dark:text-purple-300 px-3 py-1 rounded-full`}
                >
                  {quality.label}
                </span>
              </div>

              {/* Línea educativa */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                  {tip}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
