export type TamanoParque = "grande" | "mediano";

export type Parque = {
  readonly nombre: string;
  readonly comuna: string | null;
  readonly tamano: TamanoParque | null;
  readonly advertencias?: readonly string[];
};

export type Zona = {
  readonly id: string;
  readonly nombre: string;
  readonly lat: number;
  readonly lon: number;
  readonly parques: readonly Parque[];
};

export const ZONAS = [
  {
    id: "araucano-san-cristobal",
    nombre: "Araucano · San Cristóbal",
    lat: -33.4107,
    lon: -70.6214,
    parques: [
      { nombre: "Araucano", comuna: null, tamano: null },
      { nombre: "San Cristóbal", comuna: null, tamano: null },
      { nombre: "Bicentenario", comuna: null, tamano: null },
      { nombre: "De la Familia", comuna: null, tamano: null },
      { nombre: "Mahuidahue", comuna: null, tamano: null },
    ],
  },
  {
    id: "la-hondonada",
    nombre: "La Hondonada",
    lat: -33.4261,
    lon: -70.7545,
    parques: [{ nombre: "La Hondonada", comuna: null, tamano: null }],
  },
  {
    id: "ohiggins-quinta-normal",
    nombre: "O'Higgins · Quinta Normal",
    lat: -33.4937,
    lon: -70.6502,
    parques: [
      { nombre: "O'Higgins", comuna: null, tamano: null },
      { nombre: "Quinta Normal", comuna: null, tamano: null },
      { nombre: "Brasil", comuna: null, tamano: null },
      { nombre: "La Castrina", comuna: null, tamano: null },
      { nombre: "André Jarlán", comuna: null, tamano: null },
      { nombre: "La Bandera", comuna: null, tamano: null },
    ],
  },
  {
    id: "bernardo-leighton-cerrillos",
    nombre: "Bernardo Leighton · Cerrillos",
    lat: -33.4809,
    lon: -70.6981,
    parques: [
      { nombre: "Bernardo Leighton", comuna: null, tamano: null },
      { nombre: "Cerrillos", comuna: null, tamano: null },
    ],
  },
  {
    id: "penalolen",
    nombre: "Peñalolén",
    lat: -33.4648,
    lon: -70.5472,
    parques: [{ nombre: "Peñalolén", comuna: null, tamano: null }],
  },
  {
    id: "mapuhue-la-platina",
    nombre: "Mapuhue · La Platina",
    lat: -33.5728,
    lon: -70.6329,
    parques: [
      { nombre: "Mapuhue", comuna: null, tamano: null },
      { nombre: "La Platina", comuna: null, tamano: null },
    ],
  },
] as const satisfies readonly Zona[];
