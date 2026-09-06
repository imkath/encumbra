---
name: Encumbra — app de parques
description: Explorar parques, revisar una salida y prepararse desde una app móvil.
colors:
  primary: "#3155f5"
  primary-soft: "#e9efff"
  primary-hover: "#2544d6"
  background: "#eef2f8"
  surface: "#f7f9fc"
  ink: "#16223d"
  muted: "#5c6c83"
  line: "#dfe5ef"
  ideal: "#357746"
  ideal-soft: "#eaf4db"
  liviano: "#866316"
  liviano-soft: "#faf0cf"
  plancha: "#5e6f7d"
  plancha-soft: "#ecf0f4"
  bravo: "#a65224"
  bravo-soft: "#fce9da"
  peligro: "#b33242"
  peligro-soft: "#fce5e7"
typography:
  headline:
    fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "25px"
    fontWeight: 720
    lineHeight: 1.15
    letterSpacing: "-0.8px"
  body:
    fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    lineHeight: 1.45
  verdict:
    fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "32px"
    fontWeight: 650
    lineHeight: 1.12
    letterSpacing: "-1.1px"
rounded:
  field: "12px"
  action: "14px"
  panel: "20px"
spacing:
  compact: "10px"
  content: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.action}"
    padding: "10px 12px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.action}"
    padding: "10px 12px"
---

## Overview

App de uso móvil con tres destinos persistentes: **Parques**, **Mi salida** y **Prepararme**. Superficies claras, azul de acción, datos compactos y una marca de volantín. La referencia anterior y su composición de landing son obsoletas: el usuario rechazó la página interminable y pidió una experiencia de app.

Diseño elegido durante la ejecución delegada; no representa un comp aprobado ni entrevistas o validación con usuarios. Esta captura describe la implementación de `app/globals.css`, `components/EncumbraApp.tsx`, `components/MapaParques.tsx`, `components/Icono.tsx` y `lib/salida.ts`.

**Key Characteristics:** navegación siempre accesible, scroll por superficie, mapa real y estados meteorológicos explícitos.

## Colors

### Primary
Azul para acciones, ubicación, selección y destino activo; azul suave para controles secundarios y fondos seleccionados.

### Neutral
Fondo gris frío, superficie casi blanca, tinta azul oscura y divisores tenues. Texto secundario gris para contexto, unidades y procedencia.

Los estados combinan tinta y fondo propios: verde para buen viento, ocre para viento justo, gris para falta de viento o datos, naranja para rachas fuertes y rojo para no encumbrar. Siempre acompañar el color con texto. Los marcadores del mapa usan sus propios tonos cercanos a estas bandas; la selección usa azul.

## Typography

Archivo con respaldo del sistema en toda la app, incluidos los datos. Cabeceras compactas; el título de Mi salida pasa de 29px a 34px en escritorio y el veredicto de 32px a 42px. Texto de filas entre 10px y 15px según función y ancho; búsqueda con entrada de 16px. Horas y mediciones usan números tabulares. No hay un hero editorial.

## Layout

Shell de `100dvh`, mínimo 420px, con cabecera, contenido flexible y navegación inferior; respeta áreas seguras superior e inferior. El contenido limita su desbordamiento y cada pantalla controla su scroll.

En Parques, herramientas arriba, mapa y lista debajo. En móvil el mapa ocupa una fracción de la altura disponible con mínimo 100px; la lista tiene scroll propio y esquinas superiores curvas. Ocultar el mapa deja toda esa zona a la lista. La búsqueda y los filtros permanecen fuera del scroll de resultados.

Mi salida dispone de contenido desplazable y una fila de acciones independiente encima de la navegación: **Cómo llegar** y **Ya estoy afuera**. Esta fila reserva espacio y no cubre el pronóstico. Prepararme desplaza su propio contenido.

Desde 900px, navegación lateral de 88px, cabecera de 76px y explorador con lista de 390px a la izquierda del mapa. Mi salida tiene dos columnas y ancho máximo de 1100px; Prepararme, 640px. Bajo 359px se reducen márgenes a 14px y se compactan controles y texto.

## Elevation & Depth

La estructura se separa con superficies y bordes, sin sombras generales en paneles. Sombras localizadas en controles, etiquetas de mapa y avisos transitorios. Los avisos de mapa conservan la lista como alternativa operativa.

## Shapes

Controles y paneles redondeados según su función; selector rápido y filtros en cápsula. Marcadores circulares, marca geométrica de volantín y perfiles ilustrados con SVG. Iconos de línea en caja de 24 unidades, trazo de 1.7 y extremos redondos; decorativos y ocultos a lectores de pantalla, con el nombre accesible en el control.

## Components

- **Navegación:** tres destinos con icono y etiqueta; `aria-current` identifica el activo. El historial conserva vista, parque y perfil. Al navegar se enfoca el título.
- **Perfil global:** selector rápido de cabecera y radios ilustrados de Prepararme comparten estado: Papel liviano, Con cola y Acrobático. El perfil modifica las lecturas y acompaña el enlace al modo exterior.
- **Explorador:** búsqueda por parque/comuna, filtros y favoritos guardados localmente. Geolocalización solo por acción; la lista sigue disponible sin ubicación o clima. Filas con nombre, contexto, condición textual y acceso al detalle; inicialmente hasta cinco resultados.
- **Mapa:** Leaflet con teselas OpenStreetMap y atribución visible. Marcadores seleccionables y accesibles por teclado; etiqueta visible al seleccionar, enfocar o pasar el puntero. Controles de zoom y ubicación explícitos, zoom por rueda desactivado. Error de carga explicado sin bloquear la lista.
- **Mi salida:** panel tonal con estado, consejo, viento, rachas y lluvia; horas seleccionables en cinta horizontal, barras de racha, puesta de sol, procedencia y actualización. Las frases nombran la probabilidad de lluvia y piden revisarla antes de salir; buen viento no implica ausencia de lluvia.
- **Ventana diurna:** intersección de ventanas de viento con amanecer y puesta de sol del mismo día. Sin amanecer confirmado no se recomienda un horario. La ventana disponible permite descargar calendario y conserva el recordatorio de lluvia. Los parques de una zona comparten pronóstico.
- **Prepararme:** radios de perfil, checklist de tres elementos y recomendaciones en desplegables nativos.
- **Acciones y estados:** principales de al menos 48px de alto (52px en escritorio); botones de icono normalmente de 44px. Foco azul visible de 3px con separación de 3px. Datos ausentes o antiguos se declaran; hay actualización real y avisos con `role="status"`.

## Do's and Don'ts

- **Do** Mantener cada destino dentro del shell y reservar espacio para las acciones persistentes.
- **Do** Conservar etiquetas, foco visible, atribución cartográfica y alternativa de lista.
- **Do** Respetar movimiento reducido: CSS desactiva animaciones/transiciones y Leaflet sus animaciones de zoom y fundido.
- **Don't** Restaurar la landing extensa ni su paleta de papel y petróleo.
- **Don't** Inventar datos, recomendar horas sin luz confirmada o presentar viento favorable como garantía frente a la lluvia.
- **Don't** Afirmar mediciones de terreno o diferencias de viento entre parques que comparten zona.


## Identidad actual

Space Grotesk en títulos y marca; DM Sans en lectura y controles. Azul eléctrico y tinta sobre superficies claras, con lima #d9fc69 para la selección del mapa y la navegación activa. Volantines vectoriales con tres siluetas y paletas reconocibles. Números compartidos entre los resultados y sus marcadores geográficos. La dirección retro fue rechazada por el usuario; no reintroducir crema y terracota como identidad.
