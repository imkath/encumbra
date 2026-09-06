import { REGLA_TOPE, tramosDeBanda } from "./score.ts";

export type PuntoCielo = {
  readonly x: number;
  readonly y: number;
  readonly viento: number;
  readonly fecha: string;
};

export type Cielo = {
  readonly puntos: readonly PuntoCielo[];
  /** Smoothed outline of the wind, ready for an SVG `d` attribute. */
  readonly cresta: string;
  /** Same curve closed against the floor, for the fill underneath. */
  readonly relleno: string;
  /** Horizontal band where a kite actually flies, in viewBox units. */
  readonly vuela: { readonly arriba: number; readonly abajo: number };
  readonly ahora: PuntoCielo | null;
  readonly ancho: number;
  readonly alto: number;
};

const ANCHO = 1000;
const ALTO = 300;
const TECHO = 30; // km/h shown; above that a kite is out of the question anyway

const alturaDe = (viento: number) =>
  ALTO - (Math.min(viento, TECHO) / TECHO) * ALTO;

/**
 * A Catmull-Rom spline through the hourly readings, emitted as cubic béziers.
 * Straight segments would read as a chart; the wind deserves a curve.
 */
function suavizar(puntos: readonly PuntoCielo[]): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${puntos[0]!.x} ${puntos[0]!.y}`;
  let d = `M ${puntos[0]!.x} ${puntos[0]!.y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[Math.max(0, i - 1)]!;
    const p1 = puntos[i]!;
    const p2 = puntos[i + 1]!;
    const p3 = puntos[Math.min(puntos.length - 1, i + 2)]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function trazarCielo(
  horas: readonly { fecha: string; viento: number }[],
  fechaAhora?: string,
): Cielo {
  const puntos = horas.map((h, i) => ({
    x: horas.length === 1 ? ANCHO / 2 : (i / (horas.length - 1)) * ANCHO,
    y: alturaDe(h.viento),
    viento: h.viento,
    fecha: h.fecha,
  }));
  const cresta = suavizar(puntos);
  const relleno =
    puntos.length > 0
      ? `${cresta} L ${ANCHO} ${ALTO} L 0 ${ALTO} Z`
      : "";
  const ideal = tramosDeBanda().find((t) => t.id === "ideal");
  return {
    puntos,
    cresta,
    relleno,
    vuela: {
      arriba: alturaDe(ideal?.hasta ?? REGLA_TOPE),
      abajo: alturaDe(ideal?.desde ?? 0),
    },
    ahora:
      puntos.find((p) => p.fecha === fechaAhora) ?? puntos[0] ?? null,
    ancho: ANCHO,
    alto: ALTO,
  };
}
