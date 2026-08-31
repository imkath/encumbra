# Encumbra v2 — Plan de construcción

> Ejecutable en orden. Cada fase termina en algo que corre y se puede mirar.
> Lee antes: [`01-ANALISIS-V1.md`](01-ANALISIS-V1.md), [`02-PRODUCTO.md`](02-PRODUCTO.md), [`DESIGN.md`](../DESIGN.md).

---

## 0. Stack y por qué

Ya está scaffoldeado en este repo: **Next 16.1.1 · React 19.2.3 · Tailwind 4 · TypeScript 5 · pnpm**.

Se mantiene, con condiciones. Next es más pesado de lo que esta app necesita, y eso se paga con reglas, no con una migración:

- **Server Components por defecto.** El veredicto se calcula en el servidor y llega en el HTML. La primera pantalla es útil sin que haya corrido un solo byte de JS de la app.
- **`"use client"` en exactamente dos islas:** el interruptor de modo y el refresco del modo volar. Si aparece una tercera, hay que justificarla en el PR.
- **Cero dependencias nuevas.** Sin librería de componentes, sin charts, sin iconos, sin gestor de estado, sin fetcher, sin librería de fechas. `Intl.DateTimeFormat` cubre las fechas.
- **Sin framework de tests.** `node --test` con type stripping nativo (Node ≥ 22.6). Fijar `.nvmrc` en `22`: el Node por defecto de la máquina es v20.10 y no sirve.

Presupuestos, ambos verificables con `next build` y no negociables:

| Presupuesto | Techo |
|---|---|
| HTML + CSS + fuente crítica (primera pantalla útil) | < 100 KB |
| JS de cliente, first load, gzip | < 120 KB |
| Peticiones de red para pintar el veredicto | 1 |

Si el JS se pasa del techo, se corta funcionalidad, no se sube el techo.

---

## 1. Arquitectura

```
app/
  layout.tsx              server · fuentes, tokens, <html lang="es-CL">
  page.tsx                server · MODO PLANEAR
  volar/page.tsx          server · MODO VOLAR (cascarón + dato inicial)
  api/pronostico/route.ts edge  · reexpone getPronostico() para el refresco
lib/
  bandas.ts               constantes calibrables. FUENTE ÚNICA DE UMBRALES
  score.ts                gaussiana por perfil + penalización por racha
  ventanas.ts             agrupación de horas en tramos
  zonas.ts                6 zonas + parques como metadata
  openmeteo.ts            una llamada, todas las zonas, con cache
  formato.ts              hora, duración, velocidad
components/
  Veredicto.tsx           server
  Cola.tsx                server
  Brecha.tsx              server
  Seguridad.tsx           server
  InterruptorModo.tsx     client · isla 1
  Vivo.tsx                client · isla 2 (refresco + vibración + offline)
test/
  score.test.ts
  ventanas.test.ts
```

**Regla de dependencia:** `lib/` no importa nada de `app/` ni de `components/`, y no toca el DOM. Es lógica pura, testeable con `node --test` sin navegador ni mocks.

---

## 2. El dominio

### 2.1 `lib/bandas.ts` — lo único calibrable

Todos los umbrales físicos viven aquí y en ningún otro lado. Están anclados en Beaufort, no inventados, y **son v1 ajustable con uso real en cerro**.

```ts
// Todos los valores calibrados en docs/06-CALIBRACION.md contra AKA y
// 5 años de datos horarios reales de Santiago. Reproducible con
// python3 calibracion/calibrar.py

export const PERFILES = {          // centro de la campana, sigma, techo de racha
  liviano:    { centro: 12, sigma: 5.0, techoRacha: 22 },  // volantín de papel
  estandar:   { centro: 14, sigma: 5.5, techoRacha: 28 },  // volantín con cola
  acrobatico: { centro: 20, sigma: 7.0, techoRacha: 38 },  // dos hilos, tela
} as const;

export const VIENTO_PELIGRO = 45;  // km/h, Beaufort 7
export const RACHA_PELIGRO  = 45;  // km/h, corte duro por ráfaga

export const CORTES = { ideal: 65, marginal: 40 } as const;  // sobre el score

export const VEREDICTOS = {
  plancha: "NO ANDA",   liviano: "APENAS",  ideal: "ANDA",
  bravo:   "BRAVO",     peligro: "NO SALGAS",
} as const;
```

**El perfil mueve el centro de la campana, no solo la tolerancia a la racha.**
La v1 le daba a los tres perfiles el mismo centro (19 km/h) y solo les cambiaba
umbrales de gust factor, que es justamente lo que menos los distingue. La AKA da
rangos distintos por tipo de cometa: diamante 9,7-24 km/h, caja y parafoil
12,9-40. Eso es lo que separa un volantín de papel de uno acrobático.

**No hay gust factor.** El GF observado en Santiago tiene mediana 3,04 y
percentil 10 de 2,09, así que los umbrales de la v1 (1,30 / 1,35 / 1,45) metían
prácticamente todas las horas en la penalización máxima: era una constante
disfrazada de variable. Se reemplaza por la **racha absoluta**, que es lo que
físicamente rompe el volantín y además se puede decir en voz alta.

**La banda se deriva del score, nunca de la velocidad sola.**

`DESIGN.md` §9 propone bandas por rango de velocidad (11-28 km/h = ANDA). Se
descarta por dos razones:

1. **Se contradice con la curva.** 27 km/h caería en "ideal" y da un score muy
   por debajo del corte. Es la v1 otra vez: dos escalas peleando y alguien
   escribiendo una función para reconciliarlas.
2. **Una banda por velocidad ignora la racha**, que es la tesis del producto.
   Con 12 km/h y rachas de 45, esa tabla diría ANDA mientras el hilo se corta.

Los rangos de Beaufort de `DESIGN.md` §9 quedan como referencia de calibración,
no como la regla que corre.

```ts
export function score(viento: number, racha: number, perfil: Perfil): number {
  const { centro, sigma, techoRacha } = PERFILES[perfil];
  const base = 100 * Math.exp(-((viento - centro) ** 2) / (2 * sigma ** 2));
  const pen = racha > techoRacha
    ? Math.min((racha - techoRacha) / techoRacha, 1) * 100
    : 0;
  return clamp(Math.round(base - pen), 0, 100);
}

export function banda(viento: number, racha: number, perfil: Perfil): BandaId {
  // seguridad primero: gana a cualquier cálculo
  if (viento >= VIENTO_PELIGRO || racha >= RACHA_PELIGRO) return "peligro";
  const q = score(viento, racha, perfil);
  const sopla = viento > PERFILES[perfil].centro;   // lado de la campana
  if (q >= CORTES.ideal)    return "ideal";
  if (q >= CORTES.marginal) return sopla ? "bravo" : "liviano";
  return sopla ? "bravo" : "plancha";
}
```

El lado de la campana desempata porque el score es simétrico: un 20 puede ser
plancha o temporal, y son veredictos opuestos. La velocidad y la racha absolutas
entran solo como reglas duras de seguridad, donde tienen que ganarle a cualquier
cálculo.

> Nota de la v1: su documentación decía 40/45/55 y su código usaba 60/70/65, con el perfil estándar como el más exigente de los tres, que es al revés de lo que dice el nombre. Aquí el orden es monótono a propósito: liviano exige más, acrobático menos. Los valores se afinan midiendo, y este archivo es el único que se toca para hacerlo.

### 2.2 `lib/score.ts` — portado de la v1, mismo modelo

```ts
export function score(viento: number, racha: number, perfil: Perfil): number
export function banda(viento: number, racha: number, perfil: Perfil): BandaId
```

La forma (una gaussiana sobre el viento medio, penalizada por la racha) se
conserva de la v1. **Todos sus números fueron reemplazados.** El detalle de qué
cambió y contra qué se verificó está en [`06-CALIBRACION.md`](06-CALIBRACION.md).

**El score es interno.** No cruza a ningún componente ni aparece en pantalla. Sirve para ordenar horas y decidir si una hora entra en una ventana. Lo que sale a la UI es la banda y el veredicto.

### 2.3 `lib/ventanas.ts` — una sola escala

La v1 tenía dos escalas de score (individual y de ventana, en unidades distintas) y una función de normalización para reconciliarlas. Se elimina la segunda.

```ts
type Ventana = {
  inicio: string;      // ISO
  fin: string;         // ISO
  banda: BandaId;      // la peor banda del tramo, no el promedio
  vientoMedio: number;
  rachaMax: number;
  brecha: number;      // rachaMax − vientoMedio
};

export function ventanas(horas: Hora[], perfil: Perfil): Ventana[]
// una ventana es un tramo continuo de horas cuya banda es "ideal".
// No hay umbral aparte: reutiliza banda() y por eso no puede desalinearse del veredicto.
export function ventanaActiva(vs: Ventana[], ahora: Date): Ventana | null
export function proximaVentana(vs: Ventana[], ahora: Date): Ventana | null
```

Cambios respecto de la v1:

- Una ventana se describe por **su peor banda**, no por un score promedio. Una hora mala dentro de un tramo lo arruina entero: promediarla la esconde.
- Se ordenan por **cercanía en el tiempo**, no por calidad. Una ventana excelente pasado mañana no compite con una buena en dos horas.
- Duración mínima: 1 hora. Los datos son horarios; hablar de ventanas de 30 minutos con datos de 60 es precisión inventada (la v1 lo hacía).

### 2.4 `lib/zonas.ts` — 6 zonas verificadas

Las celdas salieron de una llamada real a Open-Meteo con las 17 coordenadas de la v1 (30-ago-2026). No se inventan ni se recalculan a ojo:

| Celda `icon_seamless` | Centroide | Parques |
|---|---|---|
| -33,375 / -70,625 | -33,4107 / -70,6214 | Araucano, San Cristóbal, Bicentenario, De la Familia, Mahuidahue |
| -33,375 / -70,750 | -33,4261 / -70,7545 | La Hondonada |
| -33,500 / -70,625 | -33,4937 / -70,6502 | O'Higgins, Quinta Normal, Brasil, La Castrina, André Jarlán, La Bandera |
| -33,500 / -70,750 | -33,4809 / -70,6981 | Bernardo Leighton, Cerrillos |
| -33,500 / -70,500 | -33,4648 / -70,5472 | Peñalolén |
| -33,625 / -70,625 | -33,5728 / -70,6329 | Mapuhue, La Platina |

Las zonas cambian con el modelo: con `best_match` daban un agrupamiento distinto y con `ecmwf_ifs025` la ciudad entera colapsa en dos. **Estas son las de `icon_seamless`, el modelo elegido.** Si algún día se cambia de modelo, hay que recalcularlas: no son geografía, son la grilla del modelo.

**Los nombres se ponen al final, y no con cardinales.** La grilla corta la ciudad sin respetar el sentido común: el Parque de la Familia (Quinta Normal) cae en la misma celda que el Araucano (Las Condes), mientras el Parque Quinta Normal cae en otra. Ningún punto cardinal describe eso. Cada zona se nombra por los parques que contiene, en el lenguaje de la gente.

Cada zona se consulta por el **centroide de sus parques**, no por un parque cualquiera.

```ts
type Zona = { id: string; nombre: string; lat: number; lon: number; parques: Parque[] };
type Parque = { nombre: string; comuna: string; tamano: "grande"|"mediano"; advertencias?: string[] };
```

### 2.5 `lib/openmeteo.ts` — una llamada

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=<6 lats>&longitude=<6 lons>
  &hourly=wind_speed_10m,wind_gusts_10m,precipitation_probability
  &daily=sunset
  &forecast_days=2
  &timezone=America%2FSantiago
  &models=icon_seamless
```

Verificado el 30-ago-2026: devuelve un **array**, un objeto por coordenada, en el mismo orden. Dos zonas y dos días pesaron 4 KB.

Decisiones respaldadas por la prueba:

- **`precipitation_probability` se pide de verdad.** La v1 filtraba por lluvia con un campo que nunca solicitaba, así que el filtro estaba muerto.
- **`daily=sunset`** entra en la misma llamada y alimenta el "luz hasta las 18:23" del modo volar. Costo cero.
- **`models=icon_seamless`.** La primera versión de este plan eligió `gfs_seamless` mirando solo resolución espacial. Estaba mal: `gfs_seamless` devuelve **rachas menores que el viento medio en el 64% de las horas**, algo físicamente imposible, y la racha es la variable de la que depende todo el producto. ICON tiene 0% de inconsistencia y mantiene las 6 zonas. Ver [`06-CALIBRACION.md`](06-CALIBRACION.md) §3. Ninguno baja de ~11 km: no hay modelo de alta resolución para Chile, y por eso la unidad es la zona.
- **`timezone` fijo en `America/Santiago`**, no `auto`. La app es de Santiago y `auto` hace depender el parseo de horas de la IP del servidor.
- **Sin API key.** Open-Meteo no la exige para uso no comercial.

Cache: `fetch(url, { next: { revalidate: 600 } })`. Diez minutos. El modelo se actualiza cada una a seis horas, así que refrescar más seguido solo gasta.

```ts
export const getPronostico = cache(async (): Promise<Pronostico>)
```

Una sola función. La consumen el server component y la ruta `/api/pronostico`. La ruta existe únicamente porque el modo volar necesita refrescar desde el cliente.

**Degradación:** si Open-Meteo falla, `getPronostico` devuelve el último payload servido junto con su marca de tiempo. Nunca lanza hacia la UI. Una pantalla de error en la mano de alguien parado en un cerro es peor que un dato de hace 40 minutos.

---

## 3. Fases

### Fase 0 — Base (medio día)

- [ ] Vaciar el scaffold: `app/page.tsx` y `app/globals.css` al hueso.
- [ ] `.nvmrc` con `22`.
- [ ] Tokens de `DESIGN.md` §2-§4 como variables CSS en `globals.css`, dentro de `@theme` de Tailwind 4. Los primitivos no se usan en componentes: solo los semánticos.
- [ ] Fuentes Archivo y Chivo Mono vía `next/font/google`, subset `latin`, `display: swap`, **dos pesos como máximo**. Verificar el peso descargado.
  Ambas verificadas en Google Fonts el 30-ago-2026. Archivo necesita los dos ejes o responde 400:
  `family=Archivo:wdth,wght@62..125,100..900` y `family=Chivo+Mono:wght@100..900`.
- [ ] `<html lang="es-CL">`, viewport sin `user-scalable=no`, `theme-color` del papel.
- [ ] Sin dark mode. Que no exista es la decisión, no un pendiente.

**Se termina cuando:** una página en blanco con la tipografía correcta pasa `next build` y la fuente pesa lo que se esperaba.

### Fase 1 — Dominio puro (un día)

- [ ] `lib/bandas.ts`, `lib/score.ts`, `lib/ventanas.ts`, `lib/zonas.ts`.
- [ ] `test/score.test.ts`: la curva vale 100 en el centro de cada perfil, cae simétrica, la penalización por racha crece hasta anular el score, y los centros quedan ordenados (liviano < estándar < acrobático).
- [ ] `test/casos.test.ts`: los nueve casos de [`06-CALIBRACION.md`](06-CALIBRACION.md) §5.1, portados tal cual. Son el contrato del dominio y ya pasan en la implementación de referencia en Python.
- [ ] `test/banda.test.ts`, el caso que justifica todo el diseño: **18 km/h con rachas de 40 no puede dar "ideal"**. Además: 45 km/h siempre es "peligro" aunque el score diga otra cosa, y un score bajo con viento bajo da "plancha" mientras el mismo score con viento alto da "bravo".
- [ ] `test/ventanas.test.ts`: horas contiguas se agrupan, una hora mala parte el tramo, un tramo de una hora sobrevive y uno de cero no, la banda de la ventana es la peor y no el promedio.

**Se termina cuando:** `node --test` pasa en verde y no existe ni una línea de UI.

### Fase 2 — Datos (medio día)

- [ ] `lib/openmeteo.ts` con la llamada multi-coordenada y el cache.
- [ ] Tipos del payload derivados de una respuesta real guardada en `test/fixtures/`, no escritos a mano.
- [ ] `app/api/pronostico/route.ts` reexponiendo `getPronostico()`.
- [ ] Degradación con último payload conocido.

**Se termina cuando:** `curl localhost:3000/api/pronostico` devuelve las 6 zonas con sus horas ya puntuadas y sus ventanas resueltas.

### Fase 3 — Modo planear (dos días)

- [ ] `Veredicto.tsx`: palabra, dos velocidades, zona y hora. Si ahora no anda, la línea de la próxima ventana.
- [ ] `Cola.tsx`: 12 horas apiladas, ancho ∝ racha, color de banda. Expandir en el lugar, sin modal.
- [ ] `Brecha.tsx`: dos barras enfrentadas, frase traducida, los tres perfiles en línea.
- [ ] `Seguridad.tsx`: tendidos, Ley 20.700, parques de la zona con sus advertencias.
- [ ] Selector de zona: 6 opciones, guardado en `localStorage`, con la nota de resolución del modelo.
- [ ] Botón `VOY` anclado.

**Se termina cuando:** se ve en un teléfono real, al sol, y se entiende sin leer.

### Fase 4 — Modo volar (un día)

- [ ] `app/volar/page.tsx` con el dato inicial ya renderizado en el servidor.
- [ ] `Vivo.tsx`: refresco cada 10 min, tendencia a 60 min, cuenta regresiva de ventana, `navigator.vibrate` al cambiar de banda.
- [ ] Persistencia del último pronóstico en `localStorage` y lectura al arrancar.
- [ ] Estado sin señal: último dato con su hora, jamás un spinner ni una pantalla vacía.
- [ ] `.ics` de la ventana buena (reemplaza las notificaciones de la v1).
- [ ] Autodetección de zona por geolocalización, que **solo sugiere** el modo.

**Se termina cuando:** en modo avión sigue mostrando el último dato con su hora de medición.

### Fase 5 — Cierre (un día)

- [ ] Contraste 7:1 en texto primario sobre **cada una de las cinco bandas**, medido, no estimado.
- [ ] Foco visible en todo lo enfocable. `prefers-reduced-motion` respetado.
- [ ] Presupuestos verificados con `next build`. Si se pasa, se corta.
- [ ] Lighthouse móvil con throttling de 3G.
- [ ] `/anti-slop` modo CORREGIR: auditar el código **y mirar el render servido en móvil**.
- [ ] Calibrar `bandas.ts` con una salida real a un cerro: anotar qué decía la app y qué pasó de verdad.
- [ ] Validar `icon_seamless` contra observación real de una estación de la Dirección Meteorológica de Chile. Método en [`06-CALIBRACION.md`](06-CALIBRACION.md) §6.

---

## 4. Riesgos

| Riesgo | Señal | Qué se hace |
|---|---|---|
| Las bandas no calzan con la realidad | El veredicto dice ANDA y el volantín se queda quieto | Es lo esperable en v1. Se ajusta `bandas.ts` con salidas reales, y por eso los umbrales viven en un solo archivo |
| Next no cabe en el presupuesto de JS | `next build` reporta más de 120 KB | Server components más agresivos. Si con dos islas no cabe, la app no necesita un framework y se evalúa Vite |
| Las 6 zonas no calzan con el lenguaje real | Los nombres suenan raros al leerlos | Nombrar por los parques que contiene, no por cardinales forzados |
| Vibración inconsistente entre navegadores | `navigator.vibrate` es no-op en iOS Safari | El cambio de color y el texto son el aviso primario; la vibración es un extra que se pierde sin consecuencia |
| El proyecto vuelve a crecer sin freno | Aparece una tercera isla cliente, o una dependencia | La sección §6.5 de `02-PRODUCTO.md` es la lista de lo que ya se decidió no hacer |
