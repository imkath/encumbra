// Calibrado en docs/06-CALIBRACION.md contra la AKA y cinco años de
// datos horarios de Santiago. Este archivo es la única fuente de umbrales.
export const PERFILES = {
  liviano: { centro: 12, sigma: 5, techoRacha: 22 },
  estandar: { centro: 14, sigma: 5.5, techoRacha: 28 },
  acrobatico: { centro: 20, sigma: 7, techoRacha: 38 },
} as const;

export const VIENTO_PELIGRO = 45;
export const RACHA_PELIGRO = 45;

export const CORTES = {
  ideal: 65,
  marginal: 40,
} as const;

export const VEREDICTOS = {
  plancha: "NO ANDA",
  liviano: "APENAS",
  ideal: "ANDA",
  bravo: "BRAVO",
  peligro: "NO SALGAS",
} as const;

export type Perfil = keyof typeof PERFILES;
export type BandaId = keyof typeof VEREDICTOS;

export const CONSEJOS = {
  plancha: "Falta viento por ahora.",
  liviano: "Con uno liviano puede andar.",
  ideal: "Buen momento. Elige un lugar despejado.",
  bravo: "Va con tirones. Mejor espera a que baje.",
  peligro: "No encumbres con estas rachas.",
} as const satisfies Record<BandaId, string>;

/** Everyday wording for a band. VEREDICTOS shouts; this one talks. */
export const ETIQUETAS = {
  plancha: "Falta viento",
  liviano: "Viento justo",
  ideal: "Buen viento",
  bravo: "Rachas fuertes",
  peligro: "No encumbres",
} as const satisfies Record<BandaId, string>;
