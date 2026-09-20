import type { BandaId } from "./bandas.ts";
import { banda } from "./score.ts";
import { ventanas, type Ventana } from "./ventanas.ts";
import { ZONAS } from "./zonas.ts";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const TIMEZONE = "America/Santiago";
const MODELO = "icon_seamless";
const REVALIDAR_SEGUNDOS = 10 * 60;

type FetchPronostico = (
  input: string,
  init: RequestInit & { readonly next: { readonly revalidate: number } },
) => Promise<Response>;

type ReportarError = (error: unknown) => void;

type Registro = Record<string, unknown>;

type OpenMeteoZona = {
  readonly latitude: number;
  readonly longitude: number;
  readonly utc_offset_seconds: number;
  readonly timezone: string;
  readonly hourly_units: {
    readonly wind_speed_10m: "km/h";
    readonly wind_gusts_10m: "km/h";
    readonly precipitation_probability: "%";
  };
  readonly hourly: {
    readonly time: readonly string[];
    readonly wind_speed_10m: readonly number[];
    readonly wind_gusts_10m: readonly number[];
    // Optional: a cached payload from before we asked for these has none.
    readonly wind_direction_10m?: readonly number[];
    readonly cloud_cover?: readonly number[];
    readonly weather_code?: readonly number[];
    readonly precipitation_probability: readonly (number | null)[];
  };
  readonly daily: {
    readonly sunset: readonly string[];
    readonly sunrise: readonly string[];
  };
};

export type HoraPronostico = {
  readonly fecha: string;
  readonly viento: number;
  readonly racha: number;
  /** Degrees the wind blows *from*, 0 = north. Null when the provider omits it. */
  readonly direccion: number | null;
  /** Percent of sky covered. Null when the provider omits it. */
  readonly nubosidad: number | null;
  /** WMO code: 0 clear, 1-3 cloud, 45-48 fog, 51+ rain, 95+ storm. */
  readonly codigoTiempo: number | null;
  readonly probabilidadPrecipitacion: number | null;
  readonly banda: BandaId;
};

export type ZonaPronostico = {
  readonly id: string;
  readonly nombre: string;
  readonly celda: {
    readonly lat: number;
    readonly lon: number;
  };
  readonly puestaSol: readonly string[];
  readonly salidaSol?: readonly string[];
  readonly horas: readonly HoraPronostico[];
  readonly ventanas: readonly Ventana[];
};

type PronosticoConDatos = {
  readonly actualizadoEn: string;
  readonly zonas: readonly ZonaPronostico[];
};

export type Pronostico =
  | (PronosticoConDatos & { readonly estado: "actual" })
  | (PronosticoConDatos & { readonly estado: "desactualizado" })
  | {
      readonly estado: "sin-datos";
      readonly actualizadoEn: null;
      readonly zonas: readonly [];
    };

const esRegistro = (valor: unknown): valor is Registro =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

const esNumero = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isFinite(valor);

const esArregloDeNumeros = (valor: unknown): valor is number[] =>
  Array.isArray(valor) && valor.every(esNumero);

const esArregloDeTextos = (valor: unknown): valor is string[] =>
  Array.isArray(valor) && valor.every((item) => typeof item === "string");

const esArregloDePrecipitacion = (valor: unknown): valor is (number | null)[] =>
  Array.isArray(valor) &&
  valor.every((item) => item === null || esNumero(item));

function leerZona(valor: unknown): OpenMeteoZona {
  if (!esRegistro(valor)) {
    throw new Error("Open-Meteo devolvió una zona inválida");
  }

  const unidades = valor.hourly_units;
  if (
    !esRegistro(unidades) ||
    unidades.wind_speed_10m !== "km/h" ||
    unidades.wind_gusts_10m !== "km/h" ||
    unidades.precipitation_probability !== "%"
  ) {
    throw new Error("Open-Meteo devolvió unidades inesperadas");
  }

  const hourly = valor.hourly;
  const daily = valor.daily;
  if (!esRegistro(hourly) || !esRegistro(daily)) {
    throw new Error("Open-Meteo devolvió series incompletas");
  }

  const tiempos = hourly.time;
  const vientos = hourly.wind_speed_10m;
  const rachas = hourly.wind_gusts_10m;
  const largo = esArregloDeTextos(hourly.time) ? hourly.time.length : -1;
  const serieOpcional = (valor: unknown) =>
    esArregloDeNumeros(valor) && valor.length === largo ? valor : undefined;
  const direcciones = serieOpcional(hourly.wind_direction_10m);
  const nubosidades = serieOpcional(hourly.cloud_cover);
  const codigos = serieOpcional(hourly.weather_code);
  const precipitacion = hourly.precipitation_probability;
  const puestasSol = daily.sunset;
  const salidasSol = daily.sunrise ?? [];

  if (
    !esNumero(valor.latitude) ||
    !esNumero(valor.longitude) ||
    !esNumero(valor.utc_offset_seconds) ||
    valor.timezone !== TIMEZONE ||
    !esArregloDeTextos(tiempos) ||
    !esArregloDeNumeros(vientos) ||
    !esArregloDeNumeros(rachas) ||
    !esArregloDePrecipitacion(precipitacion) ||
    !esArregloDeTextos(puestasSol) ||
    !esArregloDeTextos(salidasSol) ||
    tiempos.length === 0 ||
    tiempos.length !== vientos.length ||
    tiempos.length !== rachas.length ||
    tiempos.length !== precipitacion.length
  ) {
    throw new Error("Open-Meteo devolvió series incompletas");
  }

  // The two fields have different temporal support: instantaneous wind versus
  // maximum gust in the preceding hour. Do not enforce gust >= wind or clamp
  // the provider's values. https://open-meteo.com/en/docs#hourly-parameter-definition
  if (vientos.some((viento) => viento < 0) || rachas.some((racha) => racha < 0)) {
    throw new Error("Open-Meteo devolvió velocidades negativas");
  }

  return {
    latitude: valor.latitude,
    longitude: valor.longitude,
    utc_offset_seconds: valor.utc_offset_seconds,
    timezone: valor.timezone,
    hourly_units: {
      wind_speed_10m: "km/h",
      wind_gusts_10m: "km/h",
      precipitation_probability: "%",
    },
    hourly: {
      time: tiempos,
      wind_speed_10m: vientos,
      wind_gusts_10m: rachas,
      ...(direcciones ? { wind_direction_10m: direcciones } : {}),
      ...(nubosidades ? { cloud_cover: nubosidades } : {}),
      ...(codigos ? { weather_code: codigos } : {}),
      precipitation_probability: precipitacion,
    },
    daily: { sunset: puestasSol, sunrise: salidasSol },
  };
}

function conOffset(fechaLocal: string, offsetSegundos: number): string {
  const coincidencia = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::(\d{2}))?$/.exec(
    fechaLocal,
  );
  const minutos = Math.abs(offsetSegundos) / 60;

  if (!coincidencia || !Number.isInteger(minutos) || minutos > 14 * 60) {
    throw new Error("Open-Meteo devolvió una fecha local inválida");
  }

  const horasOffset = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const minutosOffset = (minutos % 60).toString().padStart(2, "0");
  const signo = offsetSegundos >= 0 ? "+" : "-";
  const segundos = coincidencia[2] ?? "00";

  return `${coincidencia[1]}:${segundos}${signo}${horasOffset}:${minutosOffset}`;
}

export function crearUrlOpenMeteo(): string {
  const parametros = new URLSearchParams({
    latitude: ZONAS.map(({ lat }) => lat).join(","),
    longitude: ZONAS.map(({ lon }) => lon).join(","),
    hourly:
      "wind_speed_10m,wind_gusts_10m,wind_direction_10m,cloud_cover,weather_code,precipitation_probability",
    daily: "sunrise,sunset",
    forecast_days: "2",
    timezone: TIMEZONE,
    models: MODELO,
  });

  return `${OPEN_METEO_URL}?${parametros.toString()}`;
}

export function crearPronostico(
  payload: unknown,
  actualizadoEn: string,
): Pronostico {
  if (!Array.isArray(payload) || payload.length !== ZONAS.length) {
    throw new Error("Open-Meteo debe devolver exactamente seis zonas");
  }

  const zonas = payload.map((valor, indice): ZonaPronostico => {
    const origen = leerZona(valor);
    const zona = ZONAS[indice];

    if (!zona) {
      throw new Error("No existe la zona solicitada");
    }

    const horas = origen.hourly.time.map((fecha, horaIndice) => {
      const viento = origen.hourly.wind_speed_10m[horaIndice];
      const racha = origen.hourly.wind_gusts_10m[horaIndice];
      const direccion = origen.hourly.wind_direction_10m?.[horaIndice] ?? null;
      const nubosidad = origen.hourly.cloud_cover?.[horaIndice] ?? null;
      const codigoTiempo = origen.hourly.weather_code?.[horaIndice] ?? null;
      const probabilidadPrecipitacion =
        origen.hourly.precipitation_probability[horaIndice];

      if (
        viento === undefined ||
        racha === undefined ||
        probabilidadPrecipitacion === undefined
      ) {
        throw new Error("Open-Meteo devolvió una hora incompleta");
      }

      return {
        fecha: conOffset(fecha, origen.utc_offset_seconds),
        viento,
        direccion,
        nubosidad,
        codigoTiempo,
        racha,
        probabilidadPrecipitacion,
        banda: banda(viento, racha, "estandar"),
      } satisfies HoraPronostico;
    });

    return {
      id: zona.id,
      nombre: zona.nombre,
      celda: { lat: origen.latitude, lon: origen.longitude },
      salidaSol: origen.daily.sunrise.map((fecha) =>
        conOffset(fecha, origen.utc_offset_seconds),
      ),
      puestaSol: origen.daily.sunset.map((fecha) =>
        conOffset(fecha, origen.utc_offset_seconds),
      ),
      horas,
      ventanas: ventanas(horas, "estandar"),
    };
  });

  return { estado: "actual", actualizadoEn, zonas };
}

export function crearCargadorPronostico(
  fetcher: FetchPronostico,
  ahora: () => string,
  reportarError: ReportarError,
): () => Promise<Pronostico> {
  let ultimoExito: Extract<Pronostico, { estado: "actual" }> | null = null;

  return async (): Promise<Pronostico> => {
    try {
      const respuesta = await fetcher(crearUrlOpenMeteo(), {
        next: { revalidate: REVALIDAR_SEGUNDOS },
      });

      if (!respuesta.ok) {
        throw new Error(`Open-Meteo respondió ${respuesta.status}`);
      }

      const pronostico = crearPronostico(await respuesta.json(), ahora());
      if (pronostico.estado !== "actual") {
        throw new Error("El pronóstico exitoso no quedó marcado como actual");
      }

      ultimoExito = pronostico;
      return pronostico;
    } catch (error) {
      reportarError(error);

      if (ultimoExito) {
        return { ...ultimoExito, estado: "desactualizado" };
      }

      return { estado: "sin-datos", actualizadoEn: null, zonas: [] };
    }
  };
}
