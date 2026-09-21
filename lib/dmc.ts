import { distanciaKm, type Coordenadas } from "./coordenadas.ts";

const NUDOS_A_KMH = 1.852;
const FRESCURA_OBSERVACION_MS = 20 * 60 * 1000;
const ESTACIONES_SANTIAGO = new Set(["330019", "330020", "330021"]);
const NOMBRES_CORTOS: Readonly<Record<string, string>> = {
  "330019": "Tobalaba",
  "330020": "Quinta Normal",
  "330021": "Pudahuel",
};

type Registro = Record<string, unknown>;

export type ObservacionDmc = {
  readonly fuente: "DMC";
  readonly codigoEstacion: string;
  readonly nombreEstacion: string;
  readonly lat: number;
  readonly lon: number;
  readonly observadoEn: string;
  readonly viento: number;
  readonly racha: number;
  /** Dirección desde donde sopla el viento, en grados verdaderos. */
  readonly direccion: number;
};

export type ObservacionCercana = {
  readonly observacion: ObservacionDmc;
  readonly distanciaKm: number;
};

export function nombreCortoEstacionDmc(codigo: string): string {
  return NOMBRES_CORTOS[codigo] ?? codigo;
}

const esRegistro = (valor: unknown): valor is Registro =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

function numero(valor: unknown): number | null {
  const convertido =
    typeof valor === "number"
      ? valor
      : typeof valor === "string"
        ? Number(valor.trim().replace(",", "."))
        : Number.NaN;
  return Number.isFinite(convertido) ? convertido : null;
}

function medida(valor: unknown, unidad: "kt" | "°"): number | null {
  if (typeof valor !== "string") return null;
  const coincidencia = new RegExp(
    `^\\s*(-?\\d+(?:[.,]\\d+)?)\\s*${unidad === "°" ? "°" : "kt"}\\s*$`,
    "i",
  ).exec(valor);
  if (!coincidencia?.[1]) return null;
  return numero(coincidencia[1]);
}

function fechaUtc(valor: unknown): string | null {
  if (
    typeof valor !== "string" ||
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(valor)
  ) {
    return null;
  }
  const fecha = new Date(`${valor.replace(" ", "T")}Z`);
  return Number.isFinite(fecha.getTime()) ? fecha.toISOString() : null;
}

function velocidadKmh(valor: number): number {
  return Math.round(valor * NUDOS_A_KMH * 10) / 10;
}

function leerMedicion(valor: unknown): Omit<
  ObservacionDmc,
  "fuente" | "codigoEstacion" | "nombreEstacion" | "lat" | "lon"
> | null {
  if (!esRegistro(valor)) return null;

  const observadoEn = fechaUtc(valor.momento);
  const vientoNudos =
    medida(valor.fuerzaDelVientoPromedio10Minutos, "kt") ??
    medida(valor.fuerzaDelVientoPromedio2Minutos, "kt");
  const rachaNudos =
    medida(valor.fuerzaDelViento10MinutosMax, "kt") ??
    medida(valor.fuerzaDelViento02MinutosMax, "kt");
  const direccion =
    medida(valor.direccionDelVientoPromedio10Minutos, "°") ??
    medida(valor.direccionDelVientoPromedio2Minutos, "°");

  if (
    !observadoEn ||
    vientoNudos === null ||
    rachaNudos === null ||
    direccion === null ||
    vientoNudos < 0 ||
    rachaNudos < 0 ||
    direccion < 0 ||
    direccion > 360
  ) {
    return null;
  }

  return {
    observadoEn,
    viento: velocidadKmh(vientoNudos),
    racha: velocidadKmh(rachaNudos),
    direccion: direccion === 360 ? 0 : direccion,
  };
}

export function esObservacionDmc(valor: unknown): valor is ObservacionDmc {
  if (!esRegistro(valor)) return false;
  const lat = numero(valor.lat);
  const lon = numero(valor.lon);
  const viento = numero(valor.viento);
  const racha = numero(valor.racha);
  const direccion = numero(valor.direccion);

  return (
    valor.fuente === "DMC" &&
    typeof valor.codigoEstacion === "string" &&
    typeof valor.nombreEstacion === "string" &&
    lat !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lon !== null &&
    lon >= -180 &&
    lon <= 180 &&
    typeof valor.observadoEn === "string" &&
    Number.isFinite(Date.parse(valor.observadoEn)) &&
    viento !== null &&
    viento >= 0 &&
    racha !== null &&
    racha >= 0 &&
    direccion !== null &&
    direccion >= 0 &&
    direccion < 360
  );
}

export function normalizarObservacionesDmc(payload: unknown): ObservacionDmc[] {
  if (
    !esRegistro(payload) ||
    payload.timezone !== "UTC" ||
    !Array.isArray(payload.datosEstaciones)
  ) {
    throw new Error("DMC devolvió una respuesta inválida o bloqueada");
  }

  return payload.datosEstaciones.flatMap((item): ObservacionDmc[] => {
    if (!esRegistro(item) || !esRegistro(item.estacion)) return [];
    const estacion = item.estacion;
    const codigo = estacion.codigoNacional;
    const nombre = estacion.nombreEstacion;
    const lat = numero(estacion.latitud);
    const lon = numero(estacion.longitud);

    if (
      typeof codigo !== "string" ||
      !ESTACIONES_SANTIAGO.has(codigo) ||
      typeof nombre !== "string" ||
      lat === null ||
      lon === null ||
      !Array.isArray(item.datos)
    ) {
      return [];
    }

    const ultima = item.datos
      .map(leerMedicion)
      .filter((medicion) => medicion !== null)
      .sort(
        (a, b) => Date.parse(b.observadoEn) - Date.parse(a.observadoEn),
      )[0];

    return ultima
      ? [
          {
            fuente: "DMC",
            codigoEstacion: codigo,
            nombreEstacion: nombre,
            lat,
            lon,
            ...ultima,
          },
        ]
      : [];
  });
}

export function observacionMasCercana(
  observaciones: readonly ObservacionDmc[],
  destino: Coordenadas,
  ahora: Date,
): ObservacionCercana | null {
  return (
    observaciones
      .filter(({ observadoEn }) => {
        const edad = ahora.getTime() - Date.parse(observadoEn);
        return edad >= 0 && edad <= FRESCURA_OBSERVACION_MS;
      })
      .map((observacion) => ({
        observacion,
        distanciaKm: distanciaKm(destino, observacion),
      }))
      .sort((a, b) => a.distanciaKm - b.distanciaKm)[0] ?? null
  );
}
