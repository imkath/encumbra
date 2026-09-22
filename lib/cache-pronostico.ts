import type { Pronostico } from "./openmeteo.ts";
import type { ObservacionDmc } from "./dmc.ts";
import type { ComparacionHora } from "./coordenadas.ts";
import {
  leerPronosticoGuardado,
  serializarPronostico,
} from "./vivo.ts";

export const CLAVE_PRONOSTICO = "pronostico:santiago:v1";
export const FRESCURA_PRONOSTICO_MS = 20 * 60 * 1000;
export const HISTORIAL_TTL_SEGUNDOS = 35 * 24 * 60 * 60;

export type MuestraHistorialModelos = {
  readonly registradoEn: string;
  readonly estaciones: readonly {
    readonly codigoEstacion: string;
    readonly nombreEstacion: string;
    readonly observadoEn: string;
    readonly observado: {
      readonly viento: number;
      readonly racha: number;
      readonly direccion: number;
    };
    readonly comparaciones: readonly ComparacionHora[];
  }[];
};

type HistorialModelos = {
  readonly version: 1;
  readonly dia: string;
  readonly muestras: readonly MuestraHistorialModelos[];
};

type Registro = Record<string, unknown>;

const esRegistro = (valor: unknown): valor is Registro =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

function esComparacionHistorial(valor: unknown): boolean {
  return (
    esRegistro(valor) &&
    typeof valor.fecha === "string" &&
    esRegistro(valor.icon) &&
    esRegistro(valor.ecmwf) &&
    typeof valor.icon.viento === "number" &&
    typeof valor.icon.racha === "number" &&
    typeof valor.ecmwf.viento === "number" &&
    typeof valor.ecmwf.racha === "number"
  );
}

function esMuestraHistorial(valor: unknown): valor is MuestraHistorialModelos {
  return (
    esRegistro(valor) &&
    typeof valor.registradoEn === "string" &&
    Number.isFinite(Date.parse(valor.registradoEn)) &&
    Array.isArray(valor.estaciones) &&
    valor.estaciones.every(
      (estacion) =>
        esRegistro(estacion) &&
        typeof estacion.codigoEstacion === "string" &&
        typeof estacion.nombreEstacion === "string" &&
        typeof estacion.observadoEn === "string" &&
        esRegistro(estacion.observado) &&
        typeof estacion.observado.viento === "number" &&
        typeof estacion.observado.racha === "number" &&
        typeof estacion.observado.direccion === "number" &&
        Array.isArray(estacion.comparaciones) &&
        estacion.comparaciones.every(esComparacionHistorial),
    )
  );
}

const SIN_DATOS = {
  estado: "sin-datos",
  actualizadoEn: null,
  zonas: [],
} as const satisfies Pronostico;

export function empaquetarPronostico(pronostico: Pronostico): string {
  return serializarPronostico(pronostico);
}

export function claveHistorialModelos(registradoEn: string): string {
  return `modelos:santiago:${registradoEn.slice(0, 10)}:v1`;
}

export function actualizarHistorialModelos(
  textoAnterior: string | null,
  muestra: MuestraHistorialModelos,
): HistorialModelos {
  const dia = muestra.registradoEn.slice(0, 10);
  let anteriores: readonly MuestraHistorialModelos[] = [];
  try {
    const valor: unknown = textoAnterior ? JSON.parse(textoAnterior) : null;
    if (
      esRegistro(valor) &&
      valor.version === 1 &&
      valor.dia === dia &&
      Array.isArray(valor.muestras) &&
      valor.muestras.every(esMuestraHistorial)
    ) {
      anteriores = valor.muestras;
    }
  } catch {
    anteriores = [];
  }

  const hora = muestra.registradoEn.slice(0, 13);
  return {
    version: 1,
    dia,
    muestras: [
      ...anteriores.filter(
        ({ registradoEn }) => registradoEn.slice(0, 13) !== hora,
      ),
      muestra,
    ].sort((a, b) => a.registradoEn.localeCompare(b.registradoEn)),
  };
}

export function combinarPronosticoObservado(
  pronostico: Pronostico,
  observaciones: readonly ObservacionDmc[] | null,
  anterior: Pronostico,
): Pronostico {
  if (pronostico.estado === "sin-datos") return pronostico;

  const anteriores =
    anterior.estado === "sin-datos" ? [] : (anterior.observaciones ?? []);
  const porEstacion = new Map(
    anteriores.map((observacion) => [
      observacion.codigoEstacion,
      observacion,
    ]),
  );
  for (const observacion of observaciones ?? []) {
    porEstacion.set(observacion.codigoEstacion, observacion);
  }
  return {
    ...pronostico,
    observaciones:
      observaciones === null ? anteriores : [...porEstacion.values()],
  };
}

export function leerPronosticoCache(
  texto: string | null,
  ahora: Date,
): Pronostico {
  const guardado = leerPronosticoGuardado(texto);
  if (!guardado) return SIN_DATOS;

  const antiguedad = ahora.getTime() - Date.parse(guardado.actualizadoEn);
  return {
    ...guardado,
    estado:
      antiguedad <= FRESCURA_PRONOSTICO_MS ? "actual" : "desactualizado",
  };
}
