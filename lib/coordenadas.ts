import {
  crearPronostico,
  crearUrlOpenMeteo,
  type HoraPronostico,
  type Pronostico,
} from "./openmeteo.ts";
import { banda } from "./score.ts";
import type { Perfil } from "./bandas.ts";
import type { ObservacionDmc } from "./dmc.ts";

export type Coordenadas = { readonly lat: number; readonly lon: number };

export const OPCIONES_GEOLOCALIZACION: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0,
};

export type LugarGeocodificado = {
  readonly nombre: string;
  readonly comuna: string | null;
  readonly region: string | null;
};

export type PronosticoUbicacion = {
  readonly lugar: LugarGeocodificado;
  readonly pronostico: Pronostico;
  readonly distanciaCeldaKm: number;
  readonly comparaciones: readonly ComparacionHora[];
};

type LecturaModelo = Pick<HoraPronostico, "viento" | "racha">;

export type ComparacionHora = {
  readonly fecha: string;
  readonly icon: LecturaModelo;
  readonly ecmwf: LecturaModelo;
};

type Registro = Record<string, unknown>;
type FetchUbicacion = (
  input: string | URL | Request,
  init?: RequestInit & { readonly next?: { readonly revalidate: number } },
) => Promise<Response>;

const esRegistro = (valor: unknown): valor is Registro =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

const texto = (valor: unknown): string | null =>
  typeof valor === "string" && valor.trim() && valor.length <= 160
    ? valor.trim()
    : null;

const TIMEOUT_METEO_MS = 10_000;
const TIMEOUT_GEOCODIFICACION_MS = 5_000;

export function crearUrlGeocodificacion(coordenadas: Coordenadas): string {
  const reducidas = redondearCoordenadas(coordenadas);
  const parametros = new URLSearchParams({
    format: "jsonv2",
    lat: String(reducidas.lat),
    lon: String(reducidas.lon),
    zoom: "14",
    addressdetails: "1",
  });
  return `https://nominatim.openstreetmap.org/reverse?${parametros}`;
}

export function redondearCoordenadas(coordenadas: Coordenadas): Coordenadas {
  return {
    lat: Number(coordenadas.lat.toFixed(3)),
    lon: Number(coordenadas.lon.toFixed(3)),
  };
}

export function leerCoordenadasConsulta(
  parametros: URLSearchParams,
): Coordenadas | null {
  const lat = Number(parametros.get("lat"));
  const lon = Number(parametros.get("lon"));
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -34.4 ||
    lat > -32.8 ||
    lon < -71.4 ||
    lon > -69.8
  ) {
    return null;
  }
  return redondearCoordenadas({ lat, lon });
}

export function leerLugarGeocodificado(valor: unknown): LugarGeocodificado {
  const respuesta = esRegistro(valor) ? valor : {};
  const direccion = esRegistro(respuesta.address) ? respuesta.address : {};
  const comuna =
    texto(direccion.municipality) ??
    texto(direccion.city_district) ??
    texto(direccion.suburb) ??
    texto(direccion.town) ??
    texto(direccion.city) ??
    texto(direccion.village);
  const sector =
    texto(direccion.neighbourhood) ??
    texto(direccion.quarter) ??
    texto(direccion.suburb);
  const nombre =
    sector && comuna && sector !== comuna
      ? `${sector} · ${comuna}`
      : comuna ?? sector ?? texto(respuesta.name) ?? "Tu ubicación";

  return {
    nombre,
    comuna,
    region: texto(direccion.state),
  };
}

function compararModelos(
  icon: Pronostico,
  ecmwf: Pronostico,
): ComparacionHora[] {
  const horasIcon = icon.zonas[0]?.horas ?? [];
  const porFechaEcmwf = new Map(
    (ecmwf.zonas[0]?.horas ?? []).map((hora) => [hora.fecha, hora]),
  );

  return horasIcon.flatMap((hora): ComparacionHora[] => {
    const otra = porFechaEcmwf.get(hora.fecha);
    return otra
      ? [
          {
            fecha: hora.fecha,
            icon: { viento: hora.viento, racha: hora.racha },
            ecmwf: { viento: otra.viento, racha: otra.racha },
          },
        ]
      : [];
  });
}

export async function cargarComparacionModelos(
  fetcher: FetchUbicacion,
  coordenadas: Coordenadas,
  ahora: () => string = () => new Date().toISOString(),
): Promise<ComparacionHora[]> {
  const punto = {
    id: "ubicacion",
    nombre: "Tu ubicación",
    ...redondearCoordenadas(coordenadas),
  } as const;
  const solicitar = (modelo: "icon_seamless" | "ecmwf_ifs") =>
    fetcher(crearUrlOpenMeteo([punto], { modelo, celda: "nearest" }), {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(TIMEOUT_METEO_MS),
    }).catch(() => null);
  const [respuestaIcon, respuestaEcmwf] = await Promise.all([
    solicitar("icon_seamless"),
    solicitar("ecmwf_ifs"),
  ]);

  if (!respuestaIcon?.ok || !respuestaEcmwf?.ok) return [];
  return compararModelos(
    crearPronostico(await respuestaIcon.json(), ahora(), [punto]),
    crearPronostico(await respuestaEcmwf.json(), ahora(), [punto]),
  );
}

export function modelosDiscrepan(
  comparacion: ComparacionHora,
  perfil: Perfil,
): boolean {
  return (
    banda(comparacion.icon.viento, comparacion.icon.racha, perfil) !==
    banda(comparacion.ecmwf.viento, comparacion.ecmwf.racha, perfil)
  );
}

export function adjuntarObservaciones(
  resultado: PronosticoUbicacion,
  observaciones: readonly ObservacionDmc[],
): PronosticoUbicacion {
  return resultado.pronostico.estado === "sin-datos"
    ? resultado
    : {
        ...resultado,
        pronostico: { ...resultado.pronostico, observaciones },
      };
}

export function esPronosticoUbicacion(
  valor: unknown,
): valor is PronosticoUbicacion {
  if (!esRegistro(valor) || !esRegistro(valor.lugar)) return false;
  const pronostico = valor.pronostico;
  const comparaciones = valor.comparaciones;
  const distancia = valor.distanciaCeldaKm;

  return (
    typeof valor.lugar.nombre === "string" &&
    valor.lugar.nombre.length > 0 &&
    typeof distancia === "number" &&
    Number.isFinite(distancia) &&
    distancia >= 0 &&
    esRegistro(pronostico) &&
    pronostico.estado === "actual" &&
    typeof pronostico.actualizadoEn === "string" &&
    Array.isArray(pronostico.zonas) &&
    pronostico.zonas.length === 1 &&
    pronostico.zonas.every(
      (zona) =>
        esRegistro(zona) &&
        zona.id === "ubicacion" &&
        typeof zona.nombre === "string" &&
        esRegistro(zona.celda) &&
        typeof zona.celda.lat === "number" &&
        typeof zona.celda.lon === "number" &&
        Array.isArray(zona.horas) &&
        Array.isArray(zona.ventanas) &&
        Array.isArray(zona.puestaSol),
    ) &&
    Array.isArray(comparaciones) &&
    comparaciones.every(
      (comparacion) =>
        esRegistro(comparacion) &&
        typeof comparacion.fecha === "string" &&
        esRegistro(comparacion.icon) &&
        esRegistro(comparacion.ecmwf) &&
        typeof comparacion.icon.viento === "number" &&
        typeof comparacion.icon.racha === "number" &&
        typeof comparacion.ecmwf.viento === "number" &&
        typeof comparacion.ecmwf.racha === "number",
    )
  );
}

export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) *
      Math.cos(b.lat * rad) *
      Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}

export async function cargarPronosticoUbicacion(
  fetcher: FetchUbicacion,
  coordenadas: Coordenadas,
  ahora: () => string = () => new Date().toISOString(),
): Promise<PronosticoUbicacion> {
  if (
    !Number.isFinite(coordenadas.lat) ||
    !Number.isFinite(coordenadas.lon) ||
    Math.abs(coordenadas.lat) > 90 ||
    Math.abs(coordenadas.lon) > 180
  ) {
    throw new Error("Coordenadas inválidas");
  }

  const reducidas = redondearCoordenadas(coordenadas);
  const punto = {
    id: "ubicacion",
    nombre: "Tu ubicación",
    ...reducidas,
  } as const;
  const [respuestaMeteo, comparaciones, respuestaLugar] = await Promise.all([
    fetcher(crearUrlOpenMeteo([punto], { modelo: null, celda: "nearest" }), {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(TIMEOUT_METEO_MS),
    }),
    cargarComparacionModelos(fetcher, punto, ahora),
    fetcher(crearUrlGeocodificacion(coordenadas), {
      headers: {
        "Accept-Language": "es",
        Referer: "https://encumbra.nvrkth.com/",
        "User-Agent": "Encumbra/1.0 (https://encumbra.nvrkth.com)",
      },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(TIMEOUT_GEOCODIFICACION_MS),
    }).catch(() => null),
  ]);

  if (!respuestaMeteo.ok) {
    throw new Error(`Open-Meteo respondió ${respuestaMeteo.status}`);
  }

  const lugar =
    respuestaLugar?.ok
      ? leerLugarGeocodificado(await respuestaLugar.json())
      : leerLugarGeocodificado(null);
  const pronostico = crearPronostico(
    await respuestaMeteo.json(),
    ahora(),
    [{ ...punto, nombre: lugar.nombre }],
  );
  const celda = pronostico.zonas[0]?.celda;
  if (!celda) throw new Error("Open-Meteo no devolvió la celda solicitada");

  return {
    lugar,
    pronostico,
    distanciaCeldaKm: distanciaKm(coordenadas, celda),
    comparaciones,
  };
}
