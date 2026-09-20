# Arquitectura de datos meteorológicos

Escrito el 20 de septiembre de 2026, contra el commit `93cecec`. Acompaña a
[`14-NOCHE-GPS-VIENTO.md`](14-NOCHE-GPS-VIENTO.md): ese dice qué construir, este
dice sobre qué apoyarlo. Todo lo de acá está verificado contra documentación
oficial o contra las APIs en vivo; donde no se pudo verificar, lo dice.

## Los tres problemas de hoy

1. **El consumo crece con el tráfico.** `open-next.config.ts` es
   `defineCloudflareConfig()` pelado, sin caché incremental, así que el
   `next: { revalidate: 600 }` de `lib/openmeteo.ts` no persiste entre
   invocaciones del Worker. Cada visita puede pegarle a Open-Meteo. El día que
   Encumbra importe de verdad (un 18 de septiembre con viento bueno) es el día
   en que se puede quedar sin cuota.
2. **El estado `desactualizado` no funciona en producción.**
   `crearCargadorPronostico` guarda el último éxito en `let ultimoExito`, una
   variable de módulo. En Node el proceso vive y funciona; en Workers cada
   isolate es efímero y hay muchos en paralelo, así que esa variable casi
   siempre está vacía cuando se la necesita. El día que Open-Meteo se caiga, la
   mayoría verá `sin-datos` en vez del último dato bueno. El diseño de producto
   es correcto; le falta un lugar donde vivir.
3. **No hay segunda fuente.** Open-Meteo no garantiza uptime y su API gratuita
   es solo para uso no comercial.

## La decisión de fondo: precalcular, no consultar

**Cron Trigger cada 10 minutos escribe el pronóstico en KV. La app solo lee.**
Ningún fetch externo en el camino del usuario.

```
Cron (*/10)  ──>  agrupa lugares por celda  ──>  Open-Meteo  ──>  KV (1 clave JSON)
                                                     │ falla
                                                     └──────────>  no sobrescribe
Petición del usuario  ──>  KV.get  ──>  render      (el dato anterior sigue ahí)
```

Lo que resuelve, de una vez:

| | Hoy | Con cron + KV |
|---|---|---|
| Cuota externa | proporcional al tráfico | fija, 144 refrescos/día |
| Latencia | la visita espera a Open-Meteo | una lectura de KV |
| `desactualizado` | variable de isolate, ilusoria | el último dato bueno vive en KV |
| Punto GPS del usuario | una llamada nueva cada vez | si cae en celda conocida, sale gratis |

Mil visitas simultáneas cuestan exactamente lo mismo que una: cero llamadas
externas. Esa es toda la idea.

### La unidad es la celda, no el parque

Open-Meteo **cobra por ubicación, no por petición**: pedir 35 coordenadas en una
sola llamada cuenta como 35. La fórmula está en su código fuente,
`max(1, weight)` sumado por ubicación
([ForecastApiResult.swift](https://github.com/open-meteo/open-meteo/blob/main/Sources/App/Helper/Writer/ForecastApiResult.swift),
y el autor lo confirma en [el issue 438](https://github.com/open-meteo/open-meteo/issues/438#issuecomment-1722945326)).
Agrupar coordenadas ahorra latencia y conexiones, no cuota.

Pero la grilla que el API entrega en Santiago se pega a múltiplos de **0,125°**
(celdas de ~12 × 14 km), no a los 0,1° que dice la documentación. Medido contra
el servicio en vivo. Y dos puntos a 2 km caen en la misma celda casi siempre.

De ahí sale la regla: **cada lugar se redondea a la grilla de 0,125° y se pide
una vez por celda.** Las seis zonas escritas a mano en `lib/zonas.ts` caen hoy
en seis celdas distintas, una cada una: la agrupación intuitiva ya coincidía con
la grilla del modelo. Así que `lib/zonas.ts` deja de mantenerse a mano y pasa a
calcularse desde las coordenadas de los lugares:

```ts
const celda = (v: number) => Math.round(v / 0.125) * 0.125;
```

Consecuencia: agregar veinte volantinódromos suma pocas celdas, no veinte. Y el
punto GPS del usuario, redondeado a la misma grilla, casi siempre cae en una
celda ya precalculada y no cuesta ninguna llamada.

Lo que hay que decir en la UI, porque es verdad y ya se dice a medias: dos
lugares en la misma celda comparten pronóstico exacto. La guía ya lo admite
("Varios parques comparten los mismos datos"). Lo que desaparece es la ilusión
de que un volantinódromo en Maipú tendrá un dato distinto al de un parque a 5 km.

### Los números

Con N celdas (hoy 6, con los volantinódromos del Gran Santiago unas pocas más):

| Límite | Tope | Consumo con N=8 |
|---|---|---|
| Open-Meteo día | 10.000 | 144 × 8 = **1.152** |
| Open-Meteo mes | 300.000 | ~34.560 |
| KV escrituras/día (free) | 1.000 | **144** (una sola clave JSON) |
| Workers requests/día (free) | 100.000 | según tráfico, sin fetch externo |
| Cron Triggers (free) | 5 por cuenta | **1** |

Una sola clave con todas las celdas adentro: el valor de KV admite hasta 25 MiB
y el payload completo son kilobytes. Es también lo que mantiene las escrituras
en 144 y no en 144 × N.

## Las fuentes

### Primaria: Open-Meteo

Se queda. Modelo `icon_seamless`, que en Sudamérica es en la práctica ICON
Global (ICON-EU e ICON-D2 solo cubren Europa). Da lo que el dominio necesita,
`wind_gusts_10m` incluido, y acepta listas de coordenadas.
Límites gratuitos: 600/min, 5.000/hora, 10.000/día, 300.000/mes, uso no
comercial, datos CC BY 4.0 ([pricing](https://open-meteo.com/en/pricing),
[licencia](https://open-meteo.com/en/licence)).

Mejora barata e independiente del fallback: se puede forzar el modelo
(`models=ecmwf_ifs025`, `gfs_seamless`). Eso da diversidad de **modelo** sin
cambiar de proveedor y sin perder las rachas. No cubre que se caiga Open-Meteo
entero, pero sí cubre que un modelo puntual entregue basura, que es más
frecuente.

### Respaldo: WeatherAPI.com, y Bright Sky detrás

**La variable que decide es la racha.** Encumbra no decide con viento medio:
decide con viento *y* racha, y la racha es la que revienta la estructura. Una
fuente sin rachas no es un respaldo, es un modo degradado. Con esa vara se
revisaron nueve proveedores gratuitos.

**MET Norway queda descartado**, y no por sus términos, que son cómodos (gratis,
sin API key, solo exige `User-Agent` identificable con contacto). Queda fuera
porque `wind_speed_of_gust` **no existe en su pronóstico global**, y Chile está
en el pronóstico global. Verificado paso por paso en los 91 timesteps de
Santiago y contrastado con Oslo, donde sí aparece. Su
[data model](https://api.met.no/doc/locationforecast/datamodel) trae tablas
separadas para la región nórdica y para el resto del mundo; la global no las
lista.

También quedan fuera, con razón nombrada: **Tomorrow.io** y **Weatherbit**
prohíben el uso comercial de forma explícita (Weatherbit además no da horario en
su plan gratuito); **Meteosource** gratuito no trae racha ni probabilidad de
lluvia; **OpenWeather One Call** exige tarjeta de crédito y su 3.0 ya está
marcado como deprecado; **Visual Crossing** es técnicamente el más completo pero
su tabla de precios dice que el free permite uso comercial y sus términos de
septiembre de 2026 lo acotan a clientes pagados, una contradicción entre dos
fuentes oficiales que no se puede resolver desde afuera.

Quedan tres limpios, y conviene usarlos en este orden:

**1. WeatherAPI.com** — 100.000 llamadas al mes, sin tarjeta, y es el único que
**permite uso comercial de forma explícita** en sus términos: *"for your
personal or commercial use, including making the data in the API available in
online and/or mobile applications/services"*. Trae `gust_kph`, `wind_degree` y
`chance_of_rain` en el pronóstico horario, por coordenada real
([pricing](https://www.weatherapi.com/pricing.aspx),
[términos](https://www.weatherapi.com/terms.aspx)).
Dos obligaciones suyas que hay que cumplir y que el diseño ya cumple: atribución
visible, y caché de máximo 60 minutos para condiciones actuales (el cron de 10
minutos está muy por dentro). Su pronóstico gratuito llega a 3 días; la app pide
2, así que sobra.

**2. Bright Sky** — el hallazgo inesperado. Se asume que es solo alemán y **no lo
es**: su documentación dice que *"the forecasts cover the whole world, albeit at
a much lower density outside of Germany"*, y comprobado en vivo el 20 de
septiembre de 2026, `sources?lat=-33.45&lon=-70.66` devuelve la estación MOSMIX
**"SANTIAGO" (WMO 85577)** a 2,9 km y "PUDAHUEL" (85574), con ~10 días de
pronóstico horario y `wind_gust_speed` y `precipitation_probability` poblados.
Sin API key, sin registro, sin cuota publicada, datos del DWD bajo CC BY 4.0
([docs](https://brightsky.dev/docs/)).

Su límite es espacial, y hay que decirlo: en Chile son **dos estaciones MOSMIX
puntuales**, no una grilla. Todo Santiago compartiría un pronóstico. Para un
respaldo de emergencia sirve; para la operación normal, no. Por eso va tercero y
no primero, pese a ser el más cómodo de operar.

Lo que lo hace valioso igual: **no depende de ninguna credencial**. Si el
respaldo con key falla por una cuenta vencida, una key rotada o un correo no
leído, Bright Sky sigue respondiendo. Es la red bajo la red.

**3. Pirate Weather** queda como alternativa, no como elección: 10.000 llamadas
al mes, y su plan gratuito se describe como "personal use", que no es una
prohibición pero sí una señal. Trae `windGust` y `windBearing` horarios y para
Santiago se apoya en ECMWF IFS con GFS detrás
([data blocks](https://docs.pirateweather.net/en/latest/API/data-blocks/)).

> **Nota que importa a futuro:** Open-Meteo **no permite uso comercial** en su
> plan gratuito. Si Encumbra alguna vez deja de ser un proyecto personal, la
> fuente primaria hay que revisarla. WeatherAPI y Bright Sky sí lo permiten, así
> que el camino de salida existe y está documentado acá.

### El hallazgo: la DMC mide de verdad

`PRODUCT.md` ya tiene escrito este principio: *"No confundir un pronóstico con
una medición en terreno."* Resulta que hay una fuente de medición en terreno.

La Dirección Meteorológica de Chile publica el servicio `getDatosRecientesEma`,
con datos minutales de las últimas 12 horas y actualización cada 15 minutos,
que incluye viento instantáneo con dirección, promedios de 2 y 10 minutos y
**racha máxima medida**. Dos estaciones en Santiago, confirmadas por
coordenadas: **330020 Quinta Normal** (-33,445, -70,67778) y **330021 Pudahuel**
(-33,37833, -70,79639). La ficha de Quinta Normal lista viento a 10 metros, que
es exactamente la altura del modelo.

Eso no es un respaldo, es una **capa distinta**: deja de ser "el modelo dice" y
pasa a ser "en Quinta Normal están midiendo esto ahora". Para una app que se
usa parada en el pasto, vale más que un tercer proveedor de pronóstico. Y
permite algo que ninguna otra fuente permite: contrastar cuánto se equivoca el
modelo en la cuenca de Santiago, que es terreno complejo donde una grilla de
kilómetros suaviza los vientos locales.

Condiciones: registro gratuito obligatorio en el Portal de Servicios Climáticos;
sin credenciales el servicio responde 200 con un mensaje de bloqueo. Las
credenciales van como `usuario` y `token` **en el query string**, así que el
token queda en logs de proxies: variable de entorno, nunca en el cliente.
El portal declara los datos de acceso y uso público y pide citar a la DMC
([acerca de](https://climatologia.meteochile.gob.cl/application/index/acercaDe)).
El uso comercial es ambiguo y no está resuelto por escrito; si llega a importar,
se pregunta a `portalserviciosclimaticos@meteochile.gob.cl`.

Sin verificar: si el modelo WRF de la DMC (pronóstico horario a 5 días por
estación) entrega rachas. Su documentación menciona componentes y dirección del
viento, y no dice nada de rachas. El endpoint exige cuenta, así que no se pudo
confirmar ni descartar.

### El sol se calcula, no se pide

Salida y puesta de sol son efemérides determinísticas: latitud, longitud y
fecha. Hoy vienen de Open-Meteo, lo que significa que si la fuente se cae, la
app pierde también el dato de luz, que es el que estructura la jornada. Unas
decenas de líneas de lógica pura en `lib/` lo resuelven sin red, sin cuota y sin
depender de nadie. Encaja con la arquitectura que ya existe (`lib/` no toca el
DOM y se testea con `node --test`) y elimina una dependencia de la ruta crítica.

## Degradación explícita, no silenciosa

El orden importa, y cada escalón se dice en pantalla:

1. **Normal**: KV fresco, Open-Meteo. Nada que decir.
2. **KV vencido, refresco falló**: se sirve el último dato bueno con su hora.
   Es el `desactualizado` que ya existe en el tipo `Pronostico`, por fin real.
3. **Caída larga**: el cron cambia a WeatherAPI.com. Mismas variables, incluida
   la racha, y por coordenada real, así que el veredicto sigue siendo legítimo.
   Se nombra la fuente en pantalla.
3b. **Sin credenciales o WeatherAPI también caído**: Bright Sky, que no pide
   key. Acá sí hay degradación que avisar: en Chile son dos estaciones MOSMIX,
   o sea un solo pronóstico para todo Santiago.
4. **Sin ninguna fuente**: `sin-datos`. La app **no opina**.

La regla que vale para todo el escalón 4, y que conviene dejar escrita porque es
la tentación clásica: **no mostrar un veredicto calculado sin rachas**. Un
semáforo verde sin la variable que detecta el peligro se ve idéntico a uno
bueno, y ahí es donde alguien sale con el volantín. Es la misma regla que rige
los permisos de parque en el documento 14: la app afirma solo lo que sabe.

## Seguridad

- **La ruta pública de punto GPS es la única superficie nueva.** Validar que
  `lat` y `lon` sean números finitos en rango y rechazar con 400. Sin eso es un
  proxy gratuito hacia una API con cuota ajena, con el dominio de Kath en los
  logs del proveedor.
- Redondear a la grilla antes de consultar no es solo ahorro: acota el espacio
  de claves y evita que alguien genere infinitas consultas distintas.
- Con el pronóstico precalculado en KV, el rate limiting deja de proteger la
  cuota meteorológica y pasa a proteger el Worker (100.000 requests/día en
  free). Orden sensato: cron + KV primero, el binding `RateLimit` por IP si
  aparece abuso, y la regla WAF gratuita como red mínima. En el plan Free el WAF
  da **una** regla, solo por IP y con ventana de 10 segundos: frena un bucle
  tonto, no un scraper paciente.
- Los tokens de la DMC y de Pirate Weather van en variables de entorno del
  Worker. Nunca en el cliente, nunca en el repo.
- Atribución: Open-Meteo ya está citada en la app. Si entran Pirate Weather o la
  DMC, se suman al mismo pie.

## Lo que NO se hace

- **No migrar a vinext.** Cloudflare ahora lo recomienda por sobre OpenNext para
  proyectos nuevos, y deja la guía de OpenNext para mantener apps existentes
  ([framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)).
  OpenNext no está deprecado ni roto, vinext está en beta, y el problema de esta
  app se resuelve sin tocar el adapter. Queda anotado para dentro de un año.
- **No configurar `r2IncrementalCache` + `doQueue` + `tagCache`.** Es la
  respuesta correcta a otra pregunta: que el ISR de Next funcione en general,
  para muchas rutas. Acá hay un dato que se refresca en intervalo fijo, y el
  cron lo resuelve con menos piezas y con la cuota externa acotada por diseño en
  vez de por suerte del caché.
- **No usar la Cache API como protección de cuota.** Es local a cada centro de
  datos y Cloudflare tiene más de 300: un caché por colo significa hasta un
  fetch externo por colo por ventana, más los misses por evicción. Y no colapsa
  peticiones concurrentes. Baja las llamadas, no las acota.
- **No usar KV para el caché incremental de Next.** La propia documentación de
  OpenNext lo desaconseja por ser eventualmente consistente. Acá KV se usa para
  otra cosa: un valor propio que tolera 60 segundos de desfase en un dato que
  cambia cada 10 minutos.
- **No tres proveedores de pronóstico.** Uno primario, uno de respaldo con las
  mismas variables, y una fuente de medición real que es otra cosa. Un tercer
  pronóstico agrega mantención y no agrega certeza.

## Orden de trabajo

1. Cron + KV con el pronóstico actual. Resuelve cuota, latencia y el
   `desactualizado` que hoy es ilusorio. Nada de esto se ve en pantalla.
2. Celdas calculadas desde las coordenadas; `lib/zonas.ts` deja de escribirse a
   mano. Habilita el catálogo grande y el punto GPS.
3. Sol calculado localmente. Saca de la ruta crítica el dato que estructura la
   jornada.
4. WeatherAPI.com como respaldo del cron, detrás de una interfaz común de
   proveedor (`{ viento, racha, direccion, nubosidad, probabilidadLluvia }`, que
   es lo que `HoraPronostico` ya define). Bright Sky como último recurso sin
   credenciales: el mismo adaptador, otra implementación.
5. DMC como capa de medición observada. Es producto nuevo, no infraestructura:
   va cuando lo anterior esté firme.

## Pendiente de verificar antes de ejecutar

- En qué plan está el Worker hoy. El plan gratuito da **10 ms de CPU por
  invocación**, y el SSR de Next no siempre cabe ahí. Es CPU, no espera de red.
- Si Bright Sky tiene una cuota no publicada. No la documentan, y construir un
  respaldo sobre un límite desconocido conviene hacerlo sabiéndolo.
- Si el modelo WRF de la DMC entrega rachas (exige crear la cuenta).
- Si el binding `RateLimit` de Workers está disponible en el plan gratuito: no
  está documentado.
