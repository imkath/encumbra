"use client";

import {
  FaInfoCircle,
  FaWind,
  FaCloudRain,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

interface TipCardProps {
  windSpeed: number;
  gustFactor: number;
  precipProb: number;
  nextWindowTime?: string;
  isGoodToFly?: boolean; // Nueva prop para saber si la decisión es SÍ o NO
  inWindow?: boolean; // Si estamos en una ventana activa ahora
}

export function TipCard({
  windSpeed,
  gustFactor,
  precipProb,
  nextWindowTime,
  isGoodToFly = false,
  inWindow = false,
}: TipCardProps) {
  // Determinar el consejo según condiciones
  let tip = "";
  let icon = FaInfoCircle;
  let bgColor = "bg-blue-50";
  let borderColor = "border-blue-200";
  let iconColor = "text-blue-600";
  let isPositive = false;

  // Prioridad 1: Si estamos en ventana activa y es buen momento
  if (isGoodToFly && inWindow) {
    tip =
      "¡Es el momento perfecto! Disfruta volando y recuerda mantenerte alejado de cables eléctricos";
    icon = FaCheckCircle;
    bgColor = "bg-green-50";
    borderColor = "border-green-200";
    iconColor = "text-green-600";
    isPositive = true;
  }
  // Prioridad 2: Lluvia (siempre prioritario por seguridad)
  else if (precipProb >= 30) {
    tip = "Evita elevar con lluvia. El hilo puede conducir electricidad";
    icon = FaCloudRain;
    bgColor = "bg-amber-50";
    borderColor = "border-amber-200";
    iconColor = "text-amber-600";
  }
  // Prioridad 3: Si dice SÍ pero no estamos en ventana (condiciones marginales buenas)
  else if (isGoodToFly) {
    tip =
      "Buenas condiciones para volar. Mantén el hilo enrollado cuando no estés volando";
    icon = FaCheckCircle;
    bgColor = "bg-green-50";
    borderColor = "border-green-200";
    iconColor = "text-green-600";
    isPositive = true;
  }
  // Prioridad 4: Viento débil
  else if (windSpeed < 8) {
    tip = "Usa cola más larga o espera la franja recomendada";
    icon = FaWind;
    bgColor = "bg-blue-50";
    borderColor = "border-blue-200";
    iconColor = "text-blue-600";
  }
  // Prioridad 5: Ráfagas fuertes
  else if (gustFactor >= 1.35) {
    tip = "Ráfagas variables. No corras tras un volantín cortado";
    icon = FaWind;
    bgColor = "bg-amber-50";
    borderColor = "border-amber-200";
    iconColor = "text-amber-600";
  }
  // Prioridad 6: Hay ventana próxima
  else if (nextWindowTime) {
    tip = `Mejor a las ${nextWindowTime}. Activa alerta y te avisamos`;
    icon = FaClock;
    bgColor = "bg-blue-50";
    borderColor = "border-blue-200";
    iconColor = "text-blue-600";
  }
  // Prioridad 7: Consejo genérico
  else {
    tip = "Mantén el hilo enrollado para no tropezar. Vuela seguro";
    icon = FaInfoCircle;
    bgColor = "bg-blue-50";
    borderColor = "border-blue-200";
    iconColor = "text-blue-600";
  }

  const Icon = icon;

  return (
    <div
      className={`${bgColor} dark:bg-neutral-800/50 ${borderColor} dark:border-neutral-700 border-2 rounded-xl p-4 mt-4`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`${iconColor} dark:text-purple-400 text-xl mt-0.5 flex-shrink-0`}
        >
          <Icon />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            Consejo del momento
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}
