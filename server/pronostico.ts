import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  CLAVE_PRONOSTICO,
  combinarPronosticoObservado,
  leerPronosticoCache,
} from "@/lib/cache-pronostico.ts";
import {
  crearCargadorPronostico,
  type Pronostico,
} from "@/lib/openmeteo.ts";
import { cargarObservacionesDmc } from "@/server/dmc.ts";

type AlmacenPronostico = {
  get(clave: string): Promise<string | null>;
};

const SIN_DATOS = {
  estado: "sin-datos",
  actualizadoEn: null,
  zonas: [],
} as const satisfies Pronostico;

const cargarDirecto = crearCargadorPronostico(
  fetch,
  () => new Date().toISOString(),
  console.error,
);

async function cargarDirectoConObservacion(): Promise<Pronostico> {
  const credenciales =
    process.env.DMC_USUARIO && process.env.DMC_TOKEN
      ? {
          usuario: process.env.DMC_USUARIO,
          token: process.env.DMC_TOKEN,
        }
      : null;
  const [pronostico, observaciones] = await Promise.all([
    cargarDirecto(),
    cargarObservacionesDmc(fetch, credenciales, console.error),
  ]);
  return combinarPronosticoObservado(
    pronostico,
    observaciones,
    SIN_DATOS,
  );
}

async function cargar(): Promise<Pronostico> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const almacen = (env as typeof env & {
      PRONOSTICO?: AlmacenPronostico;
    }).PRONOSTICO;

    // En Cloudflare nunca hacemos proxy meteorológico durante una visita.
    if (!almacen) return SIN_DATOS;
    return leerPronosticoCache(
      await almacen.get(CLAVE_PRONOSTICO),
      new Date(),
    );
  } catch {
    // `next dev` y `next start` no tienen bindings de Workers. La consulta
    // directa mantiene el entorno local útil; producción siempre toma KV.
    return cargarDirectoConObservacion();
  }
}

export const getPronostico = cache(cargar);
