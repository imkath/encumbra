# DESIGN.md — Pronóstico de viento para volantines (Santiago)

> Contrato de diseño. Todo el código de UI se genera **contra este archivo**. Si algo no está aquí, se decide leyendo la FILOSOFÍA de cada bloque, no improvisando.
> Modo anti-slop: PREVENIR. Escrito antes de la primera línea de CSS.

---

## 0. Contexto (de dónde sale cada decisión)

| | |
|---|---|
| **Qué es** | Webapp mobile-first que responde una sola pregunta: *¿anda el volantín hoy, y a qué hora?* |
| **Para quién** | Cualquiera en Santiago con un volantín en la mano. Mayoría: septiembre, adultos con niños, cerro o potrero. |
| **Para quién NO** | Meteorólogos, parapentistas, kitesurfers, gente que quiere un dashboard del clima. No hay punto de rocío, no hay presión, no hay radar. |
| **Contexto físico real** | De pie, a pleno sol de mediodía, una mano ocupada con el hilo, mirando el teléfono a distancia de brazo, datos móviles malos en cerro. **Esta es la restricción que manda sobre todas las demás.** |
| **Emoción objetivo** | Veredicto y anticipación. Como un parte de olas, no como un panel de control. La alegría es *"sí, anda ahora, ándate"*. |
| **Personalidad (3 adjetivos, prohibido "limpio/moderno/minimalista")** | Callejero, exacto, festivo. |
| **Referente fuera de la web** | El papel de volantín mismo (papel de seda, colores planos, translúcido, cortado en rombo) + la notación de **barbas de viento** de las cartas meteorológicas. Nada de Dribbble. |

**Qué hace único al contenido:** el dato que decide no es la velocidad media, es la **brecha entre viento medio y racha**. Con 15 km/h parejos el volantín anda; con 15 km/h y rachas de 40 se corta. Ningún widget del clima muestra eso. Aquí es el elemento de primera clase.

---

## 1. DIRECCIÓN

### Tres direcciones evaluadas

1. **Carta meteorológica impresa** — tinta sobre papel, tablas numéricas, barbas de viento, cero color. Preciso y distinto, pero frío: le quita la fiesta a algo que es una fiesta.
2. **Papel de volantín** — el material como sistema visual: colores planos saturados, superficies translúcidas superpuestas, geometría de rombo y cola. Culturalmente irrepetible, riesgo de quedar decorativo y poco legible al sol.
3. **Instrumento de exterior** — contraste extremo, números enormes, casi monocromo con un solo color de señal. Legibilísimo, pero podría ser una app de cualquier cosa.

### Dirección comprometida: **2 + 3 — "papel de volantín con disciplina de instrumento"**

El material chileno da el color y la geometría; el uso al sol da la legibilidad y la jerarquía. Regla que resuelve la tensión: **el color saturado se gana, no se reparte.** Los colores de papel de volantín existen *solo* en la escala de veredicto de viento. Todo lo demás es papel: blanco hueso, tinta casi negra, cero grises decorativos.

**Referencias de nivel de calidad (mirar, no copiar):** las cartas de viento de la Armada, la señalética de terminal de buses, un paquete de volantines de kiosco.

### Qué NO tiene este proyecto (decisiones, no omisiones)

- **No hay dark mode.** Los volantines se encumbran de día. Un tema oscuro sería adorno, y al sol es peor. (Se reevalúa solo si aparece uso real al atardecer.)
- **No hay gráfico de líneas.** El pronóstico se lee como cinta de horas, no como serie temporal.
- **No hay set de iconos.** Ver §7.
- **No hay onboarding, ni cuenta, ni tutorial.** Abre y ya está la respuesta.
- **No hay hover.** Es táctil. Nada de estados que solo existen con mouse.

---

## 2. COLOR

Sistema de dos capas: **papel** (todo lo estructural) y **señal** (solo el veredicto de viento).

### Primitivos — papel

```css
--paper-00: oklch(0.985 0.008 95);   /* fondo, blanco hueso cálido, nunca #fff */
--paper-10: oklch(0.945 0.012 95);   /* superficie alterna, separadores de bloque */
--paper-20: oklch(0.870 0.014 95);   /* bordes visibles */
--ink-90:   oklch(0.205 0.020 70);   /* texto primario, nunca negro puro */
--ink-60:   oklch(0.450 0.018 70);   /* texto secundario — piso absoluto de opacidad */
```

### Primitivos — señal (papel de volantín, croma alto A PROPÓSITO)

Croma alto aquí es intencional y acotado: es el material del producto y es el único portador de significado. Fuera de esta escala, croma alto está prohibido.

```css
--v-plancha: oklch(0.720 0.030 95);   /* inerte, papel gris: no vuela */
--v-liviano: oklch(0.800 0.140 95);   /* amarillo volantín: solo volantín liviano */
--v-anda:    oklch(0.640 0.190 145);  /* verde loro: rango ideal — EL color del producto */
--v-bravo:   oklch(0.680 0.200 45);   /* naranja: se maneja pero corta */
--v-peligro: oklch(0.550 0.210 25);   /* rojo volantín: no salgas */
```

### Semánticos (lo único que se usa en componentes)

```css
--color-surface / --color-surface-alt / --color-border
--color-text-primary / --color-text-secondary
--color-verdict-bg / --color-verdict-ink   /* se asignan en runtime según la banda */
--color-action                              /* = --ink-90. La acción es tinta, no color. */
```

**FILOSOFÍA:** el color *dice la hora buena*. Si un color no está comunicando estado de viento, está mal puesto. La app en un día malo se ve gris y roja, y eso es correcto: el diseño es honesto sobre el día.

**Contraste:** mínimo **7:1** para texto primario sobre cualquier superficie (AAA, no AA) porque se lee al sol. El texto sobre bandas de señal va en `--ink-90`, nunca en blanco.

---

## 3. TIPOGRAFÍA

| Rol | Fuente | Por qué |
|---|---|---|
| Display / números | **Archivo** (variable: peso 100–900, ancho 62–125) | Omnibus-Type, foundry argentina, grotesca de señalética diseñada para el español latinoamericano. Un eje de ancho me da titular expandido y etiquetas condensadas desde una sola familia: menos peso descargado en 4G de cerro. |
| Datos / horas | **Chivo Mono** | Misma foundry, tabular, aire de instrumento. Las horas y los km/h se alinean en columna sin saltar. |

Prohibidas explícitamente: Inter, Geist, Roboto, Open Sans, Poppins, `system-ui` como decisión, y también Satoshi / Space Grotesk / Clash Display / General Sans (esas ya son el genérico de segunda ola).

**Escala — saltos grandes, pesos extremos. Nada tibio.**

```
verdict   Archivo 900, width 125, clamp(4.5rem, 22vw, 7rem), line-height 0.85, tracking -0.03em
hora      Chivo Mono 700, 2.25rem
título    Archivo 800, width 100, 1.5rem
cuerpo    Archivo 400, 1.125rem   ← 18px base: se lee a distancia de brazo
etiqueta  Archivo 600, width 75, 0.8125rem, uppercase, tracking 0.06em
```

Prohibido: pesos < 400 en cualquier tamaño (desaparecen al sol), texto secundario por debajo de `--ink-60`, y saltos de escala de 1.5x (usar 2x+).

---

## 4. ESPACIADO, FORMA, ELEVACIÓN

```
spacing: 4 · 8 · 16 · 24 · 32 · 48 · 64   (escala única, valores arbitrarios prohibidos)
radius:  0 por defecto — el papel se corta, no se redondea.
         2px solo en controles táctiles. NO existe rounded-2xl en este proyecto.
```

**Motivo de forma: el rombo.** La geometría del volantín aparece como diagonal (`clip-path`) en el corte entre bloques y en el remate de la cinta de horas. Un solo motivo, usado siempre igual. Nada de rombos decorativos sueltos.

**Elevación:** casi no hay. Papel sobre papel se separa con **borde de 1px en `--paper-20` y con espacio**, no con sombra. Una sola sombra permitida, en el bloque de veredicto:

```css
box-shadow: 0 2px 0 var(--paper-20), 0 8px 16px -8px oklch(0.20 0.02 70 / 0.18);
```

Prohibido: `backdrop-blur`, glassmorphism, glow blob, gradientes de fondo, sombras a opacidad 0.1 planas, fondos de grilla o puntos.

**Táctil:** objetivo mínimo 48×48. La acción primaria vive **anclada abajo**, en zona de pulgar. El header no es sticky (roba pantalla al sol).

---

## 5. MOVIMIENTO

Una sola animación con carácter: la cinta de horas se desplaza. El resto es funcional o no existe.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--dur-tap: 120ms;   --dur-ribbon: 240ms;   /* techo 300ms */
```

- Feedback de toque: `scale(0.97)` en `:active`. Nada de `hover:scale-105`.
- Entrada del veredicto: `opacity 0→1` + `translateY(8px)`, 240ms, stagger de 40ms entre las horas de la cinta.
- Nunca `transition: all`. Propiedades explícitas.
- `@media (prefers-reduced-motion: reduce)`: se conserva opacidad, se elimina el desplazamiento.

---

## 6. ESTRUCTURA (obligatoria — reemplaza el layout por defecto)

Prohibido: fila de tres cards, hero centrado con CTA, badge píldora sobre el H1, bento grid, `max-w-7xl mx-auto`, footer de cuatro columnas, tira de stat cards con "+12% vs ayer".

En su lugar, tres bloques a ancho completo, uno bajo el otro:

1. **VEREDICTO** — ocupa la primera pantalla completa. Una palabra gigante (`ANDA` / `NO ANDA` / `APENAS` / `BRAVO`), el fondo del bloque es el color de la banda, y debajo en mono: `18 km/h · rachas 26`. Nada más. Sin tarjeta, sin borde, sin icono.
2. **LA COLA** — la cinta de horas: las próximas 12 horas como segmentos apilados verticalmente, cada uno del color de su banda, con el ancho del segmento proporcional a la racha. Se lee de un vistazo dónde está la buena hora. *Esta es la visualización del producto: no es un gráfico de librería, es la cola del volantín.*
3. **LA BRECHA** — viento medio vs racha, como dos barras enfrentadas. Si la separación supera el umbral, el texto lo dice en chileno: *"viento rachado, se te va a cortar"*.

Debajo, en tinta sobre papel y sin color: dónde no se puede encumbrar (cables, los puntos prohibidos de Santiago) y el recordatorio de hilo curado. Ver §9.

---

## 7. ICONOS

**No hay librería de iconos.** Ni Lucide, ni Heroicons, ni Phosphor (esa ya es la sustitución automática de todo el mundo).

Se dibujan a mano, como SVG inline, **barbas de viento** — la notación meteorológica real: media barba = 5 nudos, barba entera = 10, banderín = 50. Son cuatro trazos, se leen a distancia, tienen 150 años de uso y ninguna webapp las usa. Si hace falta algo que las barbas no cubren, se resuelve con **palabra**, no con pictograma.

---

## 8. LISTA DE EXCLUSIÓN (prohibición + destino positivo)

| No | En su lugar |
|---|---|
| Inter / Geist / Satoshi / Space Grotesk | Archivo variable + Chivo Mono |
| indigo/violeta, gradiente índigo→púrpura | escala de papel de volantín, solo en el veredicto |
| grises Tailwind (`slate/zinc/gray`) como texto | `--ink-90` / `--ink-60`, cálidos, derivados del papel |
| `rounded-lg` / `rounded-2xl` uniforme | radius 0 (corte de papel), 2px solo en controles |
| tres feature cards | los tres bloques a ancho completo de §6 |
| gráfico de líneas / Recharts | la cinta de horas ("la cola") |
| Lucide / Phosphor | barbas de viento en SVG inline |
| `border-l-4` de color, `bg-amber-50` de alerta | fondo sólido neutro + peso tipográfico + color solo en la etiqueta |
| `backdrop-blur`, glow, fondo de grilla | papel liso, jerarquía por espacio y borde de 1px |
| "Predice el viento perfecto" y afines | el dato es el copy: *"A las 16:00 anda."* |
| sombra `0 x y rgba(0,0,0,0.1)` en todo | una sola sombra, solo en el bloque de veredicto |
| skeleton shimmer gris | el veredicto en `--v-plancha` con el texto `midiendo…` en mono |

---

## 9. CONTENIDO, DATOS Y VOZ

**Fuente de datos:** Open-Meteo (gratis, sin API key para uso no comercial) con `wind_speed_10m` y `wind_gusts_10m` horarios. Verificar en implementación el modelo que mejor resuelve la cuenca de Santiago.

**Bandas de viento (medio, a 10 m).** Ancladas en la escala de Beaufort, no inventadas. La mayoría de los volantines vuela bien entre ~6 y ~28 km/h; el rango cómodo está en Beaufort 3–4 (11–28 km/h); desde Beaufort 7 (≥45 km/h) el vuelo es peligroso y se destroza el volantín.

| Banda | km/h | Veredicto |
|---|---|---|
| plancha | < 6 | NO ANDA |
| liviano | 6–11 | APENAS |
| ideal | 11–28 | ANDA |
| bravo | 28–45 | BRAVO |
| peligro | ≥ 45 | NO SALGAS |

> Estos cortes son la **v1 y son ajustables**: son un umbral físico calibrable, no una verdad. Dejar la constante en un solo archivo (`bandas.ts`) y afinarla con uso real en cerro.
>
> **Corrección posterior (ver `docs/06-CALIBRACION.md`):** esta tabla quedó como referencia, no como la regla que corre, y sus cortes resultaron estar mal para Santiago. Dos motivos:
>
> 1. Evaluar la banda por velocidad ignora la racha, que es el argumento entero del producto: con 12 km/h y rachas de 45 esta tabla diría ANDA mientras el hilo se corta.
> 2. El viento de las tardes de septiembre en Santiago tiene mediana 8,4 km/h y percentil 95 de 14,4. Una banda "ideal" que parte en 11 y llega a 28 describe un lugar con más viento del que hay acá.
>
> En runtime la banda se deriva del score, con el centro de la campana en 14 km/h para el perfil estándar. La velocidad y la racha absolutas sobreviven solo como reglas duras de seguridad en 45 km/h.

**Voz:** chilena, corta, sin saludo, sin emoji, sin signos de exclamación. El veredicto primero, la explicación después y solo si aporta. Prohibido el copy aspiracional ("domina el cielo", "tu compañero de vuelo").

**Módulo de seguridad (tinta, sin color, sin caja de alerta):**
- El **hilo curado está prohibido en Chile por la Ley 20.700 (2013)**: fabricar, almacenar o vender arriesga presidio de 61 a 540 días y multa de 100 a 500 UTM; usarlo o facilitarlo, multa de 2 a 50 UTM.
- Zonas donde no se puede encumbrar en Santiago (cercanía a líneas eléctricas). Existe un catastro público de puntos prohibidos; **verificar la fuente oficial vigente antes de publicarla en la app** — no cargar una lista de un medio de prensa como si fuera dato canónico.

---

## 10. ACCESIBILIDAD Y RENDIMIENTO (no negociable)

- Contraste 7:1 texto primario, 4.5:1 secundario. Verificar **cada** combinación sobre las cinco bandas de señal.
- El veredicto nunca depende solo del color: siempre hay palabra.
- Objetivos táctiles ≥ 48px, foco visible (outline de 2px en `--ink-90`, no `outline:none`).
- `prefers-reduced-motion` respetado.
- HTML semántico, `lang="es-CL"`, la hora en `<time datetime>`.
- Presupuesto: **< 100 KB en la primera carga**, dos pesos de fuente como máximo (`font-display: swap`, subset latino). Funciona con 3G en cerro o no funciona.
- La app debe seguir mostrando el último pronóstico conocido sin red, y decir cuándo se midió.

---

## 11. RIESGO DE OLA 3 (autocrítica)

- **"Colores de papel de volantín"** puede volverse la receta chilena de moda. Aquí sostiene el peso porque el color *es* la escala de datos; copiarlo como paleta decorativa lo convierte en slop.
- **Archivo/Chivo** son buena elección por origen y ejes variables, no por ser "no-Inter". Si al armarlo se ven demasiado parecidas entre sí, cambiar la de cuerpo por algo con más diferencia real, no por otra grotesca de la misma lista.
- **Radius 0 + tipografía enorme** roza el brutalismo genérico. Lo que lo salva es el motivo de rombo y el color-como-dato. Si se pierden esos dos, esto se convierte en otra landing brutalista.

---

## 12. Cómo generar contra este archivo

Antes de escribir un componente: elegir el token semántico (nunca un hex suelto), elegir el valor de la escala de espaciado (nunca arbitrario), y revisar §8 por si el reflejo que se está por escribir está en la lista. Al terminar, pasar por **modo CORREGIR** de anti-slop: auditar el código *y mirar el render servido en móvil*, porque el CSS puede leerse limpio y la pantalla verse genérica igual.
