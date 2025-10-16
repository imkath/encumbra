export type KiteProfile = "liviano" | "estandar" | "acrobatico";

/**
 * Calculates the Volantín Index (0-100) based on wind conditions
 * Updated algorithm according to specification point 4
 *
 * Variables:
 * v = velocidad del viento a 10 m en km/h
 * g = ráfaga máxima a 10 m en km/h
 * dir = dirección en grados
 * GF = gust factor = g / max(v, 1)
 *
 * Optimal wind: 16-22 km/h with minimal gusts
 *
 * @param windSpeed - Velocidad del viento en km/h
 * @param gustSpeed - Velocidad de ráfagas en km/h
 * @param profile - Tipo de volantín (afecta tolerancia a ráfagas)
 */
export function calculateVolantinScore(
  windSpeed: number,
  gustSpeed: number,
  profile: KiteProfile = "estandar"
): number {
  const v = windSpeed;
  const g = gustSpeed;
  const GF = g / Math.max(v, 1);

  // Thresholds según tipo de volantín
  // liviano: más sensible a ráfagas (GF máx 1.3)
  // estandar: balance (GF máx 1.35)
  // acrobatico: más tolerante (GF máx 1.45)
  const gustThresholds = {
    liviano: { low: 1.3, high: 1.5 },
    estandar: { low: 1.35, high: 1.6 },
    acrobatico: { low: 1.45, high: 1.8 },
  };

  const thresholds = gustThresholds[profile];

  // Base score using Gaussian distribution centered at 19 km/h
  // Formula: base = 100 * exp(-((v - 19)^2) / (2 * 6^2))
  const base = 100 * Math.exp(-Math.pow(v - 19, 2) / (2 * Math.pow(6, 2)));

  // Penalization for gusts (ajustada según perfil)
  let penGust = 0;
  if (GF <= thresholds.low) {
    penGust = 0;
  } else if (GF <= thresholds.high) {
    // Linear penalization up to 25 points
    penGust = ((GF - thresholds.low) / (thresholds.high - thresholds.low)) * 25;
  } else {
    // For GF > high threshold: 25 + linear penalization up to 35 more points
    penGust = 25 + Math.min((GF - thresholds.high) / 0.7, 1) * 35;
  }

  // Extra penalization for extreme conditions
  const penExtra = v < 8 || v > 35 ? 20 : 0;

  // Final score: clamp(round(base - pen_gust - pen_extra), 0, 100)
  const score = Math.max(
    0,
    Math.min(100, Math.round(base - penGust - penExtra))
  );

  return score;
}

export function getScoreLevel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: "Excelente",
      color: "text-blue-600 dark:text-blue-400", // Azul para 80-100
      description: "Condiciones ideales para volar volantín",
    };
  } else if (score >= 60) {
    return {
      label: "Bueno",
      color: "text-green-600 dark:text-green-400", // Verde para 60-79
      description: "Buenas condiciones, disfruta tu vuelo",
    };
  } else if (score >= 40) {
    return {
      label: "Marginal",
      color: "text-amber-600 dark:text-amber-400", // Ámbar para 40-59
      description: "Puede requerir ajustar brida y usar cola",
    };
  } else {
    return {
      label: "No recomendado",
      color: "text-red-600 dark:text-red-400", // Rojo para 0-39
      description: "Condiciones no aptas para volar",
    };
  }
}

export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round((degrees % 360) / 45) % 8;
  return directions[index];
}

export function getBeaufortScale(windSpeed: number): {
  scale: number;
  description: string;
} {
  if (windSpeed < 1) return { scale: 0, description: "Calma" };
  if (windSpeed < 6) return { scale: 1, description: "Ventolina" };
  if (windSpeed < 12) return { scale: 2, description: "Brisa muy débil" };
  if (windSpeed < 20) return { scale: 3, description: "Brisa débil" };
  if (windSpeed < 29) return { scale: 4, description: "Brisa moderada" };
  if (windSpeed < 39) return { scale: 5, description: "Brisa fresca" };
  if (windSpeed < 50) return { scale: 6, description: "Brisa fuerte" };
  if (windSpeed < 62) return { scale: 7, description: "Viento fuerte" };
  return { scale: 8, description: "Temporal" };
}
