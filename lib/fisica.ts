import type { BandaId } from "./bandas.ts";

export type Punto = { readonly x: number; readonly y: number };

/**
 * Line angle above the horizon, in degrees. A kite does not climb forever with
 * more wind: it peaks in its design range and then gets pushed back down and
 * away as the air overpowers it, which is exactly what the bands describe.
 */
const ELEVACION: Record<BandaId, number> = {
  plancha: 8,
  liviano: 38,
  ideal: 64,
  bravo: 46,
  peligro: 26,
};

/** How hard the line is pulled, 0 slack to 1 taut. Sets the sag. */
const TENSION: Record<BandaId, number> = {
  plancha: 0.05,
  liviano: 0.45,
  ideal: 0.92,
  bravo: 0.99,
  peligro: 0.99,
};

/**
 * Solves 2a·sinh(d/2a) = √(L² − h²) for the catenary parameter by bisection.
 * That is the real shape of a hanging line: a parabola is the schoolbook
 * approximation and a bézier drawn by eye, which is what this replaces, is
 * nothing at all.
 */
export function parametroCatenaria(
  d: number,
  h: number,
  largo: number,
): number | null {
  const recta = Math.hypot(d, h);
  if (largo <= recta || d <= 0) return null; // taut: a straight line
  const objetivo = Math.sqrt(largo * largo - h * h);
  let bajo = 1e-6;
  let alto = 1e6;
  for (let i = 0; i < 80; i++) {
    const a = (bajo + alto) / 2;
    const valor = 2 * a * Math.sinh(d / (2 * a));
    if (valor > objetivo) bajo = a;
    else alto = a;
  }
  return (bajo + alto) / 2;
}

/**
 * The line from the hand to the kite, as an SVG path. Taut wind gives an almost
 * straight line; slack wind lets it belly down under its own weight.
 */
export function hilo(
  mano: Punto,
  volantin: Punto,
  largo: number,
  muestras = 30,
): string {
  const dx = mano.x - volantin.x;
  const ancho = Math.abs(dx);
  // Work with y pointing up, the way the physics is written, then flip at the
  // end: in SVG y grows downward, and getting that backwards arcs the line
  // upward instead of letting it hang.
  const altura = mano.y - volantin.y; // kite is above the hand, so > 0
  const a = parametroCatenaria(ancho, altura, largo);
  if (a === null) {
    return `M ${volantin.x} ${volantin.y} L ${mano.x} ${mano.y}`;
  }

  // Where the curve bottoms out, solved rather than taken from a closed form:
  // the sign conventions in those formulas are exactly what got this wrong
  // twice. Bisection on "the ends differ by `altura`" cannot be misread.
  let bajo = -ancho * 4;
  let alto = ancho * 4;
  const desnivel = (x: number) =>
    a * Math.cosh(-x / a) - a * Math.cosh((ancho - x) / a);
  for (let i = 0; i < 90; i++) {
    const medio = (bajo + alto) / 2;
    if (desnivel(medio) < altura) bajo = medio;
    else alto = medio;
  }
  const x0 = (bajo + alto) / 2;
  const enX = (t: number) => a * Math.cosh((t - x0) / a);
  const base = enX(ancho); // the hand end sits at height 0

  const puntos: Punto[] = [];
  for (let i = 0; i <= muestras; i++) {
    const t = (i / muestras) * ancho;
    const arriba = enX(t) - base; // height above the hand
    puntos.push({
      x: volantin.x + (dx >= 0 ? t : -t),
      y: mano.y - arriba,
    });
  }
  return puntos
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

/**
 * Where the kite sits and how it leans, from the band alone. The kite's own
 * axis runs along the line, tilted back into the wind by its angle of attack.
 */
export function volantinEnEquilibrio(
  banda: BandaId | null,
  mano: Punto,
  largo: number,
) {
  const b = banda ?? "plancha";
  const elevacion = ELEVACION[b];
  const tension = TENSION[b];
  const rad = (elevacion * Math.PI) / 180;
  // A slack line means the kite is closer in than the string it has out.
  const alcance = largo * (0.45 + tension * 0.55);
  return {
    elevacion,
    tension,
    posicion: {
      x: mano.x - Math.cos(rad) * alcance,
      y: mano.y - Math.sin(rad) * alcance,
    },
    /** SVG rotation: the kite hangs off the line, nose tipped into the wind. */
    inclinacion: 90 - elevacion - 16 * tension,
  };
}

/**
 * Where the line actually ties on. A kite is not held by its middle: the bridle
 * sits below the centre on the spine, and it travels with the kite when it
 * tilts. Anchoring the line at the centre is what left it visibly unattached.
 */
export function brida(centro: Punto, inclinacion: number, distancia = 16): Punto {
  const rad = (inclinacion * Math.PI) / 180;
  return {
    x: centro.x - Math.sin(rad) * distancia,
    y: centro.y + Math.cos(rad) * distancia,
  };
}
