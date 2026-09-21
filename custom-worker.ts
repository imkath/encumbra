// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore El adaptador genera este módulo antes de ejecutar Wrangler.
import handler from "./.open-next/worker.js";

import {
  CLAVE_PRONOSTICO,
  combinarPronosticoObservado,
  empaquetarPronostico,
  leerPronosticoCache,
} from "./lib/cache-pronostico.ts";
import { crearCargadorPronostico } from "./lib/openmeteo.ts";
import { cargarObservacionesDmc } from "./server/dmc.ts";

type AlmacenPronostico = {
  get(clave: string): Promise<string | null>;
  put(clave: string, valor: string): Promise<void>;
};

type Entorno = {
  PRONOSTICO: AlmacenPronostico;
  DMC_USUARIO?: string;
  DMC_TOKEN?: string;
};
type EventoProgramado = { readonly scheduledTime: number };
type ContextoEjecucion = { waitUntil(promesa: Promise<unknown>): void };

async function actualizar(env: Entorno): Promise<void> {
  const ahora = new Date();
  const cargar = crearCargadorPronostico(
    fetch,
    () => ahora.toISOString(),
    console.error,
  );
  const credenciales =
    env.DMC_USUARIO && env.DMC_TOKEN
      ? { usuario: env.DMC_USUARIO, token: env.DMC_TOKEN }
      : null;
  const [pronostico, observaciones, textoAnterior] = await Promise.all([
    cargar(),
    cargarObservacionesDmc(fetch, credenciales, console.error),
    env.PRONOSTICO.get(CLAVE_PRONOSTICO),
  ]);

  // Un fallo jamás pisa el último dato bueno.
  if (pronostico.estado === "actual") {
    const anterior = leerPronosticoCache(textoAnterior, ahora);
    const completo = combinarPronosticoObservado(
      pronostico,
      observaciones,
      anterior,
    );
    await env.PRONOSTICO.put(
      CLAVE_PRONOSTICO,
      empaquetarPronostico(completo),
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
