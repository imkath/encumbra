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
  readonly webkitCompassAccuracy?: number;
}

export function rumboDispositivo(
  lectura: LecturaOrientacion,
  eventoAbsoluto = false,
  anguloPantalla = 0,
): number | null {
  const correccionPantalla = Number.isFinite(anguloPantalla)
    ? anguloPantalla
    : 0;
  const rumboSafari = lectura.webkitCompassHeading;
  const precisionSafari = lectura.webkitCompassAccuracy;
  if (
    rumboSafari !== undefined &&
    Number.isFinite(rumboSafari) &&
    rumboSafari >= 0 &&
    (precisionSafari === undefined ||
      (Number.isFinite(precisionSafari) && precisionSafari >= 0))
  ) {
    return normalizar(rumboSafari + correccionPantalla);
  }

  if (
    (!lectura.absolute && !eventoAbsoluto) ||
    lectura.alpha === null ||
    !Number.isFinite(lectura.alpha)
  ) {
    return null;
  }

  return normalizar(360 - lectura.alpha + correccionPantalla);
}

const TOLERANCIA_ALINEACION = 15;

export function suavizarRumbo(
  anterior: number | null,
  nuevo: number,
): number {
  const rumboNuevo = normalizar(nuevo);
  if (anterior === null || !Number.isFinite(anterior)) return rumboNuevo;

  const diferencia =
    ((rumboNuevo - normalizar(anterior) + 540) % 360) - 180;
  return normalizar(anterior + diferencia * 0.25);
}

export function guiaDespegue(
  direccionViento: number | null,
  rumboTelefono: number | null,
) {
  if (
    direccionViento === null ||
    rumboTelefono === null ||
    !Number.isFinite(direccionViento) ||
    !Number.isFinite(rumboTelefono)
  ) {
    return null;
  }

  const rumboAyudante = normalizar(direccionViento + 180);
  const diferencia =
    ((rumboAyudante - normalizar(rumboTelefono) + 540) % 360) - 180;

  if (Math.abs(diferencia) <= TOLERANCIA_ALINEACION) {
    return {
      estado: "alineado" as const,
      diferencia,
      instruccion: "Listo: el volantín va frente a ti",
    };
  }

  return diferencia > 0
    ? {
        estado: "gira-derecha" as const,
        diferencia,
        instruccion: "Gira hacia tu derecha",
      }
    : {
        estado: "gira-izquierda" as const,
        diferencia,
        instruccion: "Gira hacia tu izquierda",
      };
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
