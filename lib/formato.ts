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
