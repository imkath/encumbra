import { useSyncExternalStore } from "react";
import type { Ventana } from "@/lib/ventanas.ts";
import { Icono } from "./Icono.tsx";

const subscribe = () => () => {};
const esApple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
const servidor = () => false;

export function AgregarCalendario({ ventana, lugar }: {
  ventana: Pick<Ventana, "inicio" | "fin">;
  lugar: string;
}) {
  const apple = useSyncExternalStore(subscribe, esApple, servidor);
  const fecha = (valor: string) => new Date(valor).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const google = "https://calendar.google.com/calendar/r/eventedit?" + new URLSearchParams({
    action: "TEMPLATE", text: "Encumbrar volantín", location: lugar,
    dates: `${fecha(ventana.inicio)}/${fecha(ventana.fin)}`,
    ctz: "America/Santiago",
    details: "Ventana ideal estimada por Encumbra. Revisa las condiciones al salir.",
  });
  const archivo = "/api/calendario?" + new URLSearchParams({ inicio: ventana.inicio, fin: ventana.fin, lugar });
  const opciones = [
    <a key="google" href={google} target="_blank" rel="noopener noreferrer">Google Calendar ↗</a>,
    <a key="archivo" href={archivo}>{apple ? "Calendario de Apple (.ics)" : "Otro calendario (.ics)"}</a>,
  ];
  return <details className="calendario-opciones">
    <summary><Icono nombre="calendario" />Agregar al calendario</summary>
    <div>{apple ? opciones.toReversed() : opciones}</div>
  </details>;
}
