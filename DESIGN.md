# Encumbra · sistema visual

Referencia de implementación: `app/globals.css`, `app/layout.tsx` y `components/Marca.tsx`. Actualizado en septiembre de 2026. Este documento reemplaza las indicaciones anteriores sobre azul, lima, DM Sans y Space Grotesk.

## Dirección y alcance

La dirección solicitada por el usuario reúne una paleta cálida, Archivo expresiva y formas redondeadas. El logo definitivo se conserva intacto. La estructura de `/app` también se conserva: aplicar identidad no autoriza reorganizar sus pantallas o navegación.

| Superficie | Propósito | Tratamiento |
| --- | --- | --- |
| `/` | Persuadir y explicar el valor antes de entrar | Titular sólido y de contorno, ficha de pronóstico, pasos, parques y lectura visual del viento. |
| `/app` | Operar: explorar parques, revisar la salida y prepararse | Shell compacto, mapa/lista y navegación persistente; jerarquía de información práctica. |
| `/volar` | Operar afuera, con lectura inmediata | Veredicto grande sólido y de contorno, mediciones y límites de tiempo sobre fondo de estado. |

La elección de valores finos de espaciado, curvas y composición describe la implementación actual; no constituye validación con usuarios ni demuestra mejor conversión o legibilidad exterior.

## Paleta y tokens

Elección confirmada: **Sol de septiembre + Atmósfera mate con grano fino**, aplicada a `/`, `/app` y `/volar` desde el comparativo `public/propuestas.html`.

| Token | Valor | Uso |
| --- | --- | --- |
| `--brand-yellow` | `#ffda24` | Acciones principales y selección horaria |
| `--brand-coral` | `#f45138` | Acento bermellón |
| `--brand-gold` | `#ffae27` | Detalles dorados |
| `--brand-bone` | `#f8f7f2` | Superficie clara |
| `--brand-ink` | `#252520` | Texto y navegación seleccionada |
| `--brand-soft` | `#f9edbb` | Superficie auxiliar |
| `--brand-hover` | `#f3c91c` | Hover de acciones |

La selección de navegación cubre icono y texto con un rectángulo redondeado carbón en móvil y escritorio. Los grupos del mapa indican «N parques» y acercan el mapa al pulsar; no llevan un signo más. Ahora y recién son etiquetas sin puntos decorativos.

## Estados y volantín

Los colores semánticos son independientes de los acentos de marca. Se comparten con `--state-bg`, `--state-ink` y `--state-label`; los textos pequeños fuera de un fondo de estado usan tinta adaptada a hueso.

| Estado | Fondo | Texto sobre fondo |
| --- | --- | --- |
| Ideal | `#287348` | `#faf7ee` |
| Liviano | `#ffc937` | `#27291f` |
| Plancha | `#f6e5ba` | `#27291f` |
| Bravo | `#ff9938` | `#27291f` |
| Peligro | `#c72f27` | `#faf7ee` |
| Noche | `#29271f` | `#faf7ee` |
| Sin datos | `#faf5e4` | `#27291f` |

Los estados se explican con texto, nunca solo con color. Las superficies de pronóstico usan `superficie-mate`: variación tonal continua y grano fino, sin reflejos blancos ni manchas luminosas. De noche el veredicto de viento se conserva y la falta de luz aparece como una condición independiente; sin pronóstico muestra «SIN DATOS / por ahora.».

La interfaz sigue `prefers-color-scheme` con una paleta nocturna propia. El tema
oscuro mejora la consulta de noche, pero no cambia el significado ni los
colores de las bandas meteorológicas.

`VolantinPapel` comparte el dibujo entre portada, exterior, selectores de perfil y marcador del gráfico. Su vela toma el color de la superficie por `--paper-base`, con mezclas hacia hueso (`--paper-light`, `--paper-mid`) y carbón (`--paper-shade`, `--paper-rib`). Sustituye el naranja con arcos de la versión anterior. En iconos pequeños sobre hueso usa una base neutra de mayor contraste para conservar la silueta.

La silueta tiene laterales cóncavos y punta inferior larga. El perfil estándar lleva cola con lazos unidos a las curvas, el liviano no lleva cola y el acrobático tiene vela delta y dos hilos. Cada SVG tiene un recorte y gradiente con identificadores únicos. Las posturas son ilustrativas por banda, no una simulación física: falta de viento, peligro, noche y ausencia de datos muestran reposo.

## Material compartido

`superficie-mate` se aplica a la ficha y parques destacados de portada, el panel de condiciones de `/app` y el fondo de `/volar`. El grano pasa por encima de la ilustración y debajo del texto y controles. No se aplica a toda la página, mapa, navegación ni inputs: esas superficies conservan la claridad del hueso y carbón.

La textura estática local `public/textures/paper-fine.svg` usa `--grain-image`, `--grain-size: 112px` y `--grain-opacity: .48`, con mezcla `soft-light`. Es el grano fino aprobado en el comparativo v14; no se anima, no recibe eventos y se oculta en colores forzados. Su filtro monocromo usa frecuencia .95 y contraste 1.9. Es un acabado gráfico, no representa lluvia, nubosidad ni rachas. No inferir el estado del cielo a partir del viento.

Los colores semánticos permanecen distintos. La variación tonal del material no sustituye el color del estado ni añade brillos de vidrio. La tabla de colores documenta la base; el contraste de la composición final requiere revisión sobre el material, no solo calcular el hex de fondo.

## Tipografía y marca

Archivo variable es la única familia, cargada por `next/font/google` con `display: swap`, eje `wdth` y variable `--font-archivo`. Datos y texto comparten familia; `--font-data` es un alias de Archivo. Las cifras de viento, horas y límites usan números tabulares. La diferencia entre títulos y lectura procede del peso, ancho y tamaño.

Los títulos expresivos alternan relleno y contorno: portada `clamp(54px, 10vw, 88px)` y exterior `clamp(44px, 15vw, 86px)`, ambos con interlínea `0.94`. El contorno usa `text-stroke`; con colores forzados vuelve a texto sólido. Reservar este recurso para mensajes principales, manteniendo etiquetas y mediciones sólidas. Los veredictos usan peso 900; los datos destacados, 500.

`Marca` construye “encumbra” con letras seleccionables, peso 900 y anchos propios del eje variable, más un pequeño volantín opcional. Reutilizar el componente y sus opciones existentes; no redibujar, sustituir su fuente ni modificar sus proporciones o letras.

## Formas, composición y movimiento

Predominan círculos, cápsulas y siluetas de pin con una esquina más cerrada. Los símbolos de parque y marcadores comparten esa familia. Los pasos usan círculos de color; los parques destacados de portada usan un contorno redondeado asimétrico. Evitar círculos y órbitas decorativas detrás del volantín. Usar únicamente el grano fino aprobado mediante el material compartido; las escalas conservan su gradiente funcional.

Radios de referencia: búsqueda 12px, acciones 14px, perfil rápido 16px, pastillas exteriores 22px y panel de viento 28px. La ficha de portada usa `36px 36px 100px 36px`; el bloque del cielo, 32px. El token general `--radius-control` es `0.8rem`, pero los componentes conservan los valores específicos anteriores. Divisores y superficies separan el contenido; las sombras quedan localizadas en mapa y avisos.

`/app` conserva el shell de `100dvh`, cabecera, contenido con scroll por superficie y navegación inferior. Desde 900px pasa a navegación lateral de 88px y cabecera de 76px; el explorador dispone lista y mapa en columnas. Mantener el espacio reservado para acciones y las áreas seguras. La portada permite más espacio y composición en columnas; el exterior adapta la lectura y el vuelo a columnas desde 700px, dentro de un área máxima de 1520px.

El foco visible usa tinta, 3px de grosor y 3px de separación. Los botones principales de app parten en 48px de alto; la acción de portada usa 52px; los botones de icono suelen medir 44px. `--dur-tap` es 160ms y `--ease-out` es `cubic-bezier(0.16, 1, 0.3, 1)`. Respetar `prefers-reduced-motion`, que desactiva animaciones y transiciones.

## Continuidad

- Mantener las tres rutas y su propósito; conservar la estructura operativa de `/app`.
- Reutilizar tokens y `Marca`; evitar variantes locales de la identidad.
- Conservar etiquetas de estado, unidades, procedencia y avisos de datos ausentes o antiguos.
- Revisar tamaños estrechos, foco, contornos y contraste sobre cada fondo al cambiar componentes.
- No documentar decisiones visuales como preferencias validadas o requisitos de producto sin evidencia.


## Vuelo en terreno

`VolantinCampo` mide el contenedor con ResizeObserver para que el hilo llegue al borde inferior real. En móvil sale por el costado derecho para dejar libre el titular; en escritorio, desde abajo del panel lateral. Hilo y vela comparten un grupo que rota alrededor de ese extremo fijo: balanceo de .75° cada 7 s en ideal, .45° con poco viento y 1.2° cada 3.6 s con rachas. Plancha, peligro, noche y sin datos quedan abajo y sin animación. `prefers-reduced-motion` conserva la postura estática. El movimiento es ilustrativo por banda; no representa una simulación física ni una medición instantánea.


## Favicon

`app/icon.svg` y `app/favicon.ico` usan la silueta cóncava del volantín sobre carbón, con papel hueso y una cola solar. Se omite el grano para conservar legibilidad a 16 px. El ICO incluye tamaños 16, 32, 48 y 64 px. No modifica el wordmark definitivo.


Guía visual: public/sistema-diseno.html con estilos en public/design-system.css. Ejemplos generados desde VolantinPapel: actualizar al cambiar la geometría. La guía y el comparativo tienen meta robots y X-Robots-Tag noindex,nofollow,noarchive; no se enlazan desde la navegación del producto. Noindex no constituye control de acceso.


## Fuente compartida y mantenimiento

public/design-tokens.css es la fuente de marca, colores semánticos y parámetros de grano. La app y la guía la importan; no duplicar esos valores para nuevas superficies. `npm run design:sync` regenera los ejemplos de marca y volantín de public/sistema-diseno.html desde componentes reales, manteniendo sus textos de guía. También se ejecuta en build. La página reúne concepto, marca, color, material, tipografía, usos por ruta y reglas de continuidad.


Ajuste autorizado del símbolo final: vela cóncava con cola corta, monocroma y compartida con la guía mediante .marca__volantin. Se conservan exactamente anchos, pesos y espaciado de las letras. El ritmo central de u-m-b es intencional: no separar, colorear o resaltar c-u-m como bloque.

El símbolo del logo apunta hacia arriba y a la izquierda, con vela asimétrica en perspectiva. La parte inferior es más larga y termina abajo a la derecha, donde nace la cola. Perspectiva sugerida por la silueta; sin sombras ni volumen añadido. Las letras permanecen intactas.

El símbolo se sitúa ligeramente sobre la «a» final, con desplazamiento superior y solapamiento óptico leve; las letras y su espaciado permanecen intactos.


## Composiciones responsive de Prepararme y /volar

Prepararme conserva su secuencia de contenido y controles. Hasta 699 px usa una columna; desde 700 px presenta tres perfiles en fila y revisión/seguridad en dos columnas; desde 1100 px separa los perfiles verticales a la izquierda y la revisión, seguridad y acción a la derecha. Ancho máximo 1360 px.

/volar mantiene el flujo móvil hasta 699 px. Desde 700 px usa una retícula de lectura a la izquierda y vuelo a la derecha, cabecera completa y límites debajo de la lectura. Tipografía y cifras crecen con el ancho; el área útil llega a 1520 px. La vela crece dentro de su zona hasta escala 2, conservando el anclaje del hilo y el movimiento reducido.

Verificación en navegador: 320, 390, 768, 1024, 1180, 1440 y 2048 px; tablet vertical y horizontal. No equivale a prueba en dispositivos iPad físicos.


## Explorador y salida responsive

Parques muestra lista y mapa en columnas desde 700 px. En escritorio la lista crece entre 380 y 500 px; hasta 1199 px la condición baja debajo de la identidad para evitar comprimir nombres. Nombre, comuna y recomendación mantienen líneas propias. La vista solo lista ocupa un máximo de 1180 px.

Mi salida usa dos columnas desde 700 px, con un ancho máximo de 1360 px. Pronóstico y elección de hora comparten la composición; la barra de acciones se alinea con ese mismo ancho. La navegación lateral sigue apareciendo desde 900 px.

Revisión de landing, Parques y Mi salida en 390, 768, 1024, 1440 y 2048 px: sin desbordamiento horizontal ni errores JavaScript; búsqueda de parques verificada.


Desde 900 px, Mi salida y Prepararme comparten padding de 32 px, cabecera mínima de 100 px y escala de título. Cambiar parque se sitúa al costado de la cabecera para no desplazar el título.

Agregar al calendario despliega Google Calendar y exportación iCalendar. Se prioriza iCalendar en dispositivos Apple detectados y Google en otros; siempre se ofrecen ambas opciones. No se presume qué aplicaciones están instaladas. El evento incluye la ventana diurna confirmada y el parque, con aviso de pronóstico estimado. Google abre un formulario; iCalendar se sirve desde /api/calendario con fechas validadas y sin caché. La persona confirma el guardado en su calendario.


Mi salida ofrece Hoy / mañana con selector compacto carbón. El día elegido controla horas, ventana diurna, puesta de sol y calendario. Nunca etiquetar una hora futura como Ahora. La fecha se calcula en America/Santiago con aritmética de calendario, incluso en cambios de horario. Sin datos del día, mostrar ausencia en lugar de reutilizar el otro día. Prepararme reúne la explicación del pronóstico en un desplegable. Contacto y sugerencias se enlazan a https://nvrkth.com en el pie de la landing, con firma nvrkth y sin «Un proyecto de».


Prepararme presenta «Para pasarlo bien y volver bien» como bloque de cuidados: dónde encumbrar, qué llevar y cuándo parar. Checklist voluntario de tres revisiones con contador discreto; no bloquea la salida ni certifica seguridad. Los textos siguen legibles al marcar. Hueso y carbón, amarillo suave solo en el contador; sin superficies de alarma decorativas. Cables, hilo curado y explicación del pronóstico permanecen en desplegables. Revisión de interacción a 390, 768 y 1440 px, incluido teclado.
