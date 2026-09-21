import { minutosLegibles } from "./formato.ts";
import { esObservacionDmc } from "./dmc.ts";
import type { Pronostico } from "./openmeteo.ts";
import { horaVigente } from "./planear.ts";
import { proximaVentana, ventanaActiva, type Ventana } from "./ventanas.ts";

const VERSION_PRONOSTICO = 1;
const RADIANES_POR_GRADO = Math.PI / 180;

type Registro = Record<string, unknown>;
type PronosticoConDatos = Exclude<Pronostico, { readonly estado: "sin-datos" }>;

export type Tendencia = "sube" | "baja" | "parejo";

export type EstadoVentana = {
  readonly tipo: "activa" | "proxima" | "sin-ventana";
  readonly texto: string;
  /** Split apart so the field screen can label the number instead of inlining it. */
  readonly glosa: string;
  readonly valor: string;
  /** When the window ends (active) or starts (upcoming), to weigh against sunset. */
  readonly hasta: string | null;
};

export type EstadoLuz =
  | {
      readonly tipo: "vigente" | "terminada";
      readonly fecha: string;
    }
  | { readonly tipo: "sin-dato"; readonly fecha: null };

type Coordenada = {
  readonly lat: number;
  readonly lon: number;
};

type ZonaCoordenada = Coordenada & {
  readonly id: string;
};

const DIA_SANTIAGO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Santiago",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const esRegistro = (valor: unknown): valor is Registro =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

const esNumero = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isFinite(valor);

export function tendencia60(
  horas: PronosticoConDatos["zonas"][number]["horas"],
  ahora: Date,
): Tendencia {
  const actual = horaVigente(horas, ahora);

  if (!actual) {
    return "parejo";
  }

  const siguiente = horas
    .filter(({ fecha }) => Date.parse(fecha) > Date.parse(actual.fecha))
    .sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha))[0];

  if (!siguiente) {
    return "parejo";
  }

  const vientoActual = Math.round(actual.viento);
  const vientoSiguiente = Math.round(siguiente.viento);

  if (vientoSiguiente > vientoActual) {
    return "sube";
  }

  if (vientoSiguiente < vientoActual) {
    return "baja";
  }

  return "parejo";
}

export function estadoVentana(
  candidatas: readonly Ventana[],
  ahora: Date,
): EstadoVentana {
  const activa = ventanaActiva(candidatas, ahora);

  if (activa) {
    const resta = minutosLegibles(Date.parse(activa.fin) - ahora.getTime());
    return {
      tipo: "activa",
      texto: `te quedan ${resta}`,
      glosa: "te quedan",
      valor: resta,
      hasta: activa.fin,
    };
  }

  const proxima = proximaVentana(candidatas, ahora);
  if (proxima) {
    const falta = minutosLegibles(Date.parse(proxima.inicio) - ahora.getTime());
    return {
      tipo: "proxima",
      texto: `en ${falta} anda`,
      glosa: "anda en",
      valor: falta,
      hasta: proxima.inicio,
    };
  }

  return {
    tipo: "sin-ventana",
    texto: "sin ventana ideal",
    glosa: "sin ventana",
    valor: "hoy no",
    hasta: null,
  };
}

function diaSantiago(fecha: Date): string {
  const partes = DIA_SANTIAGO.formatToParts(fecha);
  const parte = (tipo: Intl.DateTimeFormatPartTypes): string =>
    partes.find((item) => item.type === tipo)?.value ?? "";

  return `${parte("year")}-${parte("month")}-${parte("day")}`;
}

export function estadoLuz(
  puestasSol: readonly string[],
  ahora: Date,
): EstadoLuz {
  const puesta = puestasSol.find((fecha) =>
    fecha.startsWith(diaSantiago(ahora)),
  );

  if (!puesta) {
    return { tipo: "sin-dato", fecha: null };
  }

  return {
    tipo: Date.parse(puesta) > ahora.getTime() ? "vigente" : "terminada",
    fecha: puesta,
  };
}

function fechaIcs(fecha: string | Date): string {
  const iso = (
    typeof fecha === "string" ? new Date(fecha) : fecha
  ).toISOString();
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escaparIcs(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function crearCalendario(
  ventana: Pick<Ventana, "inicio" | "fin">,
  zona: string,
  creadoEn: Date,
): string {
  const uid = `${fechaIcs(ventana.inicio)}-${encodeURIComponent(zona)}@encumbra`;
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Encumbra//Ventana de vuelo//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fechaIcs(creadoEn)}`,
    `DTSTART:${fechaIcs(ventana.inicio)}`,
    `DTEND:${fechaIcs(ventana.fin)}`,
    "SUMMARY:Encumbrar volantín",
    `LOCATION:${escaparIcs(zona)}`,
    "DESCRIPTION:Ventana ideal estimada por Encumbra. Revisa las condiciones al salir.",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ];

  return lineas.join("\r\n");
}

function esHora(valor: unknown): boolean {
  return (
    esRegistro(valor) &&
    typeof valor.fecha === "string" &&
    esNumero(valor.viento) &&
    esNumero(valor.racha) &&
    (valor.probabilidadPrecipitacion === null ||
      esNumero(valor.probabilidadPrecipitacion)) &&
    ["plancha", "liviano", "ideal", "bravo", "peligro"].includes(
      String(valor.banda),
    )
  );
}

function esVentana(valor: unknown): boolean {
  return (
    esRegistro(valor) &&
    typeof valor.inicio === "string" &&
    typeof valor.fin === "string" &&
    valor.banda === "ideal" &&
    esNumero(valor.vientoMedio) &&
    esNumero(valor.rachaMax) &&
    esNumero(valor.brecha)
  );
}

function esZona(valor: unknown): boolean {
  return (
    esRegistro(valor) &&
    typeof valor.id === "string" &&
    typeof valor.nombre === "string" &&
    esRegistro(valor.celda) &&
    esNumero(valor.celda.lat) &&
    esNumero(valor.celda.lon) &&
    (valor.salidaSol === undefined ||
      (Array.isArray(valor.salidaSol) &&
        valor.salidaSol.every(
          (item) =>
            typeof item === "string" && Number.isFinite(Date.parse(item)),
        ))) &&
    Array.isArray(valor.puestaSol) &&
    valor.puestaSol.every((item) => typeof item === "string") &&
    Array.isArray(valor.horas) &&
    valor.horas.length > 0 &&
    valor.horas.every(esHora) &&
    Array.isArray(valor.ventanas) &&
    valor.ventanas.every(esVentana)
  );
}

function esPronosticoConDatos(valor: unknown): valor is PronosticoConDatos {
  return (
    esRegistro(valor) &&
    (valor.estado === "actual" || valor.estado === "desactualizado") &&
    typeof valor.actualizadoEn === "string" &&
    Number.isFinite(Date.parse(valor.actualizadoEn)) &&
    Array.isArray(valor.zonas) &&
    valor.zonas.length > 0 &&
    valor.zonas.every(esZona) &&
    (valor.observaciones === undefined ||
      (Array.isArray(valor.observaciones) &&
        valor.observaciones.every(esObservacionDmc)))
  );
}

export function serializarPronostico(pronostico: Pronostico): string {
  return JSON.stringify({ version: VERSION_PRONOSTICO, pronostico });
}

export function leerPronosticoGuardado(
  texto: string | null,
): PronosticoConDatos | null {
  if (!texto) {
    return null;
  }

  try {
    const guardado: unknown = JSON.parse(texto);

    if (
      !esRegistro(guardado) ||
      guardado.version !== VERSION_PRONOSTICO ||
      !esPronosticoConDatos(guardado.pronostico)
    ) {
      return null;
    }

    return guardado.pronostico;
  } catch {
    return null;
  }
}

function distanciaAngular(origen: Coordenada, destino: Coordenada): number {
  const latitudOrigen = origen.lat * RADIANES_POR_GRADO;
  const latitudDestino = destino.lat * RADIANES_POR_GRADO;
  const diferenciaLatitud = (destino.lat - origen.lat) * RADIANES_POR_GRADO;
  const diferenciaLongitud = (destino.lon - origen.lon) * RADIANES_POR_GRADO;
  const senoLatitud = Math.sin(diferenciaLatitud / 2);
  const senoLongitud = Math.sin(diferenciaLongitud / 2);

  return (
    senoLatitud * senoLatitud +
    Math.cos(latitudOrigen) *
      Math.cos(latitudDestino) *
      senoLongitud *
      senoLongitud
  );
}

export function zonaMasCercana<T extends ZonaCoordenada>(
  origen: Coordenada,
  zonas: readonly T[],
): T | null {
  let cercana: T | null = null;
  let menorDistancia = Number.POSITIVE_INFINITY;

  for (const zona of zonas) {
    const distancia = distanciaAngular(origen, zona);
    if (distancia < menorDistancia) {
      cercana = zona;
      menorDistancia = distancia;
    }
  }

  return cercana;
}
