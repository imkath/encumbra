# Estudio visual Encumbra

Abrir `/propuestas.html` con el servidor local. Propuesta interactiva de septiembre de 2026; no cambia las rutas `/`, `/app` ni `/volar`.

## Qué permite comparar

Cuatro paletas (coral, mandarina, solar, carbón), tres tratamientos de agrupación de parques, selección completa en navegación móvil/escritorio, tres modelos de volantín y siete escenarios. Fondo semántico o hueso con etiqueta. Datos y posiciones de marcadores son ilustrativos; no se calculan pronósticos ni se simula aerodinámica.

La recomendación separa marca (acciones e ilustraciones), selección (carbón) y semántica meteorológica (estados estables entre paletas). Los puntos decorativos junto a actualización y “Ahora” no se usan. La geometría propuesta conecta ambos hilos del delta a sus propios tirantes y el hilo del volantín al mismo nudo dibujado. Cola continua, perfil de papel sin cola; reposo en calma, peligro, noche y sin datos.

## Procedencia

- `archivo-latin.woff2`: Archivo variable ya usada por el proyecto, copiada del asset producido por `next/font/google`. Licencia en `OFL-Archivo.txt`.
- `santiago.png`: captura local del mapa existente de Encumbra, sin marcadores ni controles; OpenFreeMap, OpenMapTiles, OpenStreetMap. Atribución visible en el HTML; licencias originales en `public/maps/`.
- Volantines: geometría SVG original de esta propuesta, sin imágenes generadas. Madero central, costilla curva y cola basados en [Servicio Nacional del Patrimonio Cultural](https://www.patrimoniocultural.gob.cl/noticias/volantines-trompos-emboques-y-rayuela-juegos-chilenos-tradicionales).
- Agrupaciones: [MapLibre](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/).
- Texto además del color: [W3C](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html).
- Relaciones de contraste: cálculo de luminancia relativa sobre fondos planos; no equivalen a una auditoría completa de accesibilidad.

Los nombres y preferencias de paleta son decisiones creativas, no resultados de investigación con usuarios. El documento `DESIGN.md` del sitio sigue describiendo la implementación actual, no esta propuesta pendiente de elección.

## Revisión de color tras feedback

Se reemplazaron los estados pastel por fondos de color pleno. Las cuatro paletas ahora incluyen sus propios tonos semánticos, manteniendo verdes para favorable, amarillo para marginal, naranja para precaución y rojo para peligro. Los selectores junto al teléfono y la galería permiten compararlos sin volver arriba. Papel bicolor más saturado y figuras en reposo ampliadas. Calma y datos ausentes conservan fondos claros cálidos; peligro usa tinta hueso sobre rojo profundo. Solo afecta este comparativo.

## Restricción explícita del usuario

Excluir verde lima, verdes amarillentos fluorescentes y colores neón en todas las opciones, incluidas las ilustraciones y los estados. La energía visual debe surgir de contrastes definidos y colores de papel, no de recurrir a lima. Buen viento usa verde hoja con tinta hueso; se retiró el lima de la opción Papel y tinta.

## Identidad del volantín

Tres estampados independientes (`kiteDesigns`): Franja roja, Sol naranja y Corte de tinta. Sus colores se conservan al cambiar paleta o estado, incluyendo sin datos. El modelo define geometría, tirantes e hilo(s), y la postura responde al escenario. Un contorno doble fijo separa el papel del fondo; únicamente el hilo exterior adapta su claridad. Los tres estampados son propuestas gráficas, no otra versión del logo.

## Referencia de remolino — dirección vigente

El usuario descartó la franja roja por su posible lectura de bandera. Se retiraron los tres estampados anteriores del comparativo. La referencia vigente es el remolino multicolor adjunto por el usuario: papeles en giro, colores equilibrados y separación hueso. Tres combinaciones del mismo motivo (`remolino`, `calido`, `jardin`), fijas entre estados y paletas. Se mantienen geometría y construcción del volantín; el remolino inspira el estampado, no sustituye el objeto. Evitar franjas de bandera, emblemas, estrellas y bloques tricolores. La neutralidad buscada es de significado, no desaturación.

## Silueta vigente — últimas referencias del usuario

Sustituye el cuadrado y el estampado de remolino por una cometa alargada de cuatro puntas, hombros anchos y lados suavemente cóncavos. Interior por paños (`paneles`, `papeles`) o naranja con arcos (`arcos`, recomendado). Cola curva con lazos: sus posiciones y orientaciones se calculan de las mismas Béziers del hilo, evitando piezas flotantes. Delta permanece específico del perfil acrobático. Se conservan colores propios, independientes del clima y de la interfaz.

## Elección confirmada por el usuario

Paleta: **Sol de septiembre**. Acento #FFDA24, secundario #FF563B, hueso #F8F7F2, carbón #252520. Predeterminada en el comparativo. Esta elección corresponde a la paleta, no confirma un estampado del volantín ni aplica todavía los cambios a las rutas del producto.


Nueva variante para comparar: Papel y semitono, predeterminada junto a Sol de septiembre. Vela hueso #F8F7F2, curva carbón #252520 con puntos de tamaño variable, lazos bermellón #F45138. Conserva silueta curva, diseño fijo en todos los estados y alternativas anteriores. El acento secundario solar se ajusta a #F45138. Solo prototipo, sin aplicar a rutas del producto.


Elección confirmada por el usuario: Sol de septiembre + Naranja con arcos. Ambas quedan predeterminadas en el comparativo. Semitono permanece como alternativa. La selección sustituye la propuesta predeterminada anterior; todavía no se aplica a las rutas del producto.


Prueba posterior, solo comparativo: Papel a contraluz. Toma el tono de cada fondo, aclarado hacia hueso y sombreado en la punta. Textura SVG procedural estática compartida entre escena y papel, siguiendo la referencia explícita del usuario. No cambia la elección aplicada al producto (Solar + Arcos), ni incorpora azul o lima a la marca. Contrastes indicados corresponden al fondo base; no son una auditoría del efecto texturizado.


Prueba Vidrio esmerilado (solo HTML): vela transparente con reflejo SVG desenfocado y borde de luz. Es una interpretación visual de vidrio, sin refracción ni muestreo real del fondo mediante backdrop-filter. Comparte la atmósfera de Papel a contraluz y conserva las alternativas. Predeterminada para revisar, sin sustituir Solar + Arcos en el producto.


Corrección de dirección: se retira Vidrio esmerilado y su reflejo blanco. Atmósfera mate comparte grano contrastado entre cielo y vela; selector Con grano/Sin grano. Selector de cielo ilustrativo independiente del viento: sol cálido o nubosidad neutra (sin azul/lima), noche carbón y sin datos hueso. Los veredictos mantienen etiquetas explícitas. No inferir nubosidad del viento al portar esta propuesta: necesitaría datos reales de cielo. Producto sin cambios.


Corrección: Atmósfera mate vuelve a respetar los siete colores semánticos de la paleta seleccionada. El selector de luz solo cambia el gradiente CSS, nunca el color base del estado. Sustituye el comportamiento anterior de fondo amarillo común a los estados diurnos.


Refinamiento aprobado: grano de menor tamaño y contraste, con menor opacidad; se conservan colores semánticos y tratamiento mate. Solo comparativo.


Aplicación confirmada: Sol de septiembre + Atmósfera mate con grano fino se lleva al producto y DESIGN.md. La textura productiva vive en public/textures/paper-fine.svg; colores por estado y geometría preservados. Sustituye la anterior elección aplicada de Naranja con arcos.
