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
export function lecturasParques(
  pronostico: Pronostico,
  perfil: Perfil,
  ahora: Date,
  ubicacion: Coordenadas | null,
) {
  return PARQUES.map((parque) => {
    const zona = pronostico.zonas.find((z) => z.id === parque.zonaId);
    const horas = zona ? adaptarHorasAlPerfil(zona.horas, perfil) : [];
    const hora = horaVigente(horas, ahora);
    const tramos = ventanas(horas, perfil);
    const amaneceres = zona?.salidaSol ?? [];
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
      horas: proximasDoceHoras(horas, ahora),
      ventanaDiurna: tramosDiurnos[0] ?? null,
      luzConfirmada: periodos.length > 0,
      esDeDia: periodos.some(
        (p) => p.inicio <= ahora.getTime() && ahora.getTime() < p.fin,
      ),
      ventana: ventanaActiva(tramos, ahora) ?? proximaVentana(tramos, ahora),
      luz: estadoLuz(zona?.puestaSol ?? [], ahora),
      distancia: ubicacion ? distanciaKm(ubicacion, parque) : null,
    };
  });
}
export type LecturaParque = ReturnType<typeof lecturasParques>[number];
