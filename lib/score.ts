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
