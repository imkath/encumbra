// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore El adaptador genera este módulo antes de ejecutar Wrangler.
import handler from "./.open-next/worker.js";

import {
  CLAVE_PRONOSTICO,
  HISTORIAL_TTL_SEGUNDOS,
  actualizarHistorialModelos,
  claveHistorialModelos,
  combinarPronosticoObservado,
  empaquetarPronostico,
  leerPronosticoCache,
} from "./lib/cache-pronostico.ts";
import { cargarComparacionModelos } from "./lib/coordenadas.ts";
import type { ObservacionDmc } from "./lib/dmc.ts";
import { crearCargadorPronostico } from "./lib/openmeteo.ts";
import { cargarObservacionesDmc } from "./server/dmc.ts";

type AlmacenPronostico = {
  get(clave: string): Promise<string | null>;
  put(
    clave: string,
    valor: string,
    opciones?: { readonly expirationTtl?: number },
  ): Promise<void>;
};

type Entorno = {
  PRONOSTICO: AlmacenPronostico;
  DMC_USUARIO?: string;
  DMC_TOKEN?: string;
};
type EventoProgramado = { readonly scheduledTime: number };
type ContextoEjecucion = { waitUntil(promesa: Promise<unknown>): void };

async function registrarHistorialModelos(
  almacen: AlmacenPronostico,
  observaciones: readonly ObservacionDmc[],
  ahora: Date,
): Promise<void> {
  if (ahora.getUTCMinutes() >= 10 || observaciones.length === 0) return;

  const estaciones = (
    await Promise.all(
      observaciones.map(async (observacion) => ({
        observacion,
        comparaciones: await cargarComparacionModelos(
          fetch,
          observacion,
          () => ahora.toISOString(),
        ),
      })),
    )
  ).flatMap(({ observacion, comparaciones }) =>
    comparaciones.length
      ? [
          {
            codigoEstacion: observacion.codigoEstacion,
            nombreEstacion: observacion.nombreEstacion,
            observadoEn: observacion.observadoEn,
            observado: {
              viento: observacion.viento,
              racha: observacion.racha,
              direccion: observacion.direccion,
            },
            comparaciones,
          },
        ]
      : [],
  );
  if (estaciones.length === 0) return;

  const registradoEn = ahora.toISOString();
  const clave = claveHistorialModelos(registradoEn);
  const anterior = await almacen.get(clave);
  const historial = actualizarHistorialModelos(anterior, {
    registradoEn,
    estaciones,
  });
  await almacen.put(clave, JSON.stringify(historial), {
    expirationTtl: HISTORIAL_TTL_SEGUNDOS,
  });
}

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
    if (observaciones) {
      await registrarHistorialModelos(env.PRONOSTICO, observaciones, ahora).catch(
        console.error,
      );
    }
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
