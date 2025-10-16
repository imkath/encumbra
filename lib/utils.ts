import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tipos para unidades de viento
export type WindUnits = "kmh" | "ms" | "kn";

/**
 * Convierte velocidad de viento de km/h a la unidad especificada
 * @param kmh - Velocidad en kilómetros por hora
 * @param units - Unidad de destino: "kmh", "ms" (m/s) o "kn" (nudos)
 * @returns Velocidad convertida
 */
export function convertWindSpeed(kmh: number, units: WindUnits): number {
  switch (units) {
    case "kmh":
      return kmh;
    case "ms":
      return kmh / 3.6; // 1 m/s = 3.6 km/h
    case "kn":
      return kmh * 0.539957; // 1 knot = 1.852 km/h
    default:
      return kmh;
  }
}

/**
 * Formatea una velocidad de viento con su unidad
 * @param kmh - Velocidad en kilómetros por hora
 * @param units - Unidad a mostrar
 * @param decimals - Número de decimales (default: 1)
 * @returns String formateado con valor y unidad
 */
export function formatWindSpeed(
  kmh: number,
  units: WindUnits,
  decimals: number = 1
): string {
  const converted = convertWindSpeed(kmh, units);
  const value = converted.toFixed(decimals);

  switch (units) {
    case "kmh":
      return `${value} km/h`;
    case "ms":
      return `${value} m/s`;
    case "kn":
      return `${value} kt`;
    default:
      return `${value} km/h`;
  }
}

/**
 * Obtiene el label de la unidad de viento
 */
export function getWindUnitLabel(units: WindUnits): string {
  switch (units) {
    case "kmh":
      return "km/h";
    case "ms":
      return "m/s";
    case "kn":
      return "kt";
    default:
      return "km/h";
  }
}
