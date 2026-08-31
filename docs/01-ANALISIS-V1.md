# Análisis de Encumbra v1

> Lectura completa del repo `imkath/encumbra` (clonado el 30-ago-2026) más verificación contra la API real.
> Este documento existe para no repetir lo que ya falló y para no botar lo que sí servía.

---

## 1. La idea principal

**Una sola pregunta:** *¿anda el volantín, cuándo y dónde?*

Encumbra traduce un pronóstico de viento en un veredicto accionable para una persona con un volantín en la mano en Santiago. No es una app del clima: es una app de decisión con una sola variable dominante (el viento) y una ventana de uso muy concentrada (septiembre, aunque el vuelo es todo el año).

El posicionamiento real está en la brecha que ningún widget del clima cubre: los widgets muestran velocidad media, y la velocidad media no decide nada. Lo que decide es la **relación entre viento medio y racha**. Con 15 km/h parejos el volantín anda; con 15 km/h y rachas de 40 se corta el hilo.

## 2. El concepto técnico: el Q-Score

El corazón de la v1 es `lib/volantin-score.ts`. Convierte dos números crudos en uno interpretable:

```
GF   = racha / max(viento, 1)                       # gust factor
base = 100 · exp(-(v - 19)² / (2 · 6²))             # gaussiana centrada en 19 km/h
Q    = clamp(base − penalización_racha − penalización_extremo, 0, 100)
```

Tres decisiones cuya **forma** vale la pena conservar. Sus números, todos, resultaron estar mal calibrados: ver [`06-CALIBRACION.md`](06-CALIBRACION.md).

1. **Gaussiana, no umbrales.** El viento ideal no es un rango con bordes duros, es una campana con máximo en 19 km/h y sigma de 6. Poco viento y mucho viento son ambos malos, y la curva lo dice sin escalones artificiales.
2. **El gust factor como penalización aparte.** Separar "cuánto sopla" de "qué tan parejo sopla" es lo que hace útil al índice.
3. **Perfil de volantín.** Liviano, estándar y acrobático. Un volantín de papel y uno acrobático no vuelan con el mismo viento, y el usuario sabe cuál trae. En la v1 el perfil solo movía umbrales de racha, que es lo que menos los distingue: en la v2 mueve el centro de la campana.

Encima de eso, `lib/find-windows.ts` agrupa horas consecutivas que pasan el filtro en **ventanas** ("de 15:00 a 17:00 anda"), con su propio Q de ventana que premia el viento parejo y castiga la desviación estándar.

## 3. Funcionalidades que tenía

| Bloque | Qué hacía |
|---|---|
| Índice horario | Q-Score 0-100 por hora, 72 horas hacia adelante |
| Ventanas recomendadas | Tramos continuos de buenas condiciones, ordenados por calidad |
| Decisión rápida | Tres estados: ahora, mejor de hoy, mejor de mañana |
| Ranking de parques | 17 parques de Santiago ordenados por score |
| Mapa interactivo | Parques ubicados, selección por mapa |
| Geolocalización | Detección del parque más cercano |
| Alertas | Aviso 30 minutos antes de una ventana, guardado en `localStorage` |
| Perfil de volantín | Liviano / estándar / acrobático |
| Unidades | km/h, m/s, nudos |
| Contenido de seguridad | Páginas de seguridad, cómo funciona, preguntas frecuentes |
| Formularios | Contacto y sugerencia de parques, por email con rate limiting |
| Tema | Claro y oscuro |

## 4. Lo que estaba mal

### 4.1 Problemas de arquitectura de datos (verificados contra la API)

**El ranking de parques es falsa precisión.** Los 17 parques se consultan por coordenada individual, pero el modelo meteorológico tiene celdas de unos 11 km. Llamada real del 30-ago-2026 con las 17 coordenadas del repo:

```
17 parques  →  6 celdas distintas del modelo

(-33.4271, -70.6428) → O'Higgins, Araucano, San Cristóbal, Quinta Normal,
                        Bicentenario, André Jarlán, De la Familia, Mahuidahue
(-33.4271, -70.7540) → La Hondonada
(-33.4974, -70.6188) → Brasil, La Castrina, La Bandera, Peñalolén
(-33.4974, -70.7302) → Bernardo Leighton, Cerrillos
(-33.5677, -70.7063) → Mapuhue
(-33.5677, -70.5948) → La Platina
```

Ocho parques del centro y oriente devuelven series **idénticas**. El ranking los ordena igual, así que el orden lo decide el ruido de redondeo, no el viento. La app le dice al usuario "andate al Araucano en vez del O'Higgins" sin ninguna información que respalde esa diferencia.

Se probaron todos los modelos disponibles buscando mejor resolución. `gfs_seamless` es el que más separa (llega a distinguir O'Higgins de Araucano), pero sigue en torno a 11 km. **No existe modelo de alta resolución para Chile.** La conclusión no es técnica sino de producto: la unidad honesta de comparación es la **zona**, no el parque.

**17 llamadas HTTP para 6 pronósticos.** `fetchMultiParkWeather` itera parque por parque en tandas de 4, con pausas de 200 ms entre tandas. Open-Meteo acepta coordenadas múltiples en una sola petición y devuelve un array. Verificado: una llamada con los 17 puntos responde en 4 KB. La v1 hace 17 peticiones y una espera artificial de casi un segundo, en el celular de alguien parado en un cerro con 4G malo.

**El filtro de lluvia nunca se aplicó.** `findWindows` filtra por `precip <= 30`, pero la URL de `weather-api.ts` solo pide `wind_speed_10m,wind_gusts_10m,wind_direction_10m`. `precip` llega siempre `undefined` y el código lo resuelve con `h.precip ?? 0`. El filtro existe en el papel y es inerte en producción.

**La curva está calibrada para un lugar que no es Santiago.** Con centro en 19 km/h y sigma 6, el score llega a 65 recién a los 14 km/h. El percentil 95 de las tardes de septiembre en Santiago es 14,4 km/h: la v1 tenía que decir "no anda" en más del 90% de las tardes en que la gente efectivamente encumbra. Detalle en [`06-CALIBRACION.md`](06-CALIBRACION.md) §2.1.

**El gust factor era una constante disfrazada de variable.** La v1 penalizaba desde GF 1,30 y saturaba pasando de 1,60. El GF observado en Santiago tiene percentil 10 de 2,09 y mediana 3,04, así que prácticamente todas las horas caían en la penalización máxima y el factor no separaba una tarde pareja de un vendaval intermitente. Detalle en §2.2 del mismo documento.

**La documentación miente sobre el código.** `SCORES-GUIDE.md` afirma umbrales `S_min` de 40 / 45 / 55 por perfil. `find-windows.ts` usa 60 / 70 / 65. Además el doc dice que el estándar es el más permisivo y el código lo tiene como el más exigente. Un documento desactualizado es peor que ninguno.

**Dos escalas de score conviviendo.** El Q individual (0-100) y el Q de ventana (unidades de km/h, puede ser negativo) obligaron a inventar `normalizeQScore()` para volver a mapear a 0-100 antes de pintar cualquier badge. Es complejidad que existe solo para reparar una decisión anterior.

### 4.2 Problemas de UX

**Desktop first parchado.** `app/page.tsx` tiene 1375 líneas y decide qué mostrar con condicionales del tipo `{(!isMobile || mobileTab === "summary") && ...}`. Es una vista de escritorio a la que se le escondieron partes en móvil. El resultado en un teléfono es una barra de tabs que corta arbitrariamente un layout pensado para otra pantalla.

**Un solo contexto de uso para dos situaciones distintas.** La app trata igual a quien está en el sillón decidiendo si vale la pena salir y a quien está parado en el cerro con el hilo en la mano. Son necesidades opuestas: la primera quiere comparar y planificar, la segunda quiere un número enorme y nada más.

**Demasiada decisión encima.** Perfil de volantín, unidades, parque, tema, tab, alerta. Es carga cognitiva repartida por toda la pantalla para responder una pregunta binaria (Ley de Hick).

**Dos escalas de score expuestas al usuario.** Que el equipo necesite un documento de 200 líneas para explicar cuál score va en cuál badge significa que el usuario nunca lo va a entender.

### 4.3 Problemas visuales

Estética de generador: gradientes azul a cyan en cada superficie, `backdrop-blur-xl`, `rounded-2xl`, `shadow-xl`, tarjetas translúcidas apiladas y un modo oscuro en violeta. Los rastros son literales: los `console.warn` dicen `[v0]`. Es el aspecto por defecto de una herramienta de generación, no una decisión de diseño, y al sol del mediodía el vidrio esmerilado con texto gris sobre gradiente claro es ilegible.

## 5. Qué se rescata y qué se bota

**Se rescata (la forma, no los números):**
- La idea de una gaussiana sobre el viento medio, recentrada y reensanchada.
- La idea de penalizar la irregularidad aparte, pero por racha absoluta y no por gust factor.
- Los tres perfiles de volantín, ahora moviendo el centro de la campana.
- El concepto de ventana continua (mejor que la hora suelta).
- El contenido de seguridad, con la Ley 20.700 correctamente citada.
- Open-Meteo como fuente: gratis, sin API key para uso no comercial, honesta.

**Se bota:**
- El ranking de parques por viento.
- La segunda escala de score y su normalización.
- Las 17 llamadas HTTP.
- El monolito de 1375 líneas.
- Todo el CSS.
- El modo oscuro (decisión, no omisión: los volantines se encumbran de día).
- Los formularios de contacto y sugerencia, el mapa interactivo y las páginas de contenido, hasta que exista alguien pidiéndolos.

## 6. La reformulación en una frase

La v1 preguntaba *"¿cuál es el score?"* y respondía con un panel.
La v2 pregunta *"¿salgo o no salgo?"* antes de ir, y *"¿cuánto me queda?"* mientras estoy allá.
