# Dirección visual — landing de Encumbra

Contrato que la generación debe respetar. No es una descripción de algo hecho:
se escribe **antes** de generar para que el genérico no entre.
Complementa `DESIGN.md` (app); no lo reemplaza.

## Contexto

- **Qué es:** puerta de entrada a una herramienta meteorológica de volantín, Santiago.
- **Para quién:** quien va a encumbrar hoy o este fin de semana. Mayor tráfico en
  septiembre. No es una audiencia SaaS: nadie viene a evaluar un producto, vienen a
  saber si corre viento.
- **Para quién NO es:** para nadie que necesite ser convencido de que la app existe.
  No hay que vender. Eso libera de todo el aparato de landing comercial.
- **Emoción:** anticipación de una tarde concreta. Mirar el árbol y decidir.
- **Personalidad (3 adjetivos, ninguno es "moderno/limpio/minimalista"):**
  certero, callejero, atmosférico.

## Decisión central

**La landing no explica el producto: lo ejecuta.**

El argumento más fuerte de Encumbra no es una feature, es la respuesta. El primer
fold muestra el veredicto real de Santiago ahora mismo, en una palabra, con los
datos reales debajo. Ninguna plantilla puede imitar eso porque cambia de palabra y
de color cada hora.

Esto también resuelve la corrección explícita del usuario (rechazó la página
interminable): **la landing son dos pantallas**, no nueve secciones, y la primera
ya es la herramienta.

### Referentes (fuera del web design)

- El parte meteorológico: dato, unidad, hora, fuente. Sin adorno.
- La señalética de aeropuerto/metro (Vignelli): una palabra enorme, legible a
  distancia, cero decoración.
- Saul Bass: el primer fold crea un estado, no explica el argumento.

## Estructura permitida (y única)

```
FOLD 1 — el veredicto (100dvh)
  Marca chica arriba a la izquierda (volantín + "Encumbra"). Nada más de nav.
  VEREDICTO      una palabra, clamp(64px, 18vw, 160px), Archivo wdth 112 / wght 800
  Bajada         una línea: lugar + ventana horaria real ("Santiago, entre 16:00 y 18:30")
  Acción         una sola. "Ver parques cerca" → la app.
  Pie del fold   línea de datos: viento · rachas · actualizado hace X · Open-Meteo

FOLD 2 — cómo lo decide
  La escala de bandas real como regla horizontal de km/h con las cinco bandas
  y el marcador en el valor de ahora. Esa regla ES la explicación y ES la firma
  visual. No hay cards que la acompañen.
  Una línea de honestidad: pronóstico no es medición en terreno.
  La acción otra vez. Atribución. Fin.
```

No hay fold 3.

## Color

Se hereda la paleta de `DESIGN.md`. La landing agrega **una sola regla nueva**:

> El fondo del fold 1 es la banda del veredicto de hoy. El `-soft` es la superficie,
> el ink de la banda es el texto. La página cambia de color con el viento.

El color es dato, no decoración. Consecuencias:

- El azul `#3155f5` queda reservado **solo** para la acción. No es fondo, no es acento.
- El lima `#d9fc69` no aparece en la landing (es selección de mapa y nav activa en la app).
- Cero degradados, cero glow, cero fondo tintado que no venga de una banda.

Contraste verificado (AA texto normal, todos pasan):

| banda | ink / soft | ratio |
|---|---|---|
| ideal | `#357746` / `#eaf4db` | 4.76 |
| liviano | `#866316` / `#faf0cf` | 4.84 |
| plancha | `#5e6f7d` / `#ecf0f4` | 4.53 |
| bravo | `#a65224` / `#fce9da` | 4.62 |
| peligro | `#b33242` / `#fce5e7` | 5.07 |
| acción | `#3155f5` / `#f7f9fc` | 5.31 |

## Tipografía

**Una sola familia: Archivo (Omnibus-Type), variable, ejes `wght` + `wdth`.**

Razón contextual, no swap de lista: es una grotesca del Cono Sur diseñada para
señalética y para el español con tildes y ñ; su eje de ancho da el registro de
tablero sin importar una segunda tipografía "de diseñador"; y sus cifras tabulares
sostienen los números, que aquí son el argumento.

- **Veredicto:** `wdth 112`, `wght 800`, `letter-spacing -0.03em`.
- **Lectura y datos:** `wdth 100`, `wght 400/500`.
- **Números:** `font-variant-numeric: tabular-nums` siempre.
- Salto de tamaño real entre veredicto y bajada: **4x o más**, no 1.5x.

Carga: `Archivo({ subsets: ["latin"], axes: ["wdth"] })` en `next/font/google`.

**Se elimina Space Grotesk.** Es de la lista de Ola 2 (el nuevo genérico
anti-slop) y además hoy convive con una variable mal nombrada: `--font-archivo`
carga DM Sans en `app/layout.tsx`. Unificar en Archivo resuelve las dos cosas.

## Forma y espacio

- **La landing no tiene paneles ni cards.** El radius de 14px aplica solo al botón
  de acción. Nada más lleva esquina redondeada.
- Jerarquía por tamaño, peso, ancho y espacio. Nunca por borde de color ni por caja.
- Escala de espaciado: `4 8 16 24 32 48 64 96`. Sin valores arbitrarios.
- Sin sombras. La separación es superficie contra superficie.

## Motion

Un solo movimiento en toda la página: el marcador de la regla de bandas se asienta
en su valor, una vez, 240ms, `cubic-bezier(0.23, 1, 0.32, 1)`. Nada más se anima.
`prefers-reduced-motion` lo deja quieto (ya está en `globals.css`).

## Iconos

**Ninguno**, salvo la marca de volantín que ya existe. Elegir un set (Lucide,
Phosphor, el que sea) es peor que no usar iconos: aquí no hay nada que un icono
explique mejor que la palabra.

## Copy

Chileno, declarativo, específico. El H1 es el veredicto mismo, no una frase sobre
el producto. La bajada nombra hora y lugar reales.

Prohibido: titular aspiracional ("Vuela más alto", "Todo lo que necesitas para…"),
cualquier frase que sirva igual para otra app.

## Lista de exclusión (prohibición → alternativa)

| No | En su lugar |
|---|---|
| Split hero texto-izquierda / ilustración-derecha | Fold completo ocupado por el veredicto |
| Badge/pill sobre el H1 | Nada. La palabra sola |
| Fila de tres feature cards | El fold 2 es una sola regla de bandas |
| Formato de landing de 9 secciones | Dos folds, y punto |
| Inter / Geist / Space Grotesk / DM Sans | Archivo variable, un eje de ancho |
| Azul o degradado de fondo | Fondo = banda del veredicto de hoy |
| `border-l` de acento, fondo tintado de alerta | Superficie sólida de banda + peso tipográfico |
| Sombras y glassmorphism | Superficie contra superficie |
| Set de iconos | Sin iconos |
| Imagen de stock, blob 3D, grid/dot de fondo | El dato real es el visual |
| Contador de usuarios, "trusted by", testimonios | La fuente y la hora de actualización |
| Indicador verde "All systems operational" | "Actualizado hace X" con valor real |

## Filosofía (para juzgar lo que los tokens no cubren)

1. Si un elemento no cambia cuando cambia el viento, probablemente sobra.
2. El color y el número son información; nada en la página decora.
3. Declarar, no convencer. La página dice una cosa y se calla.

## Advertencia anti-Ola-3

Dos riesgos propios de esta dirección: (a) la grotesca variable llevada al extremo
de ancho es un gesto que se está volviendo común en 2026 — lo que mantiene esto
específico es que el salto de ancho ocurre **solo** en la palabra del veredicto;
(b) "la página es el dato en vivo" se puede volver un truco. Sostiene solo mientras
el dato sea verdadero y la página no gane secciones.
