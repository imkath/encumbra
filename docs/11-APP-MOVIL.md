# Encumbra como aplicación móvil

## Motivo
El usuario rechazó la página larga y su estética de landing. Este cambio sustituye esa estructura: no es una capa adicional sobre los diseños de docs/08–10.

## Recorrido
- **Parques:** búsqueda, ubicación explícita, filtros Para ti/Cercanos/Guardados; mapa real y lista con desplazamiento propio. Cinco resultados iniciales, 17 accesibles.
- **Mi salida:** parque concreto, viento/racha/lluvia, selección horaria, luz, calendario y acciones en una fila fuera del scroll.
- **Prepararme:** perfil del volantín, checklist y consejos desplegables.
- Tres destinos persistentes debajo en móvil; rail lateral en escritorio. Sin scroll de la página. Navegación/selección en URL y botón atrás funcional. Regreso del modo exterior conserva el parque y perfil.

## Datos y límites
Se conservan las seis celdas meteorológicas y el catálogo de 17 parques del usuario. Distancias en línea recta. El mapa usa Leaflet 1.9.4, teselas estándar OpenStreetMap y atribución visible; sin precarga masiva ni caché propia de teselas. Se carga de forma diferida y la lista funciona si falla el mapa.

La ubicación se solicita al tocar el control y no se almacena. Favoritos y último pronóstico se guardan localmente cuando el navegador lo permite. La disponibilidad del almacenamiento no condiciona el buscador.

**Corrección de utilidad:** la petición de clima incluye sunrise y sunset. Los tramos de viento se intersectan con periodos diurnos confirmados para presentar/crear eventos. Sin amanecer no se inventa ventana diurna. Compatible con caché anterior sin sunrise. El consejo se identifica como relativo al viento y la probabilidad de lluvia ≥50% se explicita en el texto; ese umbral de presentación significa mayor o igual probabilidad de lluvia que de ausencia y no modifica el score ni certifica seguridad.

## Fuentes técnicas
- [Leaflet 1.9.4](https://leafletjs.com/reference.html)
- [Política de teselas OSM](https://operations.osmfoundation.org/policies/tiles/)
- [Variables diarias de Open-Meteo](https://open-meteo.com/en/docs)

## Verificación
53 pruebas de dominio pasan, incluyendo ventanas nocturnas, recorte por luz, ausencia de amanecer y compatibilidad de caché. Build, TypeScript y lint verificados. Playwright en 320×568, 390×844 y 1440×1000. Capturas app-*.png en .impeccable/reviews contienen datos meteorológicos de fixture aislado, no condiciones actuales.

El fallo observado antes en datos de rachas del proveedor no se disfraza con datos de ejemplo: la app ofrece exploración y reintento sin inventar clima.

## Cierre de revisión
Revisión independiente: SHIP dentro del alcance de los hallazgos corregidos. Resueltas ventana nocturna, contexto de lluvia, etiquetas solapadas del mapa, footer de acciones y vista 320×568. Flujo verificado también con proveedor 503, teselas bloqueadas, ubicación denegada y almacenamiento denegado: búsqueda, detalle y ruta disponibles sin errores JavaScript. Se retiró la caché de pronósticos generada por los procesos temporales de prueba; no quedan fixtures configurados en la aplicación.
