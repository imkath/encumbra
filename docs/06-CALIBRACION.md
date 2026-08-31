# Calibración: de dónde sale cada número

> Escrito después de que la pregunta "¿revisaste que los cálculos tengan veracidad?" expusiera que la primera versión del plan había heredado la fórmula de la v1 sin comprobarla.
> Todo lo de aquí se reproduce con `python3 calibracion/calibrar.py` (solo stdlib, sin dependencias).

---

## 0. Qué estaba sin verificar y qué se hizo

La primera versión de este plan conservó de la v1 la gaussiana centrada en 19 km/h con sigma 6 y los umbrales de gust factor 1.30 / 1.35 / 1.45, describiéndolos como "lo mejor de la v1". Era una afirmación sin respaldo: se sabía que existían, no que fueran correctos.

Se verificaron contra tres cosas: una fuente de autoridad en vuelo de cometas, cinco años de datos horarios reales de Santiago, y la consistencia física de la propia API. Las tres dijeron que la fórmula heredada estaba mal.

---

## 1. Fuente de autoridad: rangos de viento para volar

**American Kitefliers Association**, [How to Fly a Kite](https://www.kite.org/about-kites/how-to-fly-a-kite/) y su [manual en PDF](https://www.kite.org/wp-content/uploads/2020/11/howtoflyakite-revised.pdf):

| Categoría | mph | km/h |
|---|---|---|
| La mayoría de las cometas vuela | 4 - 15 | 6,4 - 24 |
| Condiciones ideales | 8 - 15 | 12,9 - 24 |
| Cometas de viento liviano | 3 - 4 | 4,8 - 6,4 |
| Delta, diamante, dragón | 6 - 15 | 9,7 - 24 |
| Caja y parafoil | 8 - 25 | 12,9 - 40 |

Dos consecuencias inmediatas:

1. **El óptimo no es 19 km/h.** El centro del rango ideal está en 18,5 km/h, así que el centro de la v1 no era descabellado, pero corresponde al borde superior de lo que vuela un diamante liviano, que es la forma del volantín chileno.
2. **Los perfiles tienen que mover el centro de la campana, no solo la tolerancia a la racha.** Un diamante y un parafoil tienen óptimos distintos (9,7-24 contra 12,9-40). En la v1 los tres perfiles compartían centro y solo cambiaban umbrales de gust factor, que es lo que menos los diferencia.

---

## 2. Los datos reales de Santiago

Fuente: Open-Meteo Historical Weather API (reanálisis ERA5), Parque O'Higgins, 2021-2025, horario.

### 2.1 El viento de Santiago es mucho más bajo de lo que suponía la fórmula

Septiembre, entre las 14:00 y las 19:00, 900 horas de cinco años:

| | km/h |
|---|---|
| p25 | 6,0 |
| p50 | 8,4 |
| p75 | 11,3 |
| p90 | 13,4 |
| p95 | 14,4 |
| máximo en 5 años | 25,0 |

**Con la curva de la v1 (centro 19, sigma 6), el score llega a 65 recién en 14 km/h.** Eso es el percentil 95 de las tardes de septiembre. La app de la v1 debía decir "no anda" en más del 90% de las tardes en que efectivamente se encumbra en Santiago. Un producto que dice que no casi siempre no se usa.

### 2.2 El gust factor no discrimina nada en Santiago

Gust factor observado (racha máxima horaria dividida por viento medio horario), horas diurnas con viento sobre 6 km/h:

| | GF |
|---|---|
| p10 | 2,09 |
| p50 | 3,04 |
| p90 | 3,80 |
| p99 | 4,43 |

La v1 empezaba a penalizar en GF 1,30 y saturaba la penalización pasando de 1,60. **El percentil 10 observado es 2,09.** Es decir, prácticamente el 100% de las horas caía en la penalización máxima: el gust factor de la v1 era una constante disfrazada de variable, y no separaba una tarde pareja de un vendaval intermitente.

El valor de referencia de 1,4 que aparece en la literatura de ingeniería eólica ([NOAA/NDBC](https://www.vos.noaa.gov/MWL/dec_08/gust_factor.shtml), [AMS Journal of Applied Meteorology](https://journals.ametsoc.org/view/journals/apme/56/12/jamc-d-17-0133.1.pdf)) **no es comparable**: usa medias de diez minutos y vientos altos sobre mar abierto. Aquí se está dividiendo una ráfaga instantánea por una media horaria en una cuenca con viento débil, y eso infla el cociente.

**Conclusión: el gust factor se elimina del modelo.** Se reemplaza por la racha absoluta, que es lo que físicamente rompe el volantín y además se puede decir en voz alta: "sopla 12 pero pega tirones de 40".

### 2.3 El ciclo diario es el producto

Viento medio por hora, septiembre:

```
06:00   3,0        16:00   9,9   ← máximo
10:00   4,2        18:00   7,6
12:00   6,4        20:00   5,8
14:00   8,8        22:00   4,3
```

El viento de Santiago tiene un ciclo diario nítido: casi nulo en la mañana, máximo entre las 15:00 y las 18:00. Esto respalda la estructura del producto (ventanas horarias, no veredictos del día) y sirve como validación externa, ver §5.

---

## 3. Un modelo de la API estaba entregando datos imposibles

La primera versión del plan eligió `gfs_seamless` porque era el que mejor separaba geográficamente. Se eligió mirando resolución espacial y sin comprobar la variable de la que depende todo el producto.

Consistencia física de las rachas, cinco días de pronóstico, misma coordenada:

| Modelo | Horas con racha **menor** que el viento medio |
|---|---|
| `best_match` | 0,8 % |
| `gfs_seamless` | **64,2 %** |
| `gfs_global` | **64,2 %** |
| `ecmwf_ifs025` | 0,0 % |
| `icon_seamless` | 0,0 % |
| `gem_seamless` | 0,0 % |

Una ráfaga máxima no puede ser menor que la media de la misma hora. **`gfs_seamless` es inservible para este producto**, y era el que estaba elegido.

### Modelo elegido: `icon_seamless`

| Criterio | `icon_seamless` | `best_match` | `ecmwf_ifs025` |
|---|---|---|---|
| Rachas imposibles | 0,0 % | 0,8 % | 0,0 % |
| Zonas distintas para los 17 parques | 6 | 6 | **2** |
| GF mediano en pronóstico | 2,27 | 3,94 | 3,03 |

ICON gana en las tres. ECMWF queda descartado porque a 0,25° la ciudad entera colapsa en dos celdas.

**Pendiente honesto:** ningún modelo se validó contra observación real, porque eso requiere datos de una estación de la Dirección Meteorológica de Chile y no de un reanálisis. El método está escrito en §6. Hasta entonces, la elección se sostiene en consistencia física, no en precisión demostrada.

---

## 4. El modelo nuevo

```python
PERFILES = {            # (centro km/h, sigma, techo de racha km/h)
    "liviano":    (12.0, 5.0, 22.0),   # volantín de papel, ñecla
    "estandar":   (14.0, 5.5, 28.0),   # volantín con cola
    "acrobatico": (20.0, 7.0, 38.0),   # dos hilos, tela
}
VIENTO_PELIGRO = 45.0    # Beaufort 7
RACHA_PELIGRO  = 45.0
CORTES = {"ideal": 65, "marginal": 40}

def score(v, g, perfil):
    c, s, techo = PERFILES[perfil]
    base = 100 * exp(-((v - c)**2) / (2 * s**2))
    pen  = min((g - techo) / techo, 1.0) * 100 if g > techo else 0
    return clamp(round(base - pen), 0, 100)

def banda(v, g, perfil):
    if v >= VIENTO_PELIGRO or g >= RACHA_PELIGRO: return "peligro"
    q, c = score(v, g, perfil), PERFILES[perfil][0]
    if q >= 65: return "ideal"
    if q >= 40: return "bravo" if v > c else "liviano"
    return "bravo" if v > c else "plancha"
```

Qué cambió respecto de la v1 y por qué:

| Cambio | Motivo |
|---|---|
| Centro 19 → 14 km/h (perfil estándar) | El p95 de las tardes de septiembre es 14,4. Con centro 19 la app dice que no casi siempre |
| Centro fijo → centro por perfil | AKA da rangos distintos por tipo de cometa. Es lo que de verdad distingue un volantín de papel de uno acrobático |
| Gust factor → racha absoluta | El GF observado en Santiago es 2 a 4 y no discrimina. La racha absoluta sí, y es interpretable |
| Penalización que saturaba en 60 puntos | Llegaba a 60 y se detenía: un viento demoledor puntuaba casi igual que uno solo malo. Ahora llega a 100 |
| Sin corte duro por racha | Añadido: racha ≥ 45 km/h es "no salgas" pase lo que pase. Es el caso que el producto promete detectar |
| `penExtra` de 20 puntos bajo 8 y sobre 35 km/h | Eliminado: la gaussiana ya vale casi cero ahí. Solo aplastaba el borde |

---

## 5. Validación

### 5.1 Casos de prueba

Los nueve pasan (`calibracion/calibrar.py`, sección 5):

| viento / racha | veredicto | por qué importa |
|---|---|---|
| 8 / 22 | APENAS | la tarde mediana de septiembre |
| 13 / 20 | ANDA | una buena tarde real |
| 12 / 45 | NO SALGAS | **el caso que justifica el producto entero**: poco viento medio, ráfagas que cortan |
| 12 / 40 | APENAS | muy rachado pero bajo el corte duro |
| 18 / 26 | ANDA | el ejemplo de los mockups |
| 3 / 8 | NO ANDA | plancha |
| 25 / 40 | BRAVO | ventoso |
| 14 / 15 | ANDA | perfecto y parejo |
| 50 / 60 | NO SALGAS | temporal |

### 5.2 El producto queda usable

Tardes de septiembre, cinco años:

| Perfil | ANDA | APENAS | BRAVO | NO ANDA |
|---|---|---|---|---|
| liviano | 43 % | 23 % | 10 % | 24 % |
| estándar | 42 % | 24 % | 2 % | 32 % |
| acrobático | 9 % | 22 % | 0 % | 68 % |

Con la fórmula de la v1 el "ANDA" no llegaba al 5%. El 9% del perfil acrobático no es un error: en Santiago casi nunca hay viento suficiente para un volantín acrobático, y decirlo es correcto.

### 5.3 Validación externa: el modelo reproduce lo que la gente ya hace

Porcentaje de horas de septiembre que dan ANDA, por hora del día:

```
12:00  17%  ########
13:00  31%  ###############
14:00  41%  ####################
15:00  50%  #########################
16:00  56%  ############################
17:00  61%  ##############################   ← máximo
18:00  31%  ###############
19:00  14%  #######
```

**El modelo dice que la mejor hora para encumbrar en Santiago es entre las 15:00 y las 18:00, con el máximo a las 17:00.** Nadie se lo dijo: sale de cruzar la curva con cinco años de datos. Coincide con lo que la gente hace por costumbre, y es la señal más fuerte de que la calibración va en la dirección correcta.

---

## 6. Lo que sigue sin verificar

Se escribe para no confundir esto con certeza.

1. **El volantín chileno no está medido.** Los centros de campana salen de los rangos de AKA corregidos hacia abajo por la distribución local, apoyados en un argumento indirecto: en Santiago se encumbra masivamente en tardes de 8 a 12 km/h, así que el volantín de papel vuela con menos viento que el mínimo del manual estadounidense. **Es una inferencia, no una medición.** Se corrige saliendo a un cerro con la app abierta y anotando qué decía y qué pasó.
2. **Ningún modelo está validado contra observación.** El método: bajar datos horarios de una estación de la Dirección Meteorológica de Chile en Santiago para el mismo período, y comparar contra el pronóstico de cada modelo con error medio absoluto, por separado para viento y para racha. Hasta hacerlo, `icon_seamless` está elegido por consistencia física, no por precisión demostrada.
3. **ERA5 es reanálisis, no observación.** Su celda es más gruesa y suaviza los extremos, así que probablemente subestima las ráfagas. Sirve para calibrar la forma de la curva y el ciclo diario; no para afirmar valores absolutos exactos.
4. **Los cortes de 65 y 40 sobre el score son arbitrarios.** Se eligieron para que el reparto de veredictos quedara utilizable. Son la primera perilla a mover con uso real.

Todo lo calibrable vive en `lib/bandas.ts`. Ajustar el modelo tiene que ser editar un archivo y volver a correr `calibracion/calibrar.py`.
