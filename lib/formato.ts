const HORA_SANTIAGO = new Intl.DateTimeFormat("es-CL", {
  timeZone: "America/Santiago",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatearHora(fecha: string | Date): string {
  const valor = typeof fecha === "string" ? new Date(fecha) : fecha;
  return HORA_SANTIAGO.format(valor);
}

export function formatearVelocidad(valor: number): string {
  return `${Math.round(valor)} km/h`;
}

export function formatearVentana(inicio: string, fin: string): string {
  return `${formatearHora(inicio)}–${formatearHora(fin)}`;
}

/** "45 min", "1 h", "2 h 10 min". Never "0 min": under a minute still reads as 1. */
export function minutosLegibles(milisegundos: number): string {
  const minutosTotales = Math.max(1, Math.ceil(milisegundos / 60_000));
  const horas = Math.floor(minutosTotales / 60);
  const minutos = minutosTotales % 60;

  if (horas === 0) {
    return `${minutos} min`;
  }

  if (minutos === 0) {
    return `${horas} h`;
  }

  return `${horas} h ${minutos} min`;
}

/**
 * How old the reading is, not what o'clock it was taken. Standing in a park with
 * bad signal, "hace 4 min" is the judgement already made; "18:46" makes you look
 * at your own watch and subtract.
 */
export function formatearDesdeAhora(fecha: string | Date, ahora: Date): string {
  const valor = typeof fecha === "string" ? Date.parse(fecha) : fecha.getTime();
  if (!Number.isFinite(valor)) {
    return "sin dato";
  }
  const transcurrido = ahora.getTime() - valor;
  return transcurrido < 60_000
    ? "recién"
    : `hace ${minutosLegibles(transcurrido)}`;
}
