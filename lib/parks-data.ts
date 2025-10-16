import type { Park } from "./types";

/**
 * Curated list of popular parks in Santiago, Chile for kite flying
 * FUENTE ÚNICA DE VERDAD: Todas las coordenadas están aquí.
 * Si necesitas actualizar un parque, edita solo este archivo.
 */
export const SANTIAGO_PARKS: Park[] = [
  {
    id: "parque-ohiggins",
    name: "Parque O'Higgins",
    lat: -33.464167, // 33°27'51"S 70°39'36"W (coordenadas precisas)
    lon: -70.66,
    comuna: "Santiago",
    area: "Grande",
    zona: "Centro",
    warnings: ["Evitar zona norte cerca de tendidos eléctricos"],
  },
  {
    id: "parque-araucano",
    name: "Parque Araucano",
    lat: -33.402778, // 33°24'10"S 70°34'32"W (coordenadas precisas)
    lon: -70.575556,
    comuna: "Las Condes",
    area: "Mediano",
    zona: "Oriente",
  },
  {
    id: "cerro-san-cristobal",
    name: "Cerro San Cristóbal",
    lat: -33.4225, // 33°25'21"S 70°37'50"W (coordenadas precisas)
    lon: -70.630556,
    comuna: "Recoleta",
    area: "Grande",
    zona: "Norte",
    warnings: ["Vientos variables por altura"],
  },
  {
    id: "parque-quinta-normal",
    name: "Parque Quinta Normal",
    lat: -33.441083, // 33°26'27.9"S 70°41'07.3"W (explanada principal)
    lon: -70.685361,
    comuna: "Quinta Normal",
    area: "Grande",
    zona: "Centro",
  },
  {
    id: "parque-bicentenario",
    name: "Parque Bicentenario",
    lat: -33.400556, // 33°24'02"S 70°36'08"W (coordenadas precisas)
    lon: -70.602222,
    comuna: "Vitacura",
    area: "Mediano",
    zona: "Oriente",
  },
  {
    id: "parque-la-hondonada",
    name: "Parque La Hondonada",
    lat: -33.426061,
    lon: -70.754492,
    comuna: "Cerro Navia",
    area: "Mediano",
    zona: "Poniente",
  },
  {
    id: "parque-brasil",
    name: "Parque Brasil",
    lat: -33.517389,
    lon: -70.615722,
    comuna: "La Granja",
    area: "Mediano",
    zona: "Sur",
  },
  {
    id: "parque-la-castrina",
    name: "Parque La Castrina",
    lat: -33.511944,
    lon: -70.629167,
    comuna: "San Joaquín",
    area: "Mediano",
    zona: "Sur",
  },
  {
    id: "parque-andre-jarlan",
    name: "Parque André Jarlán",
    lat: -33.485221,
    lon: -70.669826,
    comuna: "Pedro Aguirre Cerda",
    area: "Mediano",
    zona: "Sur",
  },
  {
    id: "parque-bernardo-leighton",
    name: "Parque Bernardo Leighton",
    lat: -33.465516,
    lon: -70.694895,
    comuna: "Estación Central",
    area: "Mediano",
    zona: "Poniente",
  },
  {
    id: "parque-cerrillos",
    name: "Parque Cerrillos",
    lat: -33.496346,
    lon: -70.701333,
    comuna: "Cerrillos",
    area: "Grande",
    zona: "Poniente",
  },
  {
    id: "parque-mapuhue",
    name: "Parque Mapuhue",
    lat: -33.579,
    lon: -70.653333,
    comuna: "La Pintana",
    area: "Mediano",
    zona: "Sur",
  },
  {
    id: "parque-la-bandera",
    name: "Parque La Bandera",
    lat: -33.542111,
    lon: -70.640861,
    comuna: "San Ramón",
    area: "Mediano",
    zona: "Sur",
  },
  {
    id: "parque-la-platina",
    name: "Parque La Platina",
    lat: -33.566667,
    lon: -70.6125,
    comuna: "La Pintana",
    area: "Mediano",
    zona: "Sur",
  },
  {
    id: "parque-penalolen",
    name: "Parque Peñalolén",
    lat: -33.464836,
    lon: -70.547211,
    comuna: "Peñalolén",
    area: "Grande",
    zona: "Oriente",
  },
  {
    id: "parque-de-la-familia",
    name: "Parque de la Familia",
    lat: -33.424111,
    lon: -70.680064,
    comuna: "Quinta Normal",
    area: "Mediano",
    zona: "Centro",
  },
  {
    id: "parque-mahuidahue",
    name: "Parque Mahuidahue",
    lat: -33.403611,
    lon: -70.618611,
    comuna: "Recoleta",
    area: "Mediano",
    zona: "Norte",
  },
];

/**
 * Find the nearest park to given coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 * @param parks - List of parks to search (defaults to SANTIAGO_PARKS)
 * @returns Nearest park or null if parks list is empty
 */
export function findNearestPark(
  lat: number,
  lon: number,
  parks: Park[] = SANTIAGO_PARKS
): Park | null {
  if (parks.length === 0) return null;

  let nearest = parks[0];
  let minDistance = getDistance(lat, lon, nearest.lat, nearest.lon);

  for (const park of parks) {
    const distance = getDistance(lat, lon, park.lat, park.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = park;
    }
  }

  return nearest;
}

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
