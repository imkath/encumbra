import { ZONAS } from "./zonas.ts";
import type { BandaId } from "./bandas.ts";
// Coordenadas y comunas: catálogo del usuario github.com/imkath/encumbra/blob/main/lib/parks-data.ts
// Puntos de referencia, no accesos ni seguridad verificados.
const UBICACIONES = [
  {
    id: "parque-ohiggins",
    comuna: "Santiago",
    lat: -33.464167,
    lon: -70.66,
    nombre: "O'Higgins",
  },
  {
    id: "parque-araucano",
    comuna: "Las Condes",
    lat: -33.402778,
    lon: -70.575556,
    nombre: "Araucano",
  },
  {
    id: "cerro-san-cristobal",
    comuna: "Recoleta",
    lat: -33.4225,
    lon: -70.630556,
    nombre: "San Cristóbal",
  },
  {
    id: "parque-quinta-normal",
    comuna: "Quinta Normal",
    lat: -33.441083,
    lon: -70.685361,
    nombre: "Quinta Normal",
  },
  {
    id: "parque-bicentenario",
    comuna: "Vitacura",
    lat: -33.400556,
    lon: -70.602222,
    nombre: "Bicentenario",
  },
  {
    id: "parque-la-hondonada",
    comuna: "Cerro Navia",
    lat: -33.426061,
    lon: -70.754492,
    nombre: "La Hondonada",
  },
  {
    id: "parque-brasil",
    comuna: "La Granja",
    lat: -33.517389,
    lon: -70.615722,
    nombre: "Brasil",
  },
  {
    id: "parque-la-castrina",
    comuna: "San Joaquín",
    lat: -33.511944,
    lon: -70.629167,
    nombre: "La Castrina",
  },
  {
    id: "parque-andre-jarlan",
    comuna: "Pedro Aguirre Cerda",
    lat: -33.485221,
    lon: -70.669826,
    nombre: "André Jarlán",
  },
  {
    id: "parque-bernardo-leighton",
    comuna: "Estación Central",
    lat: -33.465516,
    lon: -70.694895,
    nombre: "Bernardo Leighton",
  },
  {
    id: "parque-cerrillos",
    comuna: "Cerrillos",
    lat: -33.496346,
    lon: -70.701333,
    nombre: "Cerrillos",
  },
  {
    id: "parque-mapuhue",
    comuna: "La Pintana",
    lat: -33.579,
    lon: -70.653333,
    nombre: "Mapuhue",
  },
  {
    id: "parque-la-bandera",
    comuna: "San Ramón",
    lat: -33.542111,
    lon: -70.640861,
    nombre: "La Bandera",
  },
  {
    id: "parque-la-platina",
    comuna: "La Pintana",
    lat: -33.566667,
    lon: -70.6125,
    nombre: "La Platina",
  },
  {
    id: "parque-penalolen",
    comuna: "Peñalolén",
    lat: -33.464836,
    lon: -70.547211,
    nombre: "Peñalolén",
  },
  {
    id: "parque-de-la-familia",
    comuna: "Quinta Normal",
    lat: -33.424111,
    lon: -70.680064,
    nombre: "de la Familia",
  },
  {
    id: "parque-mahuidahue",
    comuna: "Recoleta",
    lat: -33.403611,
    lon: -70.618611,
    nombre: "Mahuidahue",
  },
] as const;
export const PARQUES = ZONAS.flatMap((zona) =>
  zona.parques.map((parque) => {
    const ubicacion = UBICACIONES.find(
      (item) =>
        item.nombre.toLocaleLowerCase("es-CL") ===
        parque.nombre.toLocaleLowerCase("es-CL"),
    );
    if (!ubicacion) throw new Error(`Falta ubicación de ${parque.nombre}`);
    return {
      ...ubicacion,
      nombre: parque.nombre,
      zonaId: zona.id,
      zonaNombre: zona.nombre,
    };
  }),
);

export type Coordenadas = { readonly lat: number; readonly lon: number };
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) *
      Math.cos(b.lat * rad) *
      Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CL")
    .trim();
export function buscarParques<T extends { nombre: string; comuna: string }>(
  items: readonly T[],
  texto: string,
): T[] {
  return items.filter((p) =>
    normalizar(`${p.nombre} ${p.comuna}`).includes(normalizar(texto)),
  );
}
const PRIORIDAD: Record<BandaId, number> = {
  ideal: 0,
  liviano: 1,
  plancha: 2,
  bravo: 3,
  peligro: 4,
};
export function ordenarParques<
  T extends { distancia: number | null; banda: BandaId | null },
>(items: readonly T[], orden: "cerca" | "adecuado"): T[] {
  const cercanos = [...items].sort(
    (a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity),
  );
  if (orden === "cerca") return cercanos;
  const limite = cercanos.some((p) => p.distancia !== null)
    ? 5
    : cercanos.length;
  const candidatos = cercanos
    .slice(0, limite)
    .sort(
      (a, b) =>
        (a.banda ? PRIORIDAD[a.banda] : 5) -
          (b.banda ? PRIORIDAD[b.banda] : 5) ||
        (a.distancia ?? Infinity) - (b.distancia ?? Infinity),
    );
  return [...candidatos, ...cercanos.slice(limite)];
}
