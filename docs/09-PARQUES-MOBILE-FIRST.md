# Parques primero

## Evidencia
Revisados por GitHub API: imkath/encumbra, lib/parks-data.ts, components/NearbyList.tsx, components/TopParksRanking.tsx. La v1 presenta ubicación, distancia, selección y filtros; el usuario pide esas tareas sin heredar su UI. Se conservan únicamente coordenadas y comunas del catálogo como datos de referencia, con procedencia en lib/parques.ts. No se importaron componentes, estilos ni dependencias de v1.

## Implementación
Buscador antes del detalle meteorológico. Geolocalización por acción explícita sin almacenar coordenadas ni enviarlas al servidor. Búsqueda por parque/comuna sin tildes; tres resultados iniciales y todos accesibles. Detalle expandible, pronóstico de su zona conservando perfil y enlace Maps. Distancia geodésica aproximada, sin tiempos de traslado inventados.

Orden adecuado: toma cinco parques cercanos, prioriza banda (ideal, marginal, falta viento, bravo, peligro), desempata por distancia. Sin ubicación compara todos por banda; sin clima ordena por cercanía si existe ubicación y no recomienda por viento. La etiqueta positiva requiere datos actuales y banda ideal. No es una certificación de seguridad ni de acceso.

## Verificación
46 pruebas de dominio, lint y build. Playwright con ubicación simulada: Araucano más cercano, 17 accesibles, búsqueda por Peñalolén sin tildes, Maps, cambio de zona, búsqueda vacía y permiso denegado. Sin desbordamiento a 320, 390 y 1440px. Capturas con fixture, no clima real.
