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

function normalizar(grados: number): number {
  return ((grados % 360) + 360) % 360;
}

interface LecturaOrientacion {
  readonly alpha: number | null;
  readonly absolute: boolean;
  readonly webkitCompassHeading?: number;
}

export function rumboDispositivo(
  lectura: LecturaOrientacion,
  eventoAbsoluto = false,
): number | null {
  const rumboSafari = lectura.webkitCompassHeading;
  if (rumboSafari !== undefined && Number.isFinite(rumboSafari)) {
    return normalizar(rumboSafari);
  }

  if (
    (!lectura.absolute && !eventoAbsoluto) ||
    lectura.alpha === null ||
    !Number.isFinite(lectura.alpha)
  ) {
    return null;
  }

  return normalizar(360 - lectura.alpha);
}

export function trayectoriaViento(
  grados: number | null,
  rumboTelefono = 0,
) {
  if (
    grados === null ||
    !Number.isFinite(grados) ||
    !Number.isFinite(rumboTelefono)
  ) {
    return null;
  }

  const origenGrados = normalizar(grados);
  const destinoGrados = normalizar(origenGrados + 180);
  const origen = cardinal(origenGrados);
  const destino = cardinal(destinoGrados);
  if (!origen || !destino) return null;

  return {
    origen,
    destino,
    vieneDe: `Viene del ${NOMBRES[origen]}`,
    vaHacia: `Va hacia el ${NOMBRES[destino]}`,
    anguloOrigen: normalizar(origenGrados - rumboTelefono),
    anguloDestino: normalizar(destinoGrados - rumboTelefono),
  };
}
