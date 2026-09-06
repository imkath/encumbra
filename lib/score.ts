import {
  CORTES,
  PERFILES,
  RACHA_PELIGRO,
  VIENTO_PELIGRO,
  type BandaId,
  type Perfil,
} from "./bandas.ts";

const clamp = (valor: number, minimo: number, maximo: number): number =>
  Math.min(Math.max(valor, minimo), maximo);

export function score(
  viento: number,
  racha: number,
  perfil: Perfil,
): number {
  const { centro, sigma, techoRacha } = PERFILES[perfil];
  const base =
    100 * Math.exp(-((viento - centro) ** 2) / (2 * sigma ** 2));
  const penalizacion =
    racha > techoRacha
      ? Math.min((racha - techoRacha) / techoRacha, 1) * 100
      : 0;

  return clamp(Math.round(base - penalizacion), 0, 100);
}

export function banda(
  viento: number,
  racha: number,
  perfil: Perfil,
): BandaId {
  if (viento >= VIENTO_PELIGRO || racha >= RACHA_PELIGRO) {
    return "peligro";
  }

  const resultado = score(viento, racha, perfil);
  const sopla = viento > PERFILES[perfil].centro;

  if (resultado >= CORTES.ideal) {
    return "ideal";
  }

  if (resultado >= CORTES.marginal) {
    return sopla ? "bravo" : "liviano";
  }

  return sopla ? "bravo" : "plancha";
}

const REGLA_MAXIMO = 45;
const REGLA_PASO = 0.5;

/**
 * Reads the cut points off the model instead of restating them, so recalibrating
 * PERFILES redraws the ruler. Gusts are held equal to the sustained wind: these
 * are the thresholds by wind alone, which is what the ruler's caption promises.
 */
export function tramosDeBanda(
  perfil: Perfil = "estandar",
): { id: BandaId; desde: number; hasta: number }[] {
  const tramos: { id: BandaId; desde: number; hasta: number }[] = [];
  for (let viento = 0; viento <= REGLA_MAXIMO; viento += REGLA_PASO) {
    const id = banda(viento, viento, perfil);
    const ultimo = tramos.at(-1);
    if (ultimo && ultimo.id === id) ultimo.hasta = viento;
    else tramos.push({ id, desde: viento, hasta: viento });
  }
  return tramos;
}
export const REGLA_TOPE = REGLA_MAXIMO;
