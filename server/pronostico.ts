import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  CLAVE_PRONOSTICO,
  leerPronosticoCache,
} from "@/lib/cache-pronostico.ts";
import {
  crearCargadorPronostico,
  type Pronostico,
} from "@/lib/openmeteo.ts";

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
    return cargarDirecto();
  }
}

export const getPronostico = cache(cargar);
