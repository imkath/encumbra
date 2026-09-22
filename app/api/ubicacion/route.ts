import {
  adjuntarObservaciones,
  cargarPronosticoUbicacion,
  leerCoordenadasConsulta,
} from "@/lib/coordenadas.ts";
import { getPronostico } from "@/server/pronostico.ts";

const SIN_CACHE = { "Cache-Control": "private, no-store" } as const;

export async function GET(request: Request): Promise<Response> {
  const coordenadas = leerCoordenadasConsulta(new URL(request.url).searchParams);
  if (!coordenadas) {
    return Response.json(
      { error: "Coordenadas fuera del alcance de Santiago" },
      { status: 400, headers: SIN_CACHE },
    );
  }

  try {
    const [resultado, general] = await Promise.all([
      cargarPronosticoUbicacion(fetch, coordenadas),
      getPronostico(),
    ]);
    const observaciones =
      general.estado === "sin-datos" ? [] : (general.observaciones ?? []);

    return Response.json(adjuntarObservaciones(resultado, observaciones), {
      headers: SIN_CACHE,
    });
  } catch {
    // El error de fetch puede incluir la URL y, con ella, la coordenada reducida.
    // El mensaje operativo basta para observar el fallo sin registrar ubicación.
    console.error("No se pudo cargar el pronóstico para la ubicación");
    return Response.json(
      { error: "Pronóstico para la ubicación no disponible" },
      { status: 502, headers: SIN_CACHE },
    );
  }
}
