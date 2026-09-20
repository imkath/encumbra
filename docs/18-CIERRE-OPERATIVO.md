# Cierre operativo

Fecha: 20 de septiembre de 2026. Producción:
[`encumbra.nvrkth.com`](https://encumbra.nvrkth.com/app).

Este documento cierra la revisión de `docs/16-REVISION-CODEX.md` sin convertir
limitaciones externas en afirmaciones falsas.

## Arquitectura que quedó activa

- Un Cron Trigger (`*/10 * * * *`) consulta una sola vez las seis celdas ICON
  y guarda el resultado completo en una clave de Workers KV.
- Las visitas y `/api/pronostico` solo leen KV en Cloudflare. Un fallo del
  proveedor no sobrescribe el último dato bueno.
- A los veinte minutos el dato se presenta como `desactualizado`; una caché
  inválida se degrada a `sin-datos` y nunca inventa un veredicto.
- `next dev` y `next start`, que no tienen bindings de Workers, conservan una
  consulta directa exclusivamente para desarrollo local.
- «Donde estoy» usa y declara la celda ICON precargada más cercana. No promete
  una medición exacta ni abre un proxy meteorológico por coordenada.
- Amanecer y puesta de sol se calculan en `lib/solar.ts` con la fecha y
  coordenadas de cada celda; ya no dependen de una respuesta `daily` externa.

## Resolución de los reparos R01–R14

| Punto | Estado | Resolución |
|---|---|---|
| R01 | Cerrado | Cron + una clave KV es la única arquitectura productiva. |
| R02 | Cerrado por alcance | No hay una segunda discretización: la ubicación compara contra las celdas efectivas devueltas por ICON. |
| R03 | Cerrado por producto | La interfaz dice «celda más cercana»; no afirma pronóstico exacto en una coordenada arbitraria. |
| R04 | Cerrado | `custom-worker.ts` reusa el handler OpenNext y agrega `scheduled`. |
| R05 | Bloqueado con seguridad | Ningún fallback alternativo emite bandas hasta validarse y recalibrarse contra ICON. |
| R06 | Cerrado | Permiso conserva autoridad, fuente, verificación, alcance y vigencia pendiente; ausencia no significa prohibición. |
| R07 | Cerrado | `docs/17-DECISIONES-2026-09-20.md` registra la sustitución nocturna. |
| R08 | Parcial | La aplicación conserva exactamente dos fronteras `use client`; MapLibre carga bajo demanda. El first load medido es 157.635 bytes transferidos y sigue sobre 120 KB por el runtime compartido de Next/React. |
| R09 | Cerrado | `tipoLugar` y `permiso` son ejes distintos. |
| R10 | Cerrado | Los seis tramos comparten `recintoId`; el contador muestra 14 recintos, no 19 parques. |
| R11 | Cerrado para el catálogo publicado | Todos los lugares publicados son recintos y declaran `precision: recinto`; no se publicaron referencias comunitarias imprecisas. |
| R12 | Cerrado | La advertencia vial conserva autoridad, URL, fecha de publicación y verificación. |
| R13 | Cerrado | No hay código, secreto ni atribución activa de Pirate Weather. |
| R14 | No aplica | El mapa usa un único estilo y no ejecuta `setStyle`; fuentes y capas se instalan una sola vez tras `load`. |

## Dependencias externas que no se activaron

- **WeatherAPI:** requiere una clave y una comparación física contra ICON.
- **DMC:** requiere usuario/token del Portal de Servicios Climáticos.
- **Bright Sky:** no tiene una cuota oficial publicada y su resolución para
  Santiago es demasiado gruesa para presentar una banda equivalente.
- **Volantinódromos comunitarios:** no se muestran hasta tener ubicación,
  precisión y fuente verificables. Una mención o una esquina aproximada no se
  convierte en un pin de navegación.

Son puertas deliberadas, no trabajo omitido: activarlas sin esos insumos
rompería la regla del producto de no inventar datos.

## Evidencia de aceptación

- 93 pruebas con `node --test`, sin framework de tests.
- ESLint sin errores ni advertencias.
- `next build` y build OpenNext exitosos.
- Evento `scheduled` ejecutado en el runtime local de Workers y clave KV leída
  de vuelta con un pronóstico válido.
- Worker productivo con binding KV y cron desplegados. El ciclo remoto de las
  17:10 UTC reemplazó la semilla con un dato nuevo a las 17:10:18 UTC.
- Smoke test en Firefox visible, 390 × 844 y 1440 × 1000, tema claro/oscuro,
  geolocalización, mapa y modo volar: sin errores de consola ni overflow.

## Deuda que permanece explícita

El presupuesto de 120 KB no está cumplido. La aplicación quedó con exactamente
dos fronteras cliente: `EncumbraApp` para planear/ubicar y `Vivo` para refrescar
en terreno. Sus componentes interactivos internos heredan esas fronteras sin
declaraciones redundantes. El runtime compartido de Next/React sigue dejando la
transferencia total por encima del techo; no se elevó el presupuesto ni se
añadió ninguna dependencia.
