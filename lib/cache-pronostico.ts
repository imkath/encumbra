import type { Pronostico } from "./openmeteo.ts";
import type { ObservacionDmc } from "./dmc.ts";
import {
  leerPronosticoGuardado,
  serializarPronostico,
} from "./vivo.ts";

export const CLAVE_PRONOSTICO = "pronostico:santiago:v1";
export const FRESCURA_PRONOSTICO_MS = 20 * 60 * 1000;

const SIN_DATOS = {
  estado: "sin-datos",
  actualizadoEn: null,
  zonas: [],
} as const satisfies Pronostico;

export function empaquetarPronostico(pronostico: Pronostico): string {
  return serializarPronostico(pronostico);
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
