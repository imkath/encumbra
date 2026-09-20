# Bitácora de revisión del plan de noche, GPS y datos

Revisión independiente para trabajar junto con
[`14-NOCHE-GPS-VIENTO.md`](14-NOCHE-GPS-VIENTO.md) y
[`15-ARQUITECTURA-DATOS.md`](15-ARQUITECTURA-DATOS.md). Iniciada el 20 de
septiembre de 2026 contra el commit `93cecec`.

Este archivo no reemplaza ni modifica los planes de Claude mientras siguen en
elaboración. Registra reparos para resolver antes de implementar. Cada punto
distingue una contradicción comprobada de una decisión que todavía necesita
evidencia.

## Altos: resolver antes de escribir la implementación

### R01 · Hay dos arquitecturas incompatibles para el GPS

**Evidencia.** El documento 14 todavía propone que `/api/punto` consulte
Open-Meteo durante la petición y use `caches.default`. El documento 15 decide
lo contrario: el cron escribe en KV, la aplicación solo lee KV y la Cache API no
se usa para proteger la cuota.

**Riesgo.** Si se implementan ambos documentos literalmente, reaparece el
consumo dependiente del tráfico y quedan dos mecanismos de caché con reglas de
caducidad distintas.

**Resolución propuesta.** Elegir una sola ruta de datos y reescribir B1 en el
documento 14. Si se mantiene cron + KV, definir explícitamente qué ocurre cuando
el GPS cae en una celda que el cron no precalculó.

### R02 · La discretización del punto también se contradice

**Evidencia.** El documento 14 redondea latitud y longitud a dos decimales
(~1,1 km). El documento 15 usa `Math.round(v / 0.125) * 0.125` (~12 × 14 km).

**Riesgo.** La misma ubicación puede obtener claves y pronósticos diferentes
según el camino por el que entre. Además, una fórmula de redondeo inferida a
partir de respuestas del API debe probarse contra la celda que realmente
devuelve `icon_seamless`; no basta con que seis muestras coincidan.

**Resolución propuesta.** Una sola función pura `celdaPronostico`, con casos de
frontera y pruebas contractuales contra coordenadas devueltas por Open-Meteo.
Guardar por separado las coordenadas solicitadas y las coordenadas efectivas del
modelo.

### R03 · “La app solo lee KV” todavía no cubre una ubicación arbitraria

**Evidencia.** El cron precalcula las celdas del catálogo. El plan dice que el
punto GPS “casi siempre” caerá en una celda conocida, pero el producto promete
responder en la ubicación de la persona, no solo cerca de un parque.

**Riesgo.** Una ubicación válida fuera del conjunto precalculado no tiene dato.
Hacer un fetch en ese caso contradice el costo fijo; usar la celda conocida más
cercana contradice “en mi ubicación”.

**Resolución propuesta.** Definir el área soportada y precalcular toda su grilla
finita, o declarar un camino controlado para misses. La UI debe distinguir
“pronóstico en tu celda” de “pronóstico del punto conocido más cercano”.

### R04 · El cron requiere una entrada Worker que hoy no existe

**Evidencia.** `wrangler.jsonc` apunta directamente a
`.open-next/worker.js`. El Worker generado por OpenNext exporta solo `fetch`;
para agregar `scheduled` la documentación de OpenNext exige un custom worker que
reexporte `handler.fetch`, implemente `scheduled` y pase a ser el `main` de
Wrangler.

**Riesgo.** Añadir solamente `triggers.crons` y la función de actualización no
hará que el evento tenga un handler.

**Resolución propuesta.** Incluir en el plan `custom-worker.ts`, el cambio de
`main`, bindings y tipos de `CloudflareEnv`, además de una prueba local con
`wrangler dev --test-scheduled` y `/cdn-cgi/local/scheduled`.

Fuente primaria: [OpenNext, Custom Worker](https://opennext.js.org/cloudflare/howtos/custom-worker)
y [Cloudflare, Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/).

### R05 · Un proveedor alternativo no puede entrar directo al score calibrado

**Evidencia.** Los umbrales actuales fueron calibrados con `icon_seamless` y el
proyecto exige comprobar la consistencia física de las rachas antes de cambiar
de modelo. WeatherAPI y Bright Sky exponen campos con nombres equivalentes, pero
eso no demuestra equivalencia de definición, intervalo, altura, resolución ni
sesgo.

**Riesgo.** Un fallback técnicamente completo podría producir veredictos
distintos o inseguros usando los mismos umbrales. Bright Sky, además, reduce
Santiago a estaciones MOSMIX puntuales.

**Resolución propuesta.** Antes de permitir que un fallback emita un veredicto,
crear una validación de proveedor: unidades, zona horaria, horizonte, nulos,
`racha >= viento` cuando corresponda, coherencia temporal y comparación
histórica/solapada contra ICON. Si no supera esa puerta, puede mostrar datos
degradados, pero no una banda de vuelo indistinguible de la normal.

### R06 · Los permisos necesitan vigencia, no solo una URL

**Evidencia.** La fuente de los 14 parques está fechada en septiembre de 2026 y
la lista vial del MOP cambia cada año. El tipo propuesto conserva `fuente`, pero
no fecha, período de vigencia, fecha de última verificación ni alcance. El plan
también transforma “no aparece entre los 14” en `no-autorizado`, inferencia que
conviene respaldar con el texto exacto de la fuente.

**Riesgo.** La app puede presentar como permanente una autorización estacional
o mantener una prohibición después de que cambie.

**Resolución propuesta.** Modelar evidencia estructurada: fuente, autoridad,
`publicadoEn`, `verificadoEn`, vigencia/temporada y nota de alcance. Reservar
`no-autorizado` para una fuente que lo afirme; si la fuente solo omite el lugar,
usar una categoría que no convierta ausencia en prohibición.

### R07 · La nueva decisión nocturna contradice la especificación vigente

**Evidencia.** `docs/03-PLAN.md` decide “Sin dark mode”; `docs/02-PRODUCTO.md`
lo deja fuera de alcance; `DESIGN.md` ordena que de noche el volantín repose y
la pantalla diga “POR HOY”. El nuevo plan agrega tema oscuro y permite vuelo
nocturno.

**Riesgo.** La implementación quedaría simultáneamente correcta e incorrecta
según el documento consultado. También puede confundirse “se puede volar de
noche” con “este parque está abierto y lo permite de noche”.

**Resolución propuesta.** Registrar explícitamente que la decisión del 20 de
septiembre reemplaza esas tres reglas y actualizar los documentos fuente antes
de implementar. Verificar horarios y alcance nocturno de los recintos; el
pronóstico meteorológico no concede acceso ni permiso.

### R08 · Falta reconciliar el presupuesto de islas cliente

**Evidencia.** `docs/03-PLAN.md` permite exactamente dos islas cliente. Hoy hay
ocho archivos con `"use client"`; seis están en rutas activas directa o
indirectamente. El interruptor de tema propuesto suma interacción y estado
persistente.

**Riesgo.** El trabajo puede aumentar JS sin haber medido primero la deuda ya
existente ni el techo de 120 KB gzip.

**Resolución propuesta.** Auditar el grafo y el first-load real antes de sumar
el tema. Documentar cuáles son verdaderas raíces de hidratación, eliminar los
huérfanos y justificar de manera explícita cualquier isla adicional. Medir con
`next build` en cada fase, como exige el plan original.

## Medios: cerrar durante el diseño detallado

### R09 · El tipo de permiso no coincide dentro del mismo documento

El modelo conceptual incluye `punto-de-encuentro`, pero la tarea para
`UBICACIONES` define una unión de solo tres estados. Conviene separar
`tipoLugar` (`parque`, `volantinodromo`, `ubicacion`) de `permiso`; un
volantinódromo también puede tener un permiso conocido o desconocido, por lo
que no son el mismo eje.

### R10 · Mapocho Río necesita identidad de grupo

Seis filas planas son correctas para obtener tres celdas meteorológicas, pero
pueden ocupar seis puestos del ranking, repetirse en el buscador y fragmentar
favoritos. Modelar `lugarId`/`tramoId` o padre/hijos permite consultar por tramo
sin presentar seis parques independientes.

### R11 · Los volantinódromos imprecisos necesitan precisión explícita

Una esquina comunitaria puede bastar para escoger la celda meteorológica, pero
no para dibujar un pin exacto ni iniciar navegación. Guardar `precision:
"recinto" | "referencia"`, dirección textual, confianza y fuente. La interfaz
debe representar una referencia o sector, no una coordenada falsamente exacta.

### R12 · `riesgoVial?: string` no conserva la evidencia descrita

El comentario promete fuente y año, pero el tipo solo guarda texto. Usar un
objeto con descripción, fuente, año y fecha de verificación evita que el copy
termine siendo el único lugar donde vive el dato auditable.

### R13 · Hay residuos de la fuente descartada

La arquitectura ya elige WeatherAPI, pero seguridad y atribución todavía hablan
de tokens y créditos de Pirate Weather. Hacer una pasada completa cuando Claude
cierre el documento para que proveedor, secretos, términos, atribución y orden
de degradación coincidan.

### R14 · El cambio de estilo de MapLibre debe ser idempotente

El plan propone reconstruir capas en `styledata`, evento que puede dispararse
más de una vez. La implementación debe esperar la carga del estilo y comprobar
la existencia de source/layer antes de agregarla, o puede duplicar registros y
fallar al alternar tema repetidamente.

## Puertas de aceptación adicionales

- Una sola arquitectura para GPS y caché en ambos documentos.
- Prueba de una coordenada dentro y otra fuera de las celdas precalculadas.
- Prueba local y desplegada del evento `scheduled` del custom worker.
- Fixtures equivalentes de Open-Meteo, WeatherAPI y Bright Sky que demuestren
  normalización; ningún proveedor alternativo emite banda antes de validarse.
- Pruebas de vigencia y filtrado de permisos, no solo del valor enum.
- Ranking y búsqueda sin seis resultados dominantes de Mapocho Río.
- Auditoría de islas y presupuesto gzip antes y después.
- Tema del mapa alternado varias veces sin perder fuentes, capas ni marcadores.

