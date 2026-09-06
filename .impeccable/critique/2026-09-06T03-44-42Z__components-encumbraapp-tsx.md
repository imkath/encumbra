---
target: Revisión profunda sin modificar UI
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-09-06T03-44-42Z
slug: components-encumbraapp-tsx
---
Method: dual-agent (A: design_critique_a · B: design_evidence_b)

Commit de referencia: 017ef91. Revisión sin cambios de interfaz. Identidad aprobada: azul eléctrico, lima, Space Grotesk/DM Sans y tres volantines.

Evaluación de diseño independiente: 29/40, juicio heurístico, no certificación ni estudio con usuarios.

| Heurística | /4 | Observación |
|---|---:|---|
| Estado | 3 | Luz subordinada al buen viento |
| Mundo real | 3 | Lenguaje propio, ambigüedad nocturna |
| Control | 3 | Navegación y exploración claras |
| Consistencia | 3 | Calendario con icono de enlace externo |
| Prevención | 2 | Señal de buen momento de noche |
| Reconocimiento | 3 | Marcadores superpuestos |
| Eficiencia | 3 | Baja densidad útil móvil |
| Minimalismo | 3 | Selector y métricas sobredimensionados |
| Recuperación | 3 | Alternativas y reintento; fallos no forzados en esta pasada |
| Ayuda | 3 | Checklist útil, criterios secundarios pequeños |

Plan propuesto, pendiente del usuario:
1. P1: Jerarquizar luz y lluvia junto al viento en Mi salida; evitar que Buen momento domine de noche. Conservar mediciones y límites del modelo.
2. P1: Resolver colisiones en mapa y preservar correspondencia con lista. Evaluar agrupación y etiqueta de selección, sin reducir más los textos.
3. P2: Mejorar densidad útil en móvil y legibilidad: botones de guardado 32×44, filtros de 40px y metadatos diminutos. Compactar selector de tres volantines de ~325px conservando ilustraciones. Revisar duplicación ornamental junto al título.
4. P2: Agrupar búsqueda/ubicación en escritorio. Aclarar barras de rachas frente a números de viento y distinguir noche en horas.
5. P3: Corregir 1 parques, 1 resultados; instrucciones de Guardados deben nombrar Guardar, no marcador; nombrar Agregar al calendario.

Personas: persona de paseo con celular pequeño encuentra pines tapados y poco espacio para comparar; padre/madre nuevo puede confundir buen viento con salida aconsejable; persona con visión reducida enfrenta metadatos pequeños. No se realizaron entrevistas ni auditoría completa de accesibilidad.

Detector: CLI EncumbraApp.tsx exit0, []; navegador 6/32/8 avisos en Parques escritorio/Salida móvil/Prepararme móvil. Categorías observadas: texto pequeño y padding ajustado. Conteos no equivalen a defectos confirmados; registros individuales no capturados. No hay overflow horizontal en página limpia: detector lo introdujo. No atribuir indicador N de Next al producto.

Verificado: búsqueda, Guardados vacío y selección del parque funcionan. Mantener paleta, tipografías, marca, estructura de tres destinos y navegación.

Mapa recomendado: MapLibre + OpenFreeMap, estilo Liberty simplificado propio. Calles y comunas reconocibles, parques visibles, selección azul/lima, sin ruido de POIs irrelevantes. Servicio público gratuito actualmente, sin SLA. Separar cartografía de navegación: Cómo llegar ya abre Google Maps. Comparar antes/después en móviles reales y mantener lista disponible ante fallo.
Fuentes: https://openfreemap.org/ y https://openfreemap.org/quick_start/ y https://maplibre.org/maplibre-gl-js/docs/

Decisión pendiente: aprobar correcciones del producto y decidir si migración de mapa entra en la misma etapa o después.
