import type { Perfil } from "./bandas.ts";
import type { Pronostico } from "./openmeteo.ts";
import { PARQUES, distanciaKm, type Coordenadas } from "./parques.ts";
import {
  adaptarHorasAlPerfil,
  horaVigente,
  proximasDoceHoras,
} from "./planear.ts";
import { ventanas, ventanaActiva, proximaVentana } from "./ventanas.ts";
import { estadoLuz } from "./vivo.ts";

export function elegirParqueInicial(id?: string, zona?: string) {
  const elegido =
    PARQUES.find((p) => p.id === id) ??
    PARQUES.find((p) => p.zonaId === zona) ??
    PARQUES[0];
  if (!elegido) throw new Error("El catálogo de parques está vacío");
  return elegido;
}
const FORMATO_DIA = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" });

/** Calendar arithmetic in Santiago, including days when the UTC offset changes. */
export function diaDeSalida(ahora: Date, dia: 0 | 1): string {
  const partes = FORMATO_DIA.formatToParts(ahora);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  return new Date(Date.UTC(valor("year"), valor("month") - 1, valor("day") + dia)).toISOString().slice(0, 10);
}

export function lecturasParques(
  pronostico: Pronostico,
  perfil: Perfil,
  ahora: Date,
  ubicacion: Coordenadas | null,
  dia?: string,
) {
  return PARQUES.map((parque) => {
    const zona = pronostico.zonas.find((z) => z.id === parque.zonaId);
    const horas = zona ? adaptarHorasAlPerfil(zona.horas, perfil).filter((h) => !dia || diaDeSalida(new Date(h.fecha), 0) === dia) : [];
    const hora = horaVigente(horas, ahora);
    const tramos = ventanas(horas, perfil);
    const amaneceres = (zona?.salidaSol ?? []).filter((f) => !dia || diaDeSalida(new Date(f), 0) === dia);
    const periodos = amaneceres.flatMap((inicio) => {
      const fin = zona?.puestaSol.find(
        (f) => f.slice(0, 10) === inicio.slice(0, 10),
      );
      return fin ? [{ inicio: Date.parse(inicio), fin: Date.parse(fin) }] : [];
    });
    const tramosDiurnos = tramos
      .flatMap((tramo) =>
        periodos.flatMap((periodo) => {
          const inicio = Math.max(Date.parse(tramo.inicio), periodo.inicio);
          const fin = Math.min(Date.parse(tramo.fin), periodo.fin);
          return fin > inicio && fin > ahora.getTime()
            ? [
                {
                  ...tramo,
                  inicio: new Date(inicio).toISOString(),
                  fin: new Date(fin).toISOString(),
                },
              ]
            : [];
        }),
      )
      .sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio));
    return {
      ...parque,
      hora,
      banda: hora?.banda ?? null,
      horas: dia ? horas.filter((h) => Date.parse(h.fecha) + 3600000 > ahora.getTime()) : proximasDoceHoras(horas, ahora),
      ventanaDiurna: tramosDiurnos[0] ?? null,
      luzConfirmada: periodos.length > 0,
      esDeDia: periodos.some(
        (p) => p.inicio <= ahora.getTime() && ahora.getTime() < p.fin,
      ),
      ventana: ventanaActiva(tramos, ahora) ?? proximaVentana(tramos, ahora),
      luz: dia ? { fecha: zona?.puestaSol.find((f) => diaDeSalida(new Date(f), 0) === dia) ?? null } : estadoLuz(zona?.puestaSol ?? [], ahora),
      distancia: ubicacion ? distanciaKm(ubicacion, parque) : null,
    };
  });
}
export type LecturaParque = ReturnType<typeof lecturasParques>[number];

/** Daylight is checked for the selected instant, including tomorrow's hours. */
export function luzEnHorario(fecha: string, amaneceres: readonly string[], puestas: readonly string[]): boolean | null {
  const inicio = amaneceres.find((d) => d.slice(0, 10) === fecha.slice(0, 10));
  const fin = puestas.find((d) => d.slice(0, 10) === fecha.slice(0, 10));
  if (!inicio || !fin) return null;
  const instante = Date.parse(fecha);
  return instante >= Date.parse(inicio) && instante < Date.parse(fin);
}

export function contextoSalida(
  hora: { banda: string; probabilidadPrecipitacion: number | null } | null | undefined,
  luz: boolean | null,
  actualizado: boolean,
): { titulo: string; detalle: string; estado: string } | null {
  if (!hora || hora.banda === "peligro") return null;
  if (!actualizado) return { titulo: "Actualiza antes de salir", detalle: "Este pronóstico puede estar viejo. Actualízalo antes de salir.", estado: "sin-datos" };
  if (luz === false) return { titulo: "Espera a que haya luz", detalle: "Ese horario es de noche. Revisa la próxima ventana con luz antes de planear tu salida.", estado: "noche" };
  if (luz === null) return { titulo: "Confirma un horario con luz", detalle: "Falta el horario de amanecer, así que no sabemos si a esa hora hay luz.", estado: "sin-datos" };
  if ((hora.probabilidadPrecipitacion ?? 0) >= 50) return { titulo: "Atento a la lluvia", detalle: "Aunque sople bien, la lluvia puede complicar la salida. Revisa otra hora y las condiciones antes de ir.", estado: "liviano" };
  return null;
}
