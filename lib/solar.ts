const ZONA_HORARIA = "America/Santiago";
const CENIT_OFICIAL = 90.833;

const radianes = (grados: number) => (grados * Math.PI) / 180;
const grados = (valor: number) => (valor * 180) / Math.PI;
const normalizar = (valor: number, modulo: number) =>
  ((valor % modulo) + modulo) % modulo;

function diaDelAno(fecha: string): number {
  const [ano, mes, dia] = fecha.split("-").map(Number);
  if (!ano || !mes || !dia) throw new Error("Fecha solar inválida");
  return (
    Math.floor(
      (Date.UTC(ano, mes - 1, dia) - Date.UTC(ano, 0, 0)) / 86_400_000,
    )
  );
}

function instanteUtc(
  fecha: string,
  latitud: number,
  longitud: number,
  salida: boolean,
): Date {
  const n = diaDelAno(fecha);
  const horaLongitud = longitud / 15;
  const aproximacion = n + ((salida ? 6 : 18) - horaLongitud) / 24;
  const anomalia = 0.9856 * aproximacion - 3.289;
  const longitudSolar = normalizar(
    anomalia +
      1.916 * Math.sin(radianes(anomalia)) +
      0.02 * Math.sin(radianes(2 * anomalia)) +
      282.634,
    360,
  );
  let ascension = normalizar(
    grados(Math.atan(0.91764 * Math.tan(radianes(longitudSolar)))),
    360,
  );
  ascension +=
    Math.floor(longitudSolar / 90) * 90 - Math.floor(ascension / 90) * 90;
  ascension /= 15;

  const senoDeclinacion = 0.39782 * Math.sin(radianes(longitudSolar));
  const cosenoDeclinacion = Math.cos(Math.asin(senoDeclinacion));
  const cosenoHora =
    (Math.cos(radianes(CENIT_OFICIAL)) -
      senoDeclinacion * Math.sin(radianes(latitud))) /
    (cosenoDeclinacion * Math.cos(radianes(latitud)));
  if (cosenoHora < -1 || cosenoHora > 1) {
    throw new Error("El sol no cruza el horizonte en esta fecha");
  }

  const angulo = salida
    ? 360 - grados(Math.acos(cosenoHora))
    : grados(Math.acos(cosenoHora));
  const horaLocalMedia =
    angulo / 15 + ascension - 0.06571 * aproximacion - 6.622;
  const horaUtc = normalizar(horaLocalMedia - horaLongitud, 24);
  const [ano, mes, dia] = fecha.split("-").map(Number) as [number, number, number];
  return new Date(
    Date.UTC(ano, mes - 1, dia) + Math.round(horaUtc * 60) * 60_000,
  );
}

function isoSantiago(fecha: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(fecha);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value;
  const zona = valor("timeZoneName")?.replace("GMT", "");
  if (!zona) throw new Error("No se pudo resolver el huso de Santiago");
  return `${valor("year")}-${valor("month")}-${valor("day")}T${valor("hour")}:${valor("minute")}:${valor("second")}${zona}`;
}

export function efemeridesSantiago(
  fecha: string,
  latitud: number,
  longitud: number,
): { readonly salida: string; readonly puesta: string } {
  return {
    salida: isoSantiago(instanteUtc(fecha, latitud, longitud, true)),
    puesta: isoSantiago(instanteUtc(fecha, latitud, longitud, false)),
  };
}
