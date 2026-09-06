import type { BandaId } from "./bandas.ts";

export type MomentoDia = "amanecer" | "dia" | "atardecer" | "noche";

export type Tiempo = "despejado" | "nubes" | "cubierto" | "lluvia" | "tormenta";

export type Escena = {
  readonly tiempo: Tiempo;
  readonly momento: MomentoDia;
  /** 0 at the horizon, 1 at noon. Places the sun or moon along its arc. */
  readonly altoSol: number;
  /** 0 on the ground, 1 high up. The kite is the answer, so it carries it. */
  readonly altoVolantin: number;
  /** Degrees. A kite leans harder as the wind pushes. */
  readonly inclinacion: number;
  readonly vuela: boolean;
  readonly nubes: number;
  readonly lluvia: boolean;
};

/** WMO codes, grouped into the states the sky actually needs to draw. */
export function leerTiempo(
  codigo: number | null,
  nubosidad: number | null,
): Tiempo {
  if (codigo !== null) {
    if (codigo >= 95) return "tormenta";
    if (codigo >= 51) return "lluvia";
    if (codigo >= 45) return "cubierto";
    if (codigo >= 3) return "cubierto";
    if (codigo >= 1) return "nubes";
    return "despejado";
  }
  if (nubosidad === null) return "despejado";
  if (nubosidad >= 85) return "cubierto";
  if (nubosidad >= 25) return "nubes";
  return "despejado";
}

const ALTURA_POR_BANDA: Record<BandaId, number> = {
  plancha: 0.06,
  liviano: 0.45,
  ideal: 0.92,
  bravo: 0.66,
  peligro: 0.3,
};

const INCLINACION_POR_BANDA: Record<BandaId, number> = {
  plancha: -4,
  liviano: 10,
  ideal: 18,
  bravo: 34,
  peligro: 48,
};

function fraccionDelDia(ahora: Date, amanecer?: string, puesta?: string) {
  if (!amanecer || !puesta) return null;
  const inicio = Date.parse(amanecer);
  const fin = Date.parse(puesta);
  if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio)
    return null;
  return (ahora.getTime() - inicio) / (fin - inicio);
}

/**
 * Everything drawn on the sky comes from a reading: the light from the real
 * sunrise and sunset, the kite's height and lean from the wind band, the
 * clouds from the rain chance. Nothing here is decoration.
 */
export function componerEscena(entrada: {
  ahora: Date;
  amanecer?: string;
  puesta?: string;
  banda: BandaId | null;
  probabilidadPrecipitacion?: number | null;
  nubosidad?: number | null;
  codigoTiempo?: number | null;
}): Escena {
  const f = fraccionDelDia(entrada.ahora, entrada.amanecer, entrada.puesta);
  const esDeDia = f !== null && f >= 0 && f <= 1;
  const momento: MomentoDia =
    f === null
      ? "dia"
      : !esDeDia
        ? "noche"
        : f < 0.12
          ? "amanecer"
          : f > 0.88
            ? "atardecer"
            : "dia";
  // A half sine: on the horizon at both ends, highest at midday.
  const altoSol = esDeDia ? Math.sin(Math.PI * Math.min(Math.max(f, 0), 1)) : 0;
  const banda = entrada.banda;
  const tiempo = leerTiempo(
    entrada.codigoTiempo ?? null,
    entrada.nubosidad ?? null,
  );
  const lluvia = tiempo === "lluvia" || tiempo === "tormenta";
  const nubes =
    entrada.nubosidad !== null && entrada.nubosidad !== undefined
      ? entrada.nubosidad / 100
      : Math.min((entrada.probabilidadPrecipitacion ?? 0) / 100, 1);

  return {
    tiempo,
    momento,
    altoSol,
    // At night nobody flies, so the kite comes down whatever the wind says.
    altoVolantin: !esDeDia ? 0.05 : banda ? ALTURA_POR_BANDA[banda] : 0.05,
    inclinacion: banda ? INCLINACION_POR_BANDA[banda] : -4,
    vuela: esDeDia && (banda === "ideal" || banda === "liviano"),
    nubes,
    lluvia,
  };
}
