# Prompt para v0

v0 no ve este repo, así que el prompt va autocontenido: incluye los tokens, la
estructura y los datos de ejemplo. El objetivo aquí **no es la lógica**, es ver
la UI puesta en pantalla y compararla con la que salga de Codex.

Pegar tal cual en v0.

---

````
Diseña la interfaz de una webapp mobile-first llamada Encumbra: le dice a alguien
en Santiago de Chile si anda el volantín, cuándo y dónde. Usa datos de ejemplo
fijos, no conectes ninguna API. Quiero ver la UI, no la lógica.

## La restricción que manda sobre todo lo demás

La persona está de pie, a pleno sol de mediodía, con una mano ocupada sosteniendo
el hilo del volantín, mirando el teléfono a distancia de brazo, con datos móviles
malos en un cerro. Cada decisión visual sale de ahí: contraste altísimo, números
enormes, cero elementos decorativos, acción en zona de pulgar.

Personalidad: callejero, exacto, festivo. Prohibido perseguir "limpio, moderno,
minimalista": eso es lo que sale por defecto y no es lo que quiero.

Referente visual, fuera de la web: el papel de volantín (papel de seda, colores
planos saturados, translúcido, cortado en rombo) más la notación de barbas de
viento de las cartas meteorológicas. Nada de Dribbble.

## Dirección: papel de volantín con disciplina de instrumento

El material chileno da el color y la geometría. El uso al sol da la legibilidad.
La regla que resuelve la tensión: **el color saturado se gana, no se reparte.**
Los colores existen SOLO en la escala de veredicto de viento. Todo lo demás es
papel: blanco hueso, tinta casi negra, cero grises decorativos.

## Tokens exactos (úsalos, no inventes otros)

Papel, para todo lo estructural:
  --paper-00: oklch(0.985 0.008 95)   fondo, blanco hueso cálido, nunca #fff
  --paper-10: oklch(0.945 0.012 95)   superficie alterna
  --paper-20: oklch(0.870 0.014 95)   bordes
  --ink-90:   oklch(0.205 0.020 70)   texto primario, nunca negro puro
  --ink-60:   oklch(0.450 0.018 70)   texto secundario, piso absoluto

Señal, croma alto a propósito, SOLO en el veredicto de viento:
  --v-plancha: oklch(0.720 0.030 95)   inerte: no vuela
  --v-liviano: oklch(0.800 0.140 95)   amarillo volantín: apenas
  --v-anda:    oklch(0.640 0.190 145)  verde loro: rango ideal
  --v-bravo:   oklch(0.680 0.200 45)   naranja: se maneja pero corta
  --v-peligro: oklch(0.550 0.210 25)   rojo: no salgas

El texto sobre las bandas de señal va en --ink-90, nunca en blanco.
Contraste mínimo 7:1 en texto primario, porque se lee al sol.

Tipografía, ambas de Google Fonts:
  Archivo variable, ejes de ancho y peso:
    family=Archivo:wdth,wght@62..125,100..900
  Chivo Mono para horas y velocidades:
    family=Chivo+Mono:wght@400..700

  veredicto  Archivo 900, width 125, clamp(4.5rem, 22vw, 7rem), line-height 0.85
  hora       Chivo Mono 700, 2.25rem
  título     Archivo 800, width 100, 1.5rem
  cuerpo     Archivo 400, 1.125rem   (18px base: se lee a distancia de brazo)
  etiqueta   Archivo 600, width 75, 0.8125rem, mayúsculas, tracking 0.06em

  Prohibido cualquier peso bajo 400: desaparece al sol.

Forma:
  espaciado 4 · 8 · 16 · 24 · 32 · 48 · 64, escala única, nada arbitrario
  border-radius 0 por defecto. El papel se corta, no se redondea.
    2px solo en controles táctiles. rounded-2xl no existe en este proyecto.
  motivo de forma: el rombo, como diagonal con clip-path en el corte entre
    bloques. Un solo motivo, siempre igual.
  elevación: casi ninguna. Papel sobre papel se separa con borde de 1px en
    --paper-20 y con espacio. Una sola sombra permitida, en el veredicto:
    box-shadow: 0 2px 0 var(--paper-20), 0 8px 16px -8px oklch(0.20 0.02 70 / 0.18)
  objetivo táctil mínimo 48x48. El header no es sticky: roba pantalla al sol.

## Estructura obligatoria

### Pantalla 1, PLANEAR: scroll vertical, cuatro bloques a ancho completo

1. VEREDICTO, ocupa la primera pantalla completa.
   Una palabra gigante. El fondo del bloque es el color de la banda.
   Debajo, en mono: 18 km/h · rachas 26 y luego Centro · ahora, 15:40
   Nada más. Sin tarjeta, sin borde, sin icono, sin porcentaje.
   Si ahora no anda pero anda después, una línea más: a las 16:20 anda

2. LA COLA: las próximas 12 horas como segmentos apilados verticalmente,
   cada uno del color de su banda, con el ancho del segmento proporcional a
   la racha, y la hora en mono a la izquierda. Se lee de un vistazo dónde
   está la buena hora. Esta es la visualización del producto: es la cola del
   volantín, NO un gráfico de librería.

3. LA BRECHA: viento medio contra racha máxima, dos barras enfrentadas, con
   la separación entre ambas como protagonista. Debajo, la frase que traduce:
   "viento rachado, se te va a cortar". Aquí también van tres botones en una
   línea para el tipo de volantín: liviano, estándar, acrobático.

4. Pie de seguridad, en tinta sobre papel, sin color y sin caja de alerta:
   distancia a tendidos eléctricos, y que el hilo curado está prohibido en
   Chile por la Ley 20.700.

Y un botón fijo anclado abajo, en zona de pulgar, ancho completo: VOY

### Pantalla 2, VOLAR: una sola pantalla, SIN SCROLL, sin navegación

  arriba y chico:  CENTRO · MEDIDO 15:52
  el número, en tamaño absurdo a propósito:  18  KM/H
  debajo:  RACHAS 26  con una flecha de tendencia
  separador
  TE QUEDAN 1H 40
  luz hasta las 18:23
  anclado abajo, zona de pulgar: LISTO

## Datos de ejemplo (fíjalos, no los pidas)

Son de una buena tarde real de septiembre en Santiago, no inventados. El viento
acá es más bajo de lo que uno esperaría: la mediana de las tardes de septiembre
es 8 km/h y rara vez pasa de 15. Que los números se vean chicos es correcto.

zona: O'Higgins y alrededores · hora actual 15:40 · viento 13 km/h ·
rachas 20 km/h · veredicto ANDA
ventana activa: 15:00 a 18:00 · puesta de sol 18:23

próximas 12 horas, como (hora, viento, racha):
  14:00 11/19   15:00 13/20   16:00 14/22   17:00 13/26
  18:00 10/24   19:00  7/18   20:00  5/14   21:00  4/11
  22:00  4/9    23:00  3/8    00:00  3/7    01:00  3/7

Fíjate en las 17:00: el viento baja de 14 a 13 pero la racha sube de 22 a 26.
Esa es exactamente la situación que la pantalla tiene que dejar ver de un
vistazo, y es la razón de ser del bloque LA BRECHA.

## Prohibido explícitamente

Esta lista es la parte más importante del prompt. A la izquierda lo que no, a la
derecha adónde ir en su lugar:

  Inter, Geist, Satoshi, Space Grotesk       →  Archivo + Chivo Mono
  índigo, violeta, gradiente índigo a púrpura →  la escala de papel de volantín
  grises de Tailwind (slate, zinc, gray)     →  --ink-90 y --ink-60, cálidos
  rounded-lg o rounded-2xl uniforme          →  radius 0, corte de papel
  tres feature cards en fila                 →  los bloques a ancho completo
  gráfico de líneas, Recharts, cualquier chart →  la cinta de horas
  shadcn/ui, cualquier librería de componentes →  HTML y CSS a mano
  lucide-react, Phosphor, cualquier set de iconos →  palabras, o barbas de
     viento dibujadas como SVG inline (media barba 5 nudos, entera 10)
  border-l-4 de color y bg-amber-50 de alerta →  fondo neutro, peso tipográfico
  backdrop-blur, glassmorphism, glow, fondo de grilla o de puntos →  papel liso
  sombra rgba(0,0,0,0.1) repartida en todo   →  una sola sombra, en el veredicto
  copy aspiracional ("domina el cielo")      →  el dato es el copy: "A las 16:00 anda"
  hover:scale-105 y transition: all          →  scale(0.97) en :active, y nada más
  skeleton shimmer gris                      →  el veredicto en --v-plancha con
                                                 el texto "midiendo…" en mono
  modo oscuro                                →  no existe: los volantines se
                                                 encumbran de día
  onboarding, modal de bienvenida, tutorial  →  abre y ya está la respuesta

Es táctil: nada de estados que solo existen con mouse.

## Qué quiero de vuelta

Las dos pantallas, en React con Tailwind, responsivas de 320px hacia arriba,
con los datos de ejemplo hardcodeados.

Y del bloque VEREDICTO dame tres tratamientos distintos, todos dentro de la
misma dirección y respetando la misma lista de prohibiciones, variando solo:
cuánto ocupa la palabra, dónde cae el corte diagonal del rombo, y cómo se
relacionan la palabra y los dos números. Quiero elegir entre esos tres.

Escribe todos los textos en español de Chile: cortos, sin saludo, sin emoji,
sin signos de exclamación.
````
