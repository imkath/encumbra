export type KiteProfile = "liviano" | "estandar" | "acrobatico";

export type HourPoint = {
  time: string; // ISO
  speed: number; // km/h
  gust: number; // km/h
  precip?: number; // %
  score: number; // 0..100
};

export type Window = {
  start: string;
  end: string;
  meanS: number;
  stdS: number;
  maxGF: number;
  Q: number;
};

export type FindOpts = {
  S_min?: number;
  GF_max?: number;
  P_max?: number;
  profile?: KiteProfile;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

function std(xs: number[]) {
  const m = mean(xs);
  const v = mean(xs.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

export function findWindows(
  series: HourPoint[],
  opts: FindOpts = {}
): Window[] {
  const profile = opts.profile ?? "estandar";

  // Thresholds según tipo de volantín
  const profileThresholds = {
    liviano: { S_min: 60, GF_max: 1.3 }, // Más exigente, para niños
    estandar: { S_min: 70, GF_max: 1.35 }, // Balance óptimo
    acrobatico: { S_min: 65, GF_max: 1.45 }, // Más permisivo con ráfagas
  };

  const thresholds = profileThresholds[profile];

  // Valores por defecto ajustados según perfil (pueden sobreescribirse con opts)
  const S_min = opts.S_min ?? thresholds.S_min;
  const GF_max = opts.GF_max ?? thresholds.GF_max;
  const P_max = opts.P_max ?? 30;

  const out: Window[] = [];
  let acc: { t: string; s: number; gf: number }[] = [];

  function flush() {
    if (acc.length === 0) return;
    const start = acc[0].t;
    const end = acc[acc.length - 1].t;
    const ss = acc.map((x) => x.s);
    const gfs = acc.map((x) => x.gf);
    const w: Window = {
      start,
      end,
      meanS: Math.round(mean(ss)),
      stdS: Math.round(std(ss)),
      maxGF: Math.max(...gfs),
      Q: 0,
    };
    w.Q = w.meanS - 15 * Math.max(0, w.maxGF - 1.25) - 0.2 * w.stdS;
    out.push(w);
    acc = [];
  }

  for (const h of series) {
    const gf = h.speed > 0 ? h.gust / h.speed : 1;
    // Usar el score para filtrar (0-100)
    const ok = h.score >= S_min && gf <= GF_max && (h.precip ?? 0) <= P_max;

    if (ok) acc.push({ t: h.time, s: h.speed, gf });
    else flush();
  }
  flush();

  // Filtro mínimo de 30 minutos para ventanas
  const filtered = out.filter(
    (w) =>
      new Date(w.end).getTime() - new Date(w.start).getTime() >= 30 * 60 * 1000
  );

  return filtered.sort(
    (a, b) =>
      b.Q - a.Q || new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}

// Perfiles para volar volantines (ahora usa la lógica interna de findWindows)
export function profileOpts(
  p: "liviano" | "estandar" | "acrobatico"
): FindOpts {
  // Ahora solo pasamos el perfil, los thresholds se determinan internamente
  return { profile: p };
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

export function isTomorrow(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  const t = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
  return d.toDateString() === t.toDateString();
}

// Obtiene la próxima ventana buena (después de ahora) de hoy
export function getNextTodayWindow(windows: Window[]): Window | undefined {
  const now = new Date();
  const todayWindows = windows.filter(
    (w) => isToday(w.start) && new Date(w.start) > now
  );
  if (todayWindows.length === 0) return undefined;
  // Ordenar por hora de inicio (más cercana primero)
  return todayWindows.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )[0];
}

// Obtiene la mejor ventana del día por Q-Score
export function getBestToday(windows: Window[]): Window | undefined {
  // Filtrar ventanas de hoy y ordenar por Q-Score (mejor primero)
  const todayWindows = windows.filter((w) => isToday(w.start));
  if (todayWindows.length === 0) return undefined;
  return todayWindows.sort((a, b) => b.Q - a.Q)[0];
}

export function getBestTomorrow(windows: Window[]): Window | undefined {
  // Filtrar ventanas de mañana y ordenar por Q-Score (mejor primero)
  const tomorrowWindows = windows.filter((w) => isTomorrow(w.start));
  if (tomorrowWindows.length === 0) return undefined;
  return tomorrowWindows.sort((a, b) => b.Q - a.Q)[0];
}

// Convierte el Q-Score de una ventana a un score normalizado de 0-100
// El Q-Score típicamente está en el rango -10 a 20 para condiciones reales de Santiago
// Ajustado para ser más realista con vientos chilenos que tienen ráfagas normales
export function normalizeQScore(qScore: number): number {
  // Mapeo más realista del Q-Score a escala 0-100:
  // Q >= 12: score 85-100 (Excelente - viento fuerte, estable, pocas ráfagas)
  // Q 8-12: score 70-85 (Muy bueno - condiciones ideales)
  // Q 4-8: score 60-70 (Bueno - condiciones aprovechables)
  // Q 0-4: score 45-60 (Marginal - puede volar con ajustes)
  // Q -4-0: score 30-45 (Regular - ráfagas moderadas)
  // Q < -4: score 0-30 (Malo - muy inestable o sin viento)

  if (qScore >= 12) {
    // Excelente: mapear 12-20 a 85-100
    return Math.min(100, 85 + ((qScore - 12) / 8) * 15);
  } else if (qScore >= 8) {
    // Muy bueno: mapear 8-12 a 70-85
    return 70 + ((qScore - 8) / 4) * 15;
  } else if (qScore >= 4) {
    // Bueno: mapear 4-8 a 60-70
    return 60 + ((qScore - 4) / 4) * 10;
  } else if (qScore >= 0) {
    // Marginal: mapear 0-4 a 45-60
    return 45 + (qScore / 4) * 15;
  } else if (qScore >= -4) {
    // Regular: mapear -4-0 a 30-45
    return 30 + ((qScore + 4) / 4) * 15;
  } else {
    // Malo: mapear <-4 a 0-30
    return Math.max(0, 30 + ((qScore + 4) / 6) * 30);
  }
}

// Verificar si estamos dentro de una ventana activa
export function isInActiveWindow(windows: Window[]): Window | null {
  const now = new Date();
  return (
    windows.find((w) => {
      const start = new Date(w.start);
      const end = new Date(w.end);
      return now >= start && now <= end;
    }) || null
  );
}

export function shouldFlyNow(
  series: HourPoint[],
  opts: FindOpts = {},
  windows: Window[] = []
): {
  ok: boolean;
  reason: string;
  score: number;
  inWindow?: boolean;
  activeWindow?: Window;
} | null {
  if (series.length === 0) return null;

  const current = series[0];
  const gf = current.speed > 0 ? current.gust / current.speed : 1;

  // Verificar si estamos en una ventana activa
  const activeWindow = isInActiveWindow(windows);

  // Si estamos en una ventana activa, significa que las condiciones son buenas
  if (activeWindow) {
    // Usar el score normalizado de la ventana activa
    const windowScore = normalizeQScore(activeWindow.Q);
    return {
      ok: true,
      reason: "¡Estás en una ventana ideal! Es el mejor momento",
      score: windowScore,
      inWindow: true,
      activeWindow: activeWindow,
    };
  }

  // Si NO estamos en una ventana, evaluar condiciones actuales
  const profile = opts.profile ?? "estandar";
  const profileThresholds = {
    liviano: { S_min: 60, GF_max: 1.3 },
    estandar: { S_min: 70, GF_max: 1.35 },
    acrobatico: { S_min: 65, GF_max: 1.45 },
  };
  const thresholds = profileThresholds[profile];

  const S_min = opts.S_min ?? thresholds.S_min;
  const GF_max = opts.GF_max ?? thresholds.GF_max;

  const ok = current.score >= S_min && gf <= GF_max;

  let reason = "";
  if (current.score < 40) {
    reason = "Viento insuficiente o muy débil";
  } else if (current.score < S_min) {
    reason = "Condiciones por debajo del umbral para tu tipo de volantín";
  } else if (gf > GF_max) {
    reason = "Ráfagas muy fuertes para tu tipo de volantín";
  } else if (ok) {
    reason = "¡Condiciones buenas para volar ahora!";
  } else {
    reason = "Espera mejores condiciones";
  }

  return { ok, reason, score: current.score, inWindow: false };
}
