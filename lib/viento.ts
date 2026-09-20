export type Rumbo =
  | "N"
  | "NNE"
  | "NE"
  | "ENE"
  | "E"
  | "ESE"
  | "SE"
  | "SSE"
  | "S"
  | "SSO"
  | "SO"
  | "OSO"
  | "O"
  | "ONO"
  | "NO"
  | "NNO";

const RUMBOS: readonly Rumbo[] = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSO",
  "SO",
  "OSO",
  "O",
  "ONO",
  "NO",
  "NNO",
];

const NOMBRES: Record<Rumbo, string> = {
  N: "norte",
  NNE: "nor-noreste",
  NE: "noreste",
  ENE: "este-noreste",
  E: "oriente",
  ESE: "este-sureste",
  SE: "sureste",
  SSE: "sur-sureste",
  S: "sur",
  SSO: "sur-suroeste",
  SO: "suroeste",
  OSO: "oeste-suroeste",
  O: "poniente",
  ONO: "oeste-noroeste",
  NO: "noroeste",
  NNO: "nor-noroeste",
};

export function cardinal(grados: number | null): Rumbo | null {
  if (grados === null || !Number.isFinite(grados)) return null;

  const normalizados = ((grados % 360) + 360) % 360;
  return RUMBOS[Math.floor((normalizados + 11.25) / 22.5) % 16] ?? null;
}

export function fraseDireccion(grados: number | null): string | null {
  const rumbo = cardinal(grados);
  return rumbo ? `viene del ${NOMBRES[rumbo]}` : null;
}
