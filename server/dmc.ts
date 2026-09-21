import {
  normalizarObservacionesDmc,
  type ObservacionDmc,
} from "../lib/dmc.ts";

const DMC_URL =
  "https://climatologia.meteochile.gob.cl/application/servicios/getDatosRecientesRedEma";

export type CredencialesDmc = {
  readonly usuario: string;
  readonly token: string;
};

type FetchDmc = (input: string, init?: RequestInit) => Promise<Response>;
type ReportarError = (error: unknown) => void;

export function crearUrlDmc(credenciales: CredencialesDmc): string {
  const url = new URL(DMC_URL);
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

  try {
    const respuesta = await fetcher(crearUrlDmc(credenciales), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!respuesta.ok) {
      throw new Error(`DMC respondió ${respuesta.status}`);
    }
    return normalizarObservacionesDmc(await respuesta.json());
  } catch (error) {
    reportarError(error);
    return null;
  }
}
