# Encumbra v2 — Producto y UX

> Qué es, para quién, y cómo se comporta en las dos situaciones reales de uso.
> El contrato visual vive aparte, en [`DESIGN.md`](../DESIGN.md). Este documento no repite colores ni tipografías: define comportamiento.

---

## 1. La tesis

La v1 era un panel que respondía *"¿cuál es el score?"*. La v2 es una herramienta que responde dos preguntas distintas en dos momentos distintos:

| Momento | Dónde está la persona | Qué pregunta | Qué necesita |
|---|---|---|---|
| **PLANEAR** | En la casa, sentada, con wifi, dos manos, sin apuro | ¿Salgo o no salgo? ¿A qué hora? | Comparar, entender, agendar |
| **VOLAR** | En el cerro, de pie, sol directo, una mano en el hilo, 4G malo | ¿Cuánto me queda? ¿Se está poniendo peor? | Un número enorme y nada más |

Son dos productos con el mismo dato de fondo. Tratarlos igual fue el error central de la v1.

## 2. Qué promete y qué no promete

**Promete:**
- Un veredicto en una palabra, sin interpretación de por medio, calibrado con el viento real de Santiago y no con el de un manual extranjero.
- La brecha entre viento medio y racha como dato de primera clase.
- Ventanas horarias: no "hoy está bueno", sino "de 15:00 a 17:00 anda".
- Honestidad sobre su propia precisión.

**No promete:**
- Diferencias de viento entre parques de la misma zona. El modelo no las ve (ver `01-ANALISIS-V1.md` §4.1). Decir que las ve es mentir con gráficos.
- Notificaciones push. Ver §6.4.
- Nada sobre lugares donde no hay parques cargados.

**La honestidad es una feature, no una disculpa.** La pantalla de zona dice en mono, chico: `el modelo ve celdas de ~11 km · dentro de una zona el viento es el mismo`. Eso construye más confianza que un ranking inventado, y ninguna app del clima lo hace.

## 3. La unidad geográfica: zona, no parque

Los 17 parques de la v1 colapsan en 6 celdas del modelo. La v2 invierte la relación:

- **La zona** (6, alineadas con las celdas reales) es la unidad del pronóstico. Es lo que se selecciona y lo que se compara.
- **El parque** es un dato de contexto dentro de la zona: nombre, tamaño, advertencias, cercanía a cables. Se elige por distancia y seguridad, nunca por viento.

Esto simplifica la interfaz (6 opciones en vez de 17, Ley de Hick), hace una sola llamada en vez de 17, y elimina la única afirmación falsa que hacía el producto.

Las zonas se nombran en chileno, no en jerga de grilla: `Centro`, `Poniente`, `Oriente`, `Sur`, `Sur poniente`, `Sur oriente`. Los nombres definitivos se fijan agrupando los parques por celda contra un mapa, no de memoria.

## 4. MODO PLANEAR

Una sola página, scroll vertical, sin navegación superior. Cuatro bloques a ancho completo.

### 4.1 Bloque VEREDICTO (primera pantalla completa)

```
┌──────────────────────────────┐
│                              │
│   A N D A                    │  ← una palabra, clamp(4.5rem, 22vw, 7rem)
│                              │     fondo = color de la banda
│   18 km/h · rachas 26        │  ← Chivo Mono
│   Centro · ahora, 15:40      │
│                              │
└──────────────────────────────┘
```

- El veredicto es siempre **de ahora**, nunca del día. "Hoy está bueno" no sirve: la gente sale a una hora concreta.
- Si ahora no anda pero anda después, inmediatamente debajo aparece la línea que engancha: `a las 16:20 anda`. Ese es el pico emocional de la pantalla (Regla de Fin de Pico) y evita que un "NO ANDA" mate la sesión.
- Sin tarjeta, sin borde, sin icono, sin porcentaje. El número 0-100 es un detalle de implementación: **el usuario nunca ve un score**. Ve una palabra y dos velocidades.

El veredicto incorpora la racha, no solo la velocidad media. Con 12 km/h y rachas de 45 la palabra es `NO SALGAS`, nunca `ANDA`: sería absurdo que la pantalla principal ignorara justamente el dato que hace distinta a esta app (ver `03-PLAN.md` §2.1).

**Por qué se esconde el score:** un número del 0 al 100 obliga a interpretar (¿72 es bueno?). Una palabra no. El score sigue existiendo en el código para ordenar y para decidir la banda, pero exponerlo era trasladarle al usuario una complejidad que el sistema puede absorber (Ley de Tesler).

### 4.2 Bloque LA COLA

Las próximas 12 horas como segmentos apilados verticalmente. Cada segmento: color de su banda, ancho proporcional a la racha, hora en mono a la izquierda.

```
14:00 ████████░░░░░░░░
15:00 ██████████░░░░░░
16:00 ███████████████░   ← se lee el bulto de la racha
17:00 ██████████░░░░░░
```

Se lee de un vistazo dónde está la hora buena y dónde se pone rachado, sin leer un solo número. No es un gráfico de líneas ni una librería de charts: es la cola del volantín, y es la visualización propia del producto.

Tocar un segmento no abre un modal: expande esa hora en su lugar con la línea de detalle. Sin capas, sin navegación.

### 4.3 Bloque LA BRECHA

Dos barras enfrentadas, viento medio contra racha máxima, con la separación como protagonista. Debajo, la frase que traduce:

- brecha chica → `parejo, el volantín se queda quieto arriba`
- brecha media → `tirones, anda con cola`
- brecha grande → `viento rachado, se te va a cortar`

Este bloque es el diferenciador del producto y por eso ocupa una pantalla propia en vez de ser una línea de texto.

### 4.4 Pie: seguridad y sitio

En tinta sobre papel, sin color, sin caja de alerta, sin icono de triángulo:
- Distancia mínima a tendidos eléctricos.
- Hilo curado: prohibido por la **Ley 20.700 (2013)**. Fabricar, almacenar o comercializar arriesga presidio de 61 a 540 días y multa de 100 a 500 UTM; usarlo o facilitarlo, multa de 2 a 50 UTM.
- Los parques de la zona con sus advertencias.

No es un banner que se cierra ni un modal de bienvenida: vive en la página y se lee cuando se llega ahí (Paradoja del Usuario Activo: nadie lee el manual, así que el contenido va en el flujo, no antes de él).

### 4.5 Acción anclada

Un botón fijo en zona de pulgar, siempre visible: **`VOY`**.

No lleva a otra parte del contenido. Cambia el estado de la app a MODO VOLAR y fija la ventana elegida como la ventana activa. Es el único control persistente de la pantalla (Ley de Fitts: grande, en el borde inferior, sin vecinos que compitan).

## 5. MODO VOLAR

**Restricción rectora:** de pie, sol directo, una mano ocupada, guantes o dedos fríos, pantalla al 50% de brillo efectivo, señal mala.

Una pantalla. **Sin scroll.** Sin navegación. Sin ajustes.

```
┌──────────────────────────────┐
│  CENTRO · MEDIDO 15:52       │  ← estado del dato, arriba, chico
│                              │
│      18                      │  ← el número, tamaño absurdo a propósito
│      KM/H                    │
│      RACHAS 26  ↗            │  ← tendencia: sube / baja / parejo
│                              │
│  ─────────────────────────   │
│                              │
│  TE QUEDAN 1H 40             │  ← cuenta regresiva de la ventana
│  luz hasta las 18:23         │  ← puesta de sol
│                              │
│  ┌────────────────────────┐  │
│  │        LISTO           │  │  ← zona de pulgar, vuelve a planear
│  └────────────────────────┘  │
└──────────────────────────────┘
```

### 5.1 Las cuatro cosas que muestra y por qué

1. **Viento y racha ahora.** Es el dato. Todo lo demás es contexto.
2. **Tendencia a 60 minutos.** Una flecha: sube, baja, parejo. Saber que va a empeorar cambia la decisión de quedarse; el valor absoluto no.
3. **Cuánto queda de ventana.** El reloj del producto. `te quedan 1h 40` cuando va bien, `en 25 min se pone bravo` cuando se acaba. Es la razón por la que alguien abre la app estando allá.
4. **Luz hasta las 18:23.** Dato real de la API (`daily=sunset`), gratis en la misma llamada, y es la otra cosa que se acaba cuando estás afuera con niños.

### 5.2 Cambio de banda: aviso sin push

Con la pantalla abierta, la app refresca cada 10 minutos. Si la banda cambia, `navigator.vibrate()` y el bloque cambia de color. Nada más: sin permisos, sin service worker, sin backend.

Esto cubre el caso real (el teléfono está en el bolsillo mientras se vuela, se saca cada tanto) sin prometer lo que la web no cumple. Ver §6.4.

### 5.3 Sin señal

El modo volar **nunca muestra un spinner ni una pantalla vacía**. Muestra el último dato conocido con su hora de medición, y una línea: `sin señal · último dato de las 15:40`. Un pronóstico de hace 40 minutos sigue siendo útil; una pantalla en blanco no.

El último pronóstico completo se guarda en `localStorage` al cargarlo. Es el requisito de disponibilidad más importante del producto, porque el momento de mayor necesidad coincide con el peor lugar de cobertura.

## 6. Decisiones de alcance

### 6.1 Cómo se cambia de modo

- **El usuario manda.** Botón grande `VOY` / `LISTO`. El estado persiste en `localStorage`.
- **La app solo sugiere.** Si hay permiso de ubicación y la persona está dentro de una zona con ventana abierta, la app arranca en modo VOLAR con una línea de salida: `estás en terreno · ver el día`.
- **La sugerencia nunca atrapa.** Salir siempre está a un toque.

Sin geolocalización (el caso mayoritario, porque la mayoría no da el permiso) la app arranca en PLANEAR con la zona guardada, o Centro la primera vez. La geolocalización mejora la experiencia y jamás es requisito.

### 6.2 Perfil de volantín

Se conserva: es lo único que el usuario sabe y el sistema no puede deducir. Pero no vive en una hoja de ajustes con tres controles más. Son tres botones en una línea, dentro del bloque de la brecha, donde el cambio se ve en el acto.

Por defecto: **estándar**. Cambiarlo recalcula bandas y ventanas en el cliente, sin llamada de red.

### 6.3 Unidades

Se botan. km/h y nada más. Los nudos y m/s son de otro usuario (kitesurf, vuelo libre), y la v1 los ofrecía a costa de una decisión más en pantalla. Si aparece un usuario real pidiéndolos, se agrega.

### 6.4 Notificaciones

La v1 usaba la Notification API con `localStorage`, que no funciona en iOS Safari salvo que la app esté instalada como PWA, y muere apenas se cierra la pestaña. Era una promesa que la plataforma no cumple.

Reemplazo: **agendar la ventana en el calendario**. Un botón que genera un `.ics` con la ventana buena. Lo toma el calendario del sistema operativo, que sí avisa, sin permisos, sin backend, sin service worker. La plataforma ya resuelve el problema.

Web Push real queda fuera de la v1. Se evalúa cuando exista uso sostenido que lo justifique.

### 6.5 Fuera del alcance de la v1

Mapa interactivo, formularios de contacto y sugerencia, páginas de contenido, cuentas de usuario, historial, modo oscuro, comparador de parques, i18n. Cada uno entra cuando haya alguien pidiéndolo, no antes.

## 7. Fundamento de UX por modo

| Ley | Modo | Qué implica en concreto |
|---|---|---|
| **Hick** | Planear | 6 zonas en vez de 17 parques. Un control persistente, no seis. |
| **Tesler** | Ambos | El sistema absorbe el score, el gust factor y la normalización. El usuario recibe una palabra. |
| **Fitts** | Volar | Acción única anclada abajo, ancho completo, ≥48px, sin vecinos. |
| **Carga cognitiva** | Volar | Cuatro datos en pantalla. Cero navegación. Cero ajustes. |
| **Von Restorff** | Planear | El color saturado existe solo en la banda de veredicto. Por eso destaca. |
| **Fin de pico** | Planear | El pico es `a las 16:20 anda`, no el estado actual. Un mal ahora no cierra la sesión. |
| **Umbral de Doherty** | Ambos | Se pinta el dato cacheado en el primer frame y se refresca detrás. Nunca un spinner de pantalla completa. |
| **Postel** | Ambos | Sin geolocalización funciona igual. Sin señal funciona igual. Sin permiso de nada funciona igual. |
| **Usuario activo** | Ambos | Sin onboarding, sin tutorial, sin modal de bienvenida. Abre y está la respuesta. |
| **Jakob** | Ambos | Scroll vertical y toque estándar. La originalidad está en el contenido, no en gestos que hay que aprender. |
| **Prägnanz** | Planear | La cola de horas es una forma sola y legible, no un gráfico que hay que decodificar. |
| **Occam** | Alcance | Todo lo de §6.5 salió por esto. |

## 8. Criterio de éxito

La v2 está bien hecha si:

1. Alguien parado en un cerro, a pleno sol, con una mano, obtiene la respuesta en **menos de 3 segundos y sin scroll**.
2. La primera carga pesa **menos de 100 KB** y pinta algo útil con 3G.
3. Funciona **sin señal** mostrando el último dato con su hora.
4. **Ninguna pantalla muestra un número del 0 al 100.**
5. Nada en la interfaz afirma una diferencia de viento que el modelo no puede ver.
