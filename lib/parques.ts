import { ZONAS } from "./zonas.ts";
import type { BandaId } from "./bandas.ts";
export { distanciaKm } from "./coordenadas.ts";
export type { Coordenadas } from "./coordenadas.ts";

export type PermisoParque = "autorizado" | "sin-confirmar";

const FUENTE_PARQUEMET =
  "https://www.instagram.com/p/DdAFJBpAZRn/";

const EVIDENCIA_PARQUEMET = {
  autoridad: "Parquemet",
  fuente: FUENTE_PARQUEMET,
  publicadoEn: null,
  verificadoEn: "2026-09-20",
  vigencia: "pendiente-de-confirmar",
  alcance:
    "Listado consultado de recintos habilitados; confirmar vigencia antes de cada temporada.",
} as const;

const EVIDENCIA_BICENTENARIO = {
  autoridad: "Administración Parque Bicentenario de Vitacura",
  fuente: null,
  publicadoEn: null,
  verificadoEn: "2026-09-21",
  vigencia: "confirmado-directamente",
  alcance:
    "Autorización confirmada directamente por la administración del Parque Bicentenario de Vitacura; confirma reglas y horarios antes de ir.",
} as const;

const RIESGO_LA_BANDERA = {
  autoridad: "Gobierno de Chile / MOP",
  fuente:
    "https://www.gob.cl/noticias/38-puntos-mas-riesgosos-elevar-volantin-santiago/",
  publicadoEn: "2024-09-08",
  verificadoEn: "2026-09-20",
  detalle:
    "Vespucio Sur pasa junto al parque; no cruces la autopista siguiendo un volantín cortado.",
} as const;

// Las coordenadas ubican el recinto, no prometen un acceso específico.
// El permiso se mantiene separado de la condición meteorológica.
const UBICACIONES = [
  {
    id: "parque-ohiggins",
    comuna: "Santiago",
    lat: -33.464167,
    lon: -70.66,
    nombre: "O'Higgins",
    permiso: "sin-confirmar",
    fuentePermiso: null,
  },
  {
    id: "parque-araucano",
    comuna: "Las Condes",
    lat: -33.402778,
    lon: -70.575556,
    nombre: "Araucano",
    permiso: "sin-confirmar",
    fuentePermiso: null,
  },
  {
    id: "cerro-san-cristobal",
    comuna: "Recoleta",
    lat: -33.4225,
    lon: -70.630556,
    nombre: "San Cristóbal",
    permiso: "sin-confirmar",
    fuentePermiso: null,
  },
  {
    id: "parque-quinta-normal",
    comuna: "Quinta Normal",
    lat: -33.441083,
    lon: -70.685361,
    nombre: "Quinta Normal",
    permiso: "sin-confirmar",
    fuentePermiso: null,
  },
  {
    id: "parque-bicentenario",
    comuna: "Vitacura",
    lat: -33.400556,
    lon: -70.602222,
    nombre: "Bicentenario",
    permiso: "autorizado",
    fuentePermiso: null,
    evidenciaPermiso: EVIDENCIA_BICENTENARIO,
  },
  {
    id: "parque-la-hondonada",
    comuna: "Cerro Navia",
    lat: -33.425875,
    lon: -70.760074,
    nombre: "La Hondonada",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-brasil",
    comuna: "La Granja",
    lat: -33.519262,
    lon: -70.613582,
    nombre: "Parque Brasil",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-la-castrina",
    comuna: "San Joaquín",
    lat: -33.511944,
    lon: -70.629167,
    nombre: "La Castrina",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-andre-jarlan",
    comuna: "Pedro Aguirre Cerda",
    lat: -33.485221,
    lon: -70.669826,
    nombre: "André Jarlán",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-bernardo-leighton",
    comuna: "Estación Central",
    lat: -33.465516,
    lon: -70.694895,
    nombre: "Bernardo Leighton",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-cerrillos",
    comuna: "Cerrillos",
    lat: -33.491826,
    lon: -70.697599,
    nombre: "Parque Bicentenario Cerrillos",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-mapuhue",
    comuna: "La Pintana",
    lat: -33.591431,
    lon: -70.629588,
    nombre: "Mapuhue",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-la-bandera",
    comuna: "San Ramón",
    lat: -33.542011,
    lon: -70.643102,
    nombre: "La Bandera",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
    riesgoVial: RIESGO_LA_BANDERA,
  },
  {
    id: "parque-la-platina",
    comuna: "La Pintana",
    lat: -33.566339,
    lon: -70.612685,
    nombre: "La Platina",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-penalolen",
    comuna: "Peñalolén",
    lat: -33.464836,
    lon: -70.547211,
    nombre: "Peñalolén",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-de-la-familia",
    comuna: "Quinta Normal",
    lat: -33.42402,
    lon: -70.68009,
    nombre: "Parque de la Familia",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-mahuidahue",
    comuna: "Recoleta",
    lat: -33.407037,
    lon: -70.618319,
    nombre: "Mahuidahue",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-pierre-dubois",
    comuna: "Pedro Aguirre Cerda",
    lat: -33.487853,
    lon: -70.671374,
    nombre: "Pierre Dubois",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-mapocho-rio-tramo-1",
    recintoId: "parque-mapocho-rio",
    comuna: "Quinta Normal",
    lat: -33.411263,
    lon: -70.699573,
    nombre: "Mapocho Río · tramo 1",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-mapocho-rio-tramo-2",
    recintoId: "parque-mapocho-rio",
    comuna: "Quinta Normal",
    lat: -33.40998,
    lon: -70.715551,
    nombre: "Mapocho Río · tramo 2",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-mapocho-rio-tramo-3",
    recintoId: "parque-mapocho-rio",
    comuna: "Cerro Navia",
    lat: -33.412235,
    lon: -70.722799,
    nombre: "Mapocho Río · tramo 3",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-mapocho-rio-tramo-4",
    recintoId: "parque-mapocho-rio",
    comuna: "Cerro Navia",
    lat: -33.412915,
    lon: -70.739898,
    nombre: "Mapocho Río · tramo 4",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-mapocho-rio-tramo-5",
    recintoId: "parque-mapocho-rio",
    comuna: "Cerro Navia",
    lat: -33.413042,
    lon: -70.751196,
    nombre: "Mapocho Río · tramo 5",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
  },
  {
    id: "parque-mapocho-rio-tramo-6",
    recintoId: "parque-mapocho-rio",
    comuna: "Cerro Navia",
    lat: -33.413696,
    lon: -70.761354,
    nombre: "Mapocho Río · tramo 6",
    permiso: "autorizado",
    fuentePermiso: FUENTE_PARQUEMET,
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
    const evidenciaPermiso =
      "evidenciaPermiso" in ubicacion
        ? ubicacion.evidenciaPermiso
        : ubicacion.fuentePermiso
          ? EVIDENCIA_PARQUEMET
          : null;
    return {
      ...ubicacion,
      evidenciaPermiso,
      tipoLugar: "parque" as const,
      precision: "recinto" as const,
      recintoId:
        "recintoId" in ubicacion ? ubicacion.recintoId : ubicacion.id,
      nombre: parque.nombre,
      zonaId: zona.id,
      zonaNombre: zona.nombre,
    };
  }),
);

export function parquesProponibles<T extends { permiso: PermisoParque }>(
  parques: readonly T[],
): T[] {
  return parques.filter(({ permiso }) => permiso === "autorizado");
}

export function contarRecintos<T extends { recintoId: string }>(
  parques: readonly T[],
): number {
  return new Set(parques.map(({ recintoId }) => recintoId)).size;
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
