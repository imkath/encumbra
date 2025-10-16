/**
 * Motor de ventanas de viento para identificar períodos óptimos para volar volantín
 * Basado en las especificaciones del punto 19 del documento
 */

export interface HourPoint {
  time: string;
  wind_speed_10m: number; // km/h
  wind_gusts_10m: number; // km/h
  wind_direction_10m: number; // grados
  precipitation_probability?: number; // %
  score: number;
}

export interface WindWindow {
  start: string;
  end: string;
  duration: number; // horas
  meanScore: number;
  stdScore: number;
  maxGustFactor: number;
  quality: number; // Q value
  classification: "optimal" | "good" | "marginal";
  hours: HourPoint[];
}

export interface WindowOptions {
  scoreMin?: number;
  gustFactorMax?: number;
  precipitationMax?: number;
  minDurationHours?: number;
}

/**
 * Encuentra ventanas de viento óptimas en los datos horarios
 */
export function findWindWindows(
  hourlyData: HourPoint[],
  options: WindowOptions = {}
): WindWindow[] {
  const opts = {
    scoreMin: options.scoreMin ?? 70,
    gustFactorMax: options.gustFactorMax ?? 1.35,
    precipitationMax: options.precipitationMax ?? 30,
    minDurationHours: options.minDurationHours ?? 0.75, // 45 minutos
  };

  const windows: WindWindow[] = [];
  let currentWindow: HourPoint[] = [];
  let windowStart: string | null = null;

  for (const hour of hourlyData) {
    const gustFactor = hour.wind_gusts_10m / Math.max(hour.wind_speed_10m, 1);
    const precipitation = hour.precipitation_probability ?? 0;

    const meetsConditions =
      hour.score >= opts.scoreMin &&
      gustFactor <= opts.gustFactorMax &&
      precipitation <= opts.precipitationMax;

    if (meetsConditions) {
      if (windowStart === null) {
        windowStart = hour.time;
        currentWindow = [];
      }
      currentWindow.push(hour);
    } else {
      // Fin de ventana
      if (currentWindow.length > 0 && windowStart) {
        const window = summarizeWindow(windowStart, currentWindow);
        if (window.duration >= opts.minDurationHours) {
          windows.push(window);
        }
      }
      windowStart = null;
      currentWindow = [];
    }
  }

  // Procesar última ventana si existe
  if (currentWindow.length > 0 && windowStart) {
    const window = summarizeWindow(windowStart, currentWindow);
    if (window.duration >= opts.minDurationHours) {
      windows.push(window);
    }
  }

  // Ordenar por calidad (Q), duración y hora de inicio
  return windows.sort((a, b) => {
    if (Math.abs(a.quality - b.quality) > 0.1) {
      return b.quality - a.quality; // Mayor calidad primero
    }
    if (Math.abs(a.duration - b.duration) > 0.1) {
      return b.duration - a.duration; // Mayor duración primero
    }
    return new Date(a.start).getTime() - new Date(b.start).getTime(); // Menor hora de inicio
  });
}

/**
 * Resume una ventana de horas contiguas
 */
function summarizeWindow(start: string, hours: HourPoint[]): WindWindow {
  const scores = hours.map((h) => h.score);
  const gustFactors = hours.map(
    (h) => h.wind_gusts_10m / Math.max(h.wind_speed_10m, 1)
  );

  const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const stdScore = Math.sqrt(
    scores.reduce((acc, score) => acc + Math.pow(score - meanScore, 2), 0) /
      scores.length
  );
  const maxGustFactor = Math.max(...gustFactors);

  // Heurística de calidad: Q = media(score) - 15 * max(0, GF - 1.25) - 0.2 * std(score)
  const quality =
    meanScore - 15 * Math.max(0, maxGustFactor - 1.25) - 0.2 * stdScore;

  const end = hours[hours.length - 1].time;
  const duration = hours.length; // Asumiendo datos horarios

  // Clasificación de ventana
  let classification: "optimal" | "good" | "marginal";
  if (meanScore >= 80 && maxGustFactor <= 1.3) {
    classification = "optimal";
  } else if (meanScore >= 60) {
    classification = "good";
  } else {
    classification = "marginal";
  }

  return {
    start,
    end,
    duration,
    meanScore,
    stdScore,
    maxGustFactor,
    quality,
    classification,
    hours,
  };
}

/**
 * Encuentra la mejor ventana para hoy
 */
export function getBestWindowToday(windows: WindWindow[]): WindWindow | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayWindows = windows.filter((window) => {
    const windowStart = new Date(window.start);
    return windowStart >= today && windowStart < tomorrow;
  });

  return todayWindows.length > 0 ? todayWindows[0] : null;
}

/**
 * Encuentra la mejor ventana para mañana
 */
export function getBestWindowTomorrow(
  windows: WindWindow[]
): WindWindow | null {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const tomorrowWindows = windows.filter((window) => {
    const windowStart = new Date(window.start);
    return windowStart >= tomorrow && windowStart < dayAfter;
  });

  return tomorrowWindows.length > 0 ? tomorrowWindows[0] : null;
}

/**
 * Verifica si es recomendable volar ahora
 */
export function shouldFlyNow(
  hourlyData: HourPoint[],
  currentTime: Date = new Date()
): {
  recommended: boolean;
  reason: string;
  currentScore: number;
  nextAlternatives: HourPoint[];
} {
  // Encontrar la hora actual o más cercana
  const currentHour = hourlyData.find((h) => {
    const hourTime = new Date(h.time);
    const timeDiff = Math.abs(hourTime.getTime() - currentTime.getTime());
    return timeDiff < 30 * 60 * 1000; // Dentro de 30 minutos
  });

  if (!currentHour) {
    return {
      recommended: false,
      reason: "No hay datos meteorológicos disponibles",
      currentScore: 0,
      nextAlternatives: [],
    };
  }

  const gustFactor =
    currentHour.wind_gusts_10m / Math.max(currentHour.wind_speed_10m, 1);
  const recommended = currentHour.score >= 70 && gustFactor <= 1.35;

  let reason = "";
  if (currentHour.score < 40) {
    reason = "Condiciones no recomendadas";
  } else if (currentHour.score < 60) {
    reason = "Condiciones marginales - considera ajustar brida";
  } else if (gustFactor > 1.35) {
    reason = "Ráfagas demasiado fuertes";
  } else if (recommended) {
    reason = "¡Excelentes condiciones para volar!";
  } else {
    reason = "Condiciones aceptables pero no óptimas";
  }

  // Encontrar próximas alternativas (siguientes 6 horas)
  const currentIndex = hourlyData.findIndex((h) => h.time === currentHour.time);
  const nextAlternatives = hourlyData
    .slice(currentIndex + 1, currentIndex + 7)
    .filter((h) => h.score >= 60)
    .slice(0, 2);

  return {
    recommended,
    reason,
    currentScore: currentHour.score,
    nextAlternatives,
  };
}

/**
 * Obtiene parámetros según el tipo de volantín
 */
export function getKiteTypeParameters(
  kiteType: "infantil" | "estandar" | "acrobatico"
): WindowOptions {
  switch (kiteType) {
    case "infantil":
      return {
        scoreMin: 60,
        gustFactorMax: 1.3,
        precipitationMax: 20,
      };
    case "estandar":
      return {
        scoreMin: 70,
        gustFactorMax: 1.35,
        precipitationMax: 30,
      };
    case "acrobatico":
      return {
        scoreMin: 65,
        gustFactorMax: 1.45,
        precipitationMax: 30,
      };
    default:
      return {};
  }
}
