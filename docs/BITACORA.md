# Bitácora técnica y de producto de Encumbra

Última consolidación: 20 de septiembre de 2026. Esta es la fuente histórica
única del proyecto. Reemplaza los antiguos documentos numerados de análisis,
planes, prompts y revisiones.

Su objetivo es evitar dos errores: perder el razonamiento que llevó a la
implementación actual y volver a discutir como si fueran nuevas decisiones que
ya fueron investigadas, probadas o descartadas.

## Cómo leer y mantener esta bitácora

- El comportamiento ejecutable vive en el código y sus pruebas. Si este texto
  discrepa con una prueba vigente, investigar la discrepancia antes de cambiar
  cualquiera de los dos.
- `PRODUCT.md` resume el contrato funcional actual y `DESIGN.md` el visual.
  Esta bitácora explica su historia y sus motivos.
- Una decisión nueva que sustituya otra debe registrar fecha, evidencia,
  alcance exacto y qué decisión anterior reemplaza.
- Lo no verificado se escribe como pendiente. Nunca se completa por intuición.
- Los umbrales meteorológicos solo se cambian en `lib/bandas.ts`, acompañados
  de pruebas y evidencia de calibración.

## 1. Qué es Encumbra

Encumbra responde para Santiago: **¿anda el volantín, cuándo y dónde?** No es
una app meteorológica general. Convierte viento medio, rachas, lluvia, luz y
tipo de volantín en una decisión comprensible.

Las rutas vigentes son:

- `/`: portada y acceso a la experiencia.
- `/app`: explorar parques, revisar una salida y prepararse.
- `/volar`: lectura de terreno, grande y de rápida consulta.
- `/api/pronostico`: último pronóstico persistido.
- `/api/calendario`: exportación validada de una ventana diurna.

Principios que no se negocian sin evidencia nueva:

1. La decisión va antes que la explicación técnica.
2. Pronóstico no significa medición en terreno.
3. Dos parques en una misma celda de ICON comparten el mismo viento; nunca se
   afirma una diferencia que el modelo no puede resolver.
4. El score de 0 a 100 es interno y nunca llega a la interfaz.
5. Sin rachas no se emite un veredicto de vuelo.
6. El viento no autoriza un recinto ni certifica que sea seguro.
7. Ausencia en una lista de permisos no equivale a prohibición.
8. La ubicación se solicita por una acción explícita, no se persiste y no se
   presenta con más precisión que la disponible.

## 2. Por qué se descartó la v1

La v1 aportó la idea del score, los perfiles y el catálogo inicial, pero no era
una base adecuada para evolucionar:

- era desktop-first y la tarea real ocurre en teléfono y al aire libre;
- concentraba cerca de 1.375 líneas en un componente principal;
- mostraba tablas y porcentajes antes que una decisión;
- comparaba parques como si tuvieran pronósticos distintos cuando varios caían
  en la misma celda meteorológica;
- su score estaba centrado demasiado arriba para el viento habitual de
  Santiago y decía que no casi siempre;
- penalizaba por gust factor desde valores que casi todo Santiago supera por la
  incompatibilidad entre racha instantánea y promedio horario.

Se rescató la tesis: la relación entre viento medio y racha importa más que un
widget de clima. No se copiaron su UX, su arquitectura ni sus afirmaciones
geográficas.

## 3. Calibración del dominio

### Evidencia usada

- Rangos de vuelo de la
  [American Kitefliers Association](https://www.kite.org/about-kites/how-to-fly-a-kite/).
- Open-Meteo Historical Weather API, reanálisis ERA5, Parque O'Higgins,
  2021–2025, datos horarios.
- Consistencia física de rachas en los modelos disponibles de Open-Meteo.

El script reproducible es `calibracion/calibrar.py`. Usa solo la biblioteca
estándar de Python.

### Hallazgos que cambiaron el modelo

- En tardes de septiembre, la mediana observada fue 8,4 km/h, el percentil 95
  14,4 km/h y el máximo del período 25 km/h. Centrar el perfil estándar en
  19 km/h hacía que el producto negara casi todas las tardes útiles.
- El gust factor observado fue aproximadamente 2–4 porque compara una racha
  instantánea con una media horaria. Los cortes 1,30–1,60 de la v1 no
  discriminaban nada. Se reemplazó por racha absoluta.
- `gfs_seamless` entregó rachas menores que el viento medio en 64,2 % de las
  horas revisadas. No se usa para Encumbra.
- `icon_seamless` conservó consistencia física y seis celdas diferentes para
  Santiago; ECMWF a 0,25° reducía la ciudad a dos.

### Única fuente de umbrales

```text
perfil       centro   sigma   techo de racha
liviano      12       5       22 km/h
estándar     14       5,5     28 km/h
acrobático   20       7       38 km/h

corte duro: viento >= 45 km/h o racha >= 45 km/h
score ideal: >= 65
score marginal: >= 40
```

El score es una campana gaussiana por perfil menos una penalización de racha.
La banda distingue `plancha`, `liviano`, `ideal`, `bravo` y `peligro` según el
score y el lado de la campana. Los nueve casos contractuales están en
`test/casos.test.ts` y coinciden con la referencia Python.

### Qué todavía no demuestra la calibración

- Los centros para el volantín chileno siguen siendo una inferencia apoyada en
  datos locales y rangos de cometas, no una medición controlada del volantín.
- ERA5 es reanálisis, no una estación en terreno, y puede suavizar extremos.
- ICON fue elegido por consistencia física, no por precisión demostrada contra
  observaciones de la DMC.
- Los cortes 65 y 40 se eligieron para producir una clasificación útil. Son la
  primera perilla a revisar después de acumular observaciones reales.

Antes de recalibrar hay que registrar intentos reales sin mover umbrales durante
la sesión y comparar ICON con la estación DMC Quinta Normal 330020, alineando
horas UTC y calculando sesgo y error absoluto por separado para viento y racha.

## 4. Arquitectura meteorológica vigente

### Flujo productivo

```text
Cron */10 -> Open-Meteo icon_seamless -> valida y normaliza -> una clave KV
Visita     -> Workers KV               -> Server Component -> interfaz
```

- `custom-worker.ts` reutiliza el handler generado por OpenNext y agrega
  `scheduled`.
- El binding `PRONOSTICO` guarda `pronostico:santiago:v1` como un único JSON.
- Un fallo del proveedor no sobrescribe el último éxito.
- Hasta 20 minutos el dato es `actual`; después es `desactualizado`. Un valor
  inválido se degrada a `sin-datos` sin lanzar a la interfaz.
- En Cloudflare, una visita nunca funciona como proxy hacia Open-Meteo.
- `next dev` y `next start` consultan directo porque no tienen bindings de
  Workers. Esa excepción existe solo para desarrollo local.
- Amanecer y puesta se calculan en `lib/solar.ts` con fecha y coordenadas; no
  dependen de la respuesta diaria del proveedor.

Esta arquitectura reemplazó `fetch(..., { next: { revalidate: 600 } })` como
mecanismo de persistencia. En Workers, el caché de Next y una variable de módulo
no garantizan compartir el último éxito entre isolates.

### Zonas y ubicación

La unidad meteorológica es la celda efectiva de ICON, no el parque. La API
devuelve en Santiago una grilla cercana a múltiplos de 0,125°, de unos 12 ×
14 km. `lib/zonas.ts` conserva seis consultas verificadas y las nombra por los
parques que contienen, nunca por puntos cardinales engañosos.

«Ver si anda donde estoy» compara la coordenada del navegador con esas celdas y
muestra la más cercana. La interfaz dice exactamente eso. No existe `/api/punto`
ni una consulta arbitraria por usuario: se prefirió precisión declarada y costo
acotado a fingir un pronóstico exacto.

### Fuentes y fallback

La única fuente activa es Open-Meteo con `icon_seamless`. Su oferta gratuita es
para uso no comercial; si Encumbra se monetiza, hay que revisar el plan antes,
no después.

No hay fallback activo porque un campo llamado «racha» no demuestra equivalencia
de altura, intervalo, resolución o sesgo con ICON. Antes de dejar que otra
fuente emita una banda debe pasar validación de unidades, zona horaria, nulos,
coherencia temporal y comparación solapada contra ICON.

- WeatherAPI es el candidato de respaldo, pero requiere clave y recalibración.
- Bright Sky no publica cuota y en Chile tiene resolución espacial demasiado
  gruesa para una banda indistinguible de la normal.
- DMC requiere usuario y token; sería una capa observada, no un pronóstico de
  reemplazo.
- Pirate Weather no se usa.

## 5. Parques, permisos y seguridad

El catálogo productivo tiene 24 puntos que representan 14 recintos autorizados
y cinco parques buscables con autorización sin confirmar. Mapocho Río aparece
en seis tramos para el mapa, pero comparte `recintoId` y cuenta como un recinto.

La elección manual incluye los parques sin permiso confirmado, como Araucano.
El usuario necesita consultar y preparar una salida a un lugar que ya eligió.
«Explorar todos los parques», el mapa, «Cercanos» y «Guardados» consultan todo
el catálogo, igual que la búsqueda. Solo las recomendaciones iniciales de
«Para ti» se restringen a autorización respaldada. Antes, ese filtro también
ocultaba parques guardados: se corrigió al separar exploración y recomendación.
La observación del usuario de que hay gente encumbrando en Araucano no se
registró como autorización; conserva `sin-confirmar` y el aviso en Mi salida.

El modelo separa:

- `tipoLugar`: qué clase de lugar es;
- `permiso`: `autorizado` o `sin-confirmar`;
- `precision`: recinto o referencia;
- evidencia: autoridad, fuente, publicación si se conoce, verificación,
  vigencia y alcance;
- riesgo vial: texto y evidencia estructurada aparte.

La fuente de Parquemet quedó con vigencia `pendiente-de-confirmar` porque la
fecha exacta del enlace social no pudo verificarse de forma fiable. La app dice
«incluido en el listado consultado» y pide confirmar vigencia y horarios; no lo
presenta como permiso permanente.

La Bandera conserva la advertencia oficial del MOP publicada el 8 de septiembre
de 2024: Vespucio Sur es un punto crítico. La advertencia tiene enlace y año en
la UI; no vive solo como copy imposible de auditar.

Los volantinódromos comunitarios no se publicaron. La fuente disponible decía
explícitamente que eran encuentros espontáneos, no lugares autorizados, y varias
coordenadas eran esquinas o referencias imprecisas. Para incorporarlos se
requiere una capa separada, texto de no autorización, `precision: referencia`,
dirección humana, fuente y confianza. Nunca un pin exacto inventado.

Reglas de seguridad permanentes:

- no usar hilo curado, prohibido por la Ley 20.700;
- mantenerse lejos de cables, calles y autopistas;
- no perseguir un volantín cortado cruzando una vía;
- la meteorología no confirma acceso, iluminación, obstáculos ni horario;
- una checklist ayuda a prepararse, pero no certifica seguridad.

## 6. Decisiones de experiencia

### De página larga a app móvil

El primer rediseño seguía siendo una página larga. Se descartó después de
feedback explícito. `/app` pasó a tres destinos persistentes:

- Parques: lista, búsqueda, favoritos, ubicación y mapa.
- Mi salida: parque o ubicación actual, día, hora, viento, rachas, lluvia, luz
  y calendario.
- Prepararme: tipo de volantín y cuidados.

En móvil hay navegación inferior; en escritorio, rail lateral. El mapa es una
ayuda, no el único acceso: si falla, la lista sigue operativa.

### Tipos de volantín

Los perfiles `liviano`, `estandar` y `acrobatico` mueven el centro, sigma y
tolerancia a racha. No son skins. La selección recalcula bandas y ventanas.
Las ilustraciones reflejan papel sin cola, tradicional con cola y acrobático de
dos hilos, respectivamente.

### Noche

La regla inicial «sin dark mode» fue sustituida el 20 de septiembre de 2026.
La consulta nocturna es un caso real. La interfaz parte del tema del sistema y
permite elegir claro u oscuro; la elección se guarda como
`encumbra:tema`. El oscuro azul de la primera implementación fue rechazado y se
reemplazó por carbón cálido con superficies neutras. La falta de luz es una
condición separada del viento: no borra el veredicto, pero advierte usar solo
lugares conocidos e iluminados, lejos de cables y calles. Esto no recomienda
encumbrar de noche ni concede acceso.

Por indicación del usuario se retiró el selector de tema de `/volar`: no aporta
a la consulta en terreno y ocupa espacio en la cabecera. El control permanece
en las otras vistas y la preferencia guardada se conserva. La paleta de vuelo
sigue respondiendo al viento y a la luz.

### Ubicación como salida

El 20 de septiembre de 2026 «Donde estoy» dejó de ser solo una consulta en
Parques y pasó a ser un destino de Mi salida. `lib/salida.ts` calcula una
lectura propia desde la celda ICON más cercana, con el mismo perfil, día, luz y
ventanas que un parque, pero sin campos de permiso ni recinto. Por eso la UI:

- no exige seleccionar parque;
- no muestra «Cómo llegar»;
- explica que el pronóstico es de la celda más cercana;
- no afirma que la coordenada sea abierta, segura o autorizada;
- no persiste la coordenada y vuelve a solicitarla tras recargar;
- conserva la zona al entrar a `/volar`, sin inventar un parque de retorno.

### Dirección del viento

La dirección se expresa como procedencia en español chileno, por ejemplo «viene
del poniente». Desde el 20 de septiembre de 2026, `/volar` muestra también el
destino («va hacia el oriente») y una rosa compacta: el punto amarillo es la
procedencia y la flecha apunta hacia donde se mueve el aire. Texto y dibujo
explican ambas perspectivas para evitar la ambigüedad habitual.

La rosa funciona con norte arriba sin permisos. Solo al tocar «Orientarme para
despegar» solicita orientación absoluta; no guarda ni envía el rumbo. Safari se
lee mediante `webkitCompassHeading` y los navegadores que implementan el evento
estándar mediante `360 - alpha`. Las lecturas relativas se descartan porque
parecen plausibles pero no señalan el norte. Si falta sensor, permiso o lectura,
se conserva el fallback y se dice por qué. La orientación es aproximada y puede
verse afectada por imanes o estructuras metálicas; no se presenta como
instrumento de navegación ni como medición del viento en terreno.

La guía de despegue se corrigió a partir de la técnica documentada por la
[American Kitefliers Association](https://www.kite.org/about-kites/how-to-fly-a-kite/)
y el [manual de Prism Kites](https://prismkites.com/pages/pocket-flyer-manual):
quien vuela queda a barlovento, de espaldas al viento, y el volantín se ubica a
sotavento, delante. La ayuda es opcional: AKA y Prism también describen el
despegue desde la propia mano o con el volantín apoyado más adelante. `/volar`
traduce la geometría estable a `Tú → Volantín`; no transforma a la persona que
ayuda en requisito ni añade un selector. La parte superior del teléfono apunta
al lugar del volantín. En una línea, se deja que el viento lo tome o se suelta
sin lanzarlo; en multilínea, se prepara al centro de la ventana, se da un paso
atrás y se tiran ambos mandos, como documentan AKA y el
[manual Synapse de Prism](https://prismkites.com/pages/synapse-manual).

La implementación móvil sigue las fuentes de cada plataforma. En iPhone usa
`webkitCompassHeading`, el rumbo real indicado por
[Apple](https://developer.apple.com/documentation/webkitjs/deviceorientationevent),
y rechaza `webkitCompassAccuracy === -1`, que Apple define como brújula sin
calibrar. En Android escucha `deviceorientationabsolute` y calcula el rumbo
estándar con el teléfono plano. El permiso se solicita tras tocar el botón y
con acceso absoluto al magnetómetro, de acuerdo con
[W3C](https://www.w3.org/TR/orientation-event/) y
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static).
Las lecturas se suavizan cruzando norte sin dar una vuelta visual completa.
Además, el rumbo se corrige con `screen.orientation.angle` para que la mira sea
la parte superior visible en vertical u horizontal, como establece el sistema
de coordenadas de la [Screen Orientation API](https://www.w3.org/TR/screen-orientation/).
No se usa `alpha` relativo de iOS ni se afirma compatibilidad cuando el
navegador embebido no entrega sensores.

### Mapa y carga inicial

MapLibre se carga solo al tocar «Mapa». Incluirlo en el primer render elevaba la
transferencia inicial a unos 423 KB. Diferirlo la redujo a 157.635 bytes en la
medición productiva de Firefox. El mapa agrupa puntos, conserva atribución y
funciona con un worker vendorizado en `public/vendor/maplibre/`.

## 7. Contrato técnico

- Next.js 16 App Router y React 19.
- Server Components por defecto.
- Exactamente dos fronteras `use client`: `EncumbraApp` y `Vivo`. Los
  componentes interactivos que importan heredan esa frontera y no necesitan
  repetir la directiva.
- `lib/` contiene lógica pura: no importa desde `app/` o `components/` y no
  toca el DOM.
- Cero librerías nuevas para componentes, estado, fechas, gráficos o fetch.
- Fechas con `Intl.DateTimeFormat` y zona `America/Santiago`.
- Pruebas con `node --test` y type stripping nativo; sin framework de tests.
- El mapa, los iconos y las ilustraciones son implementaciones propias o
  activos vendorizados con sus licencias conservadas.
- No mostrar scores ni comparar viento entre parques que comparten celda.

El registro del service worker se hace con un script mínimo desde el layout y
no consume una tercera isla. La ubicación no se guarda. Favoritos y último
pronóstico pueden guardarse localmente, pero su ausencia no bloquea la app.

## 8. Sistema visual

La fuente completa es `DESIGN.md`; estos son los motivos que no conviene volver
a discutir sin nueva evidencia:

- La dirección vigente es «Sol de septiembre + atmósfera mate con grano fino».
- Archivo variable es la única familia; evita una colección de tipografías y
  permite diferenciar señalética con ancho, peso y tamaño.
- Hueso y carbón sostienen lectura; amarillo solar señala acción. Los colores
  de estado siguen siendo semánticos y siempre llevan texto.
- La identidad usa papel, volantín y movimiento leve; no glassmorphism, glow,
  gradientes genéricos, cards SaaS ni iconos de librería.
- El diseño inicial demasiado austero se sintió «para diseñadores» y sin alma.
  Se recuperaron volantines, cielo, material, color y consejos sin sacrificar
  claridad ni convertir la app en un collage.
- El usuario rechazó explícitamente la paleta retro y luego la dirección
  azul/lima. No resucitar ninguna de las dos como si fuera una exploración
  pendiente.

## 9. Bugs y trampas que ya costaron tiempo

### Datos y dominio

1. **GFS con rachas físicamente incoherentes.** No cambiar de modelo mirando
   solo resolución. Comparar primero viento y racha en una muestra real.
2. **Último éxito en una variable de módulo.** Funciona en un proceso Node
   persistente, falla como estrategia global en isolates de Workers. El estado
   durable vive en KV.
3. **`revalidate` no acota la cuota en Workers.** El caché no era compartido de
   la manera asumida. El cron acota llamadas por construcción.
4. **Un proveedor alternativo con los mismos nombres no está calibrado.** No
   conectar campos y reutilizar umbrales sin comparación física.
5. **Ausencia convertida en prohibición.** Si una fuente no nombra un parque,
   el estado es `sin-confirmar`, no `no-autorizado`.
6. **GPS “exacto” usando una celda cercana.** La UI ahora dice celda más
   cercana. No volver a prometer exactitud sin ampliar y validar la grilla.

### Next.js, Cloudflare y mapa

1. **Cron sin handler.** Agregar solo `triggers.crons` no basta cuando Wrangler
   apunta al worker generado. `custom-worker.ts` debe seguir como `main` y
   reexportar `handler.fetch`.
2. **MapLibre no encontraba su worker bajo Next.** `scripts/vendor-maplibre.mjs`
   copia el worker y el componente llama `setWorkerUrl`. El script está unido a
   `dev` y `build`; no retirar una mitad.
3. **MapLibre en first load.** Cargarlo de inmediato rompe el presupuesto por
   cientos de KB. Debe permanecer detrás de una acción explícita.
4. **`setStyle` y capas.** El mapa vigente usa un solo estilo y añade source y
   layer después de `load`. Si vuelve el cambio dinámico de estilo, comprobar
   existencia e idempotencia antes de reinstalar capas.
5. **OpenNext y rutas Edge.** No añadir `export const runtime = "edge"` a rutas
   de Next: el adaptador no las empaqueta de esa forma aunque el destino final
   sea Workers.
6. **Deploy con pnpm.** El comando correcto es `pnpm run deploy`; `pnpm deploy`
   invoca otra función propia de pnpm y falla con “Nothing to deploy”.

### UI y pruebas

1. **Página en blanco durante las primeras fases.** Era deliberado: la fase 1
   terminaba solo con dominio y tests, sin UI. En futuras entregas por fases,
   comunicar visualmente qué se espera ver.
2. **Turbopack y CSS.** Hubo sesiones donde el dev server conservó un chunk de
   `globals.css` aunque el archivo cambiara. Antes de culpar al selector,
   verificar el CSS servido; si sigue viejo, reiniciar el servidor y limpiar
   `.next`. Tratarlo como antecedente, no como verdad universal de cada versión.
3. **Navegadores automáticos sin `requestAnimationFrame`.** Un runner anterior
   hacía parecer roto MapLibre. La verificación oficial usa Playwright con
   Firefox visible y espera `networkidle`.
4. **Componentes cliente redundantes.** Una directiva `use client` convierte
   todo su grafo importado. Repetirla en hijos no crea valor y confunde la
   auditoría. Los huérfanos se eliminaron.
5. **La noche ocultaba información útil.** El viento y la luz son ejes
   distintos; no reemplazar el veredicto por «por hoy».
6. **El tema oscuro contaminaba tarjetas semánticas.** Un override global de
   `--estado-ink` convertía la tinta de tarjetas claras en texto claro y creaba
   contrastes ilegibles. Las tarjetas ahora usan `--state-ink`; el tema solo
   aclara etiquetas de estado sobre superficies oscuras.
7. **Cambiar atributos antes de hidratar.** El script temprano de tema modificó
   inicialmente `aria-label` y React reportó un mismatch. El script puede fijar
   `data-theme` en `<html suppressHydrationWarning>`, pero los atributos del
   componente deben permanecer estables hasta la hidratación.
8. **Smoke de ubicación atado a la UI anterior.** La prueba esperaba que el
   resultado apareciera dentro de Parques. Al convertirlo en destino de Mi
   salida, debe esperar el título «Donde estoy», comprobar que no existe
   «Cómo llegar» y volver a Parques antes de abrir el mapa.
9. **Orientación relativa presentada como brújula.** `deviceorientation` puede
   entregar `alpha` sin referencia magnética. Rotar la rosa con ese valor da
   una interfaz convincente pero falsa. Solo se acepta `webkitCompassHeading`,
   un evento `deviceorientationabsolute` o una lectura marcada `absolute`; si
   no existe, norte permanece arriba.

## 10. Despliegue y operación

Producción:

- aplicación: <https://encumbra.nvrkth.com/app>
- Worker: <https://encumbra.kathcastillosanchez.workers.dev>
- plataforma: Cloudflare Workers con OpenNext;
- cron: `*/10 * * * *`;
- KV: binding `PRONOSTICO`;
- despliegue manual: `pnpm run deploy`.

El 20 de septiembre de 2026 se verificó que el cron remoto reemplazara la
semilla de KV con un dato nuevo. El build desplegado después de calcular el sol
localmente respondió 200 en `/app` y `/api/pronostico`.

Ese mismo día se desplegó la brújula de `/volar` en la versión Cloudflare
`acf2ef60-0f89-432f-b8a2-efa3c5876222`. El smoke productivo en Firefox visible
recorrió ubicación sin parque, mapa, tema y orientación simulada del teléfono:
sin errores de consola ni desborde horizontal. La suite quedó en 103 pruebas.

La guía de despegue asistido quedó desplegada en la versión Cloudflare
`e0741ad6-44e0-4126-afa4-b4f3855365b8`, desde el commit `199659e`. El smoke
productivo volvió a recorrer ubicación sin parque, elección persistente de
Araucano, mapa, tema y `/volar` a 320, 390 y 1440 px. Las simulaciones de la
ruta WebKit de iPhone y del evento absoluto de Android terminaron alineadas,
sin errores de consola ni desborde horizontal. Tests: 108; lint y build: verdes.

La corrección para despegar a solas o con ayuda quedó desplegada en Cloudflare
como `8fe25eeb-ace8-4de7-9ae4-c467fd6025b6`, desde el commit `fc6bc99`. La
relación visible pasó de roles obligatorios a `Tú → Volantín`; el smoke
productivo confirmó el flujo WebKit y absoluto, además de 320×700, 390×844,
768×1024, 1024×768 y 1440×1000, sin errores de consola ni desbordes. Tests: 108;
lint, detector visual y build: verdes.

La primera corrección explicó de más: repetía que la dirección no cambia,
añadía técnica de despegue y desplegaba el límite del sensor como párrafo. En
terreno eso competía con la acción. La regla vigente es mostrar `Tú → Volantín`
y una sola comprobación corta; la evidencia extensa queda en esta bitácora, no
en la pantalla de vuelo. El recorte quedó desplegado desde `7672de4` en la
versión Cloudflare `f0e61fe0-9098-4ee7-ad97-e53e8b4cbbf3`; el smoke productivo
completo terminó sin errores ni desbordes.

Comandos de aceptación:

```bash
nvm use 22
node --test test/*.test.ts
pnpm lint
pnpm build
ENCUMBRA_BASE=https://encumbra.nvrkth.com python3 scripts/smoke-firefox.py
```

La cifra de pruebas se registra como referencia, no como objetivo: el criterio
es que la suite vigente quede completa y verde.

## 11. Deuda y decisiones bloqueadas

### Presupuesto de cliente

El techo original es 120 KB gzip/transferidos en first load. La medición más
reciente en Firefox productivo, sobre el despliegue
`8fe25eeb-ace8-4de7-9ae4-c467fd6025b6`, fue 158.954 bytes aun con MapLibre
diferido y exactamente dos fronteras cliente. No se subió el techo. Sigue
siendo deuda explícita; no retirar información de seguridad solo para maquillar
el número.

### Validación física

Falta una serie de salidas con un mismo volantín y una comparación horaria
contra DMC Quinta Normal. Sin eso no afirmar que ICON es preciso ni que los
umbrales son definitivos. Las rutas de orientación se probaron con eventos
simulados en Firefox; falta confirmar precisión, permisos y calibración en un
iPhone y un Android físicos al aire libre, lejos de metal.

### Proveedores y medición observada

WeatherAPI y DMC requieren credenciales del propietario. Bright Sky necesita
claridad de cuota y resolución. Ninguno debe entrar silenciosamente como fuente
equivalente.

### Lugares comunitarios

Faltan ubicación, precisión y fuente verificables para publicar una capa de
encuentros. Moderación y lugares aportados por usuarios son otro producto, no
una ampliación gratuita del catálogo.

### Alcance deliberadamente fuera

- notificaciones push;
- mapa de cables, árboles u obstáculos sin una fuente confiable;
- tiempos de traslado inventados;
- exactitud meteorológica por parque dentro de una celda;
- compartir puntos personales con terceros;
- fase lunar como sustituto de iluminación real del lugar.

## 12. Lista para futuras modificaciones

Antes de cambiar dominio, datos o UX:

1. Confirmar que el dato existe y su fuente permite el uso previsto.
2. Escribir primero el caso que falla como prueba de `lib/` cuando corresponda.
3. No replicar umbrales fuera de `lib/bandas.ts`.
4. Ejecutar la referencia Python y los nueve casos si cambia el score.
5. Verificar rachas antes de cambiar modelo o proveedor.
6. Mantener una sola petición/lectura para pintar el veredicto inicial.
7. Medir el first load; cortar funcionalidad no esencial antes de elevar el
   presupuesto.
8. Probar móvil y escritorio en Firefox visible, incluida ubicación, mapa,
   consola, overflow, tema del sistema y elección manual persistida.
9. Ejecutar tests, lint, build y build OpenNext antes de desplegar.
10. Registrar aquí la decisión, su evidencia y cualquier bug nuevo que haya
    costado tiempo.
