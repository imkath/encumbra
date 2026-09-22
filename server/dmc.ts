import {
  normalizarObservacionesDmc,
  type ObservacionDmc,
} from "../lib/dmc.ts";

const DMC_URL =
  "https://climatologia.meteochile.gob.cl/application/servicios/getDatosRecientesEma";
const ESTACIONES = ["330019", "330020", "330021"] as const;

export type CredencialesDmc = {
  readonly usuario: string;
  readonly token: string;
};

type FetchDmc = (input: string, init?: RequestInit) => Promise<Response>;
type ReportarError = (error: unknown) => void;

export function crearUrlDmc(
  codigoEstacion: string,
  credenciales: CredencialesDmc,
): string {
  const url = new URL(`${DMC_URL}/${codigoEstacion}`);
  url.searchParams.set("usuario", credenciales.usuario);
  url.searchParams.set("token", credenciales.token);
  return url.toString();
}

export async function cargarObservacionesDmc(
  fetcher: FetchDmc,
  credenciales: CredencialesDmc | null,
  reportarError: ReportarError,
): Promise<ObservacionDmc[] | null> {
  if (!credenciales) return null;

  let exitos = 0;
  const resultados = await Promise.all(
    ESTACIONES.map(async (codigo): Promise<ObservacionDmc[]> => {
      try {
        const respuesta = await fetcher(crearUrlDmc(codigo, credenciales), {
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(15_000),
        });
        if (!respuesta.ok) {
          throw new Error(`DMC respondió ${respuesta.status}`);
        }
        const observaciones = normalizarObservacionesDmc(
          await respuesta.json(),
        );
        exitos += 1;
        return observaciones;
      } catch (error) {
        const detalle = error instanceof Error ? error.name : "Error";
        reportarError(new Error(`Consulta DMC fallida (${detalle})`));
        return [];
      }
    }),
  );

  if (exitos === 0) {
    return null;
  }

  return resultados.flat();
}
