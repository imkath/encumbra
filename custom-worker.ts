// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore El adaptador genera este módulo antes de ejecutar Wrangler.
import handler from "./.open-next/worker.js";

import {
  CLAVE_PRONOSTICO,
  empaquetarPronostico,
} from "./lib/cache-pronostico.ts";
import { crearCargadorPronostico } from "./lib/openmeteo.ts";

type AlmacenPronostico = {
  put(clave: string, valor: string): Promise<void>;
};

type Entorno = { PRONOSTICO: AlmacenPronostico };
type EventoProgramado = { readonly scheduledTime: number };
type ContextoEjecucion = { waitUntil(promesa: Promise<unknown>): void };

async function actualizar(env: Entorno): Promise<void> {
  const cargar = crearCargadorPronostico(
    fetch,
    () => new Date().toISOString(),
    console.error,
  );
  const pronostico = await cargar();

  // Un fallo jamás pisa el último dato bueno.
  if (pronostico.estado === "actual") {
    await env.PRONOSTICO.put(
      CLAVE_PRONOSTICO,
      empaquetarPronostico(pronostico),
    );
  }
}

const worker = {
  fetch: handler.fetch,
  async scheduled(
    _event: EventoProgramado,
    env: Entorno,
    ctx: ContextoEjecucion,
  ): Promise<void> {
    ctx.waitUntil(actualizar(env));
  },
};

export default worker;
