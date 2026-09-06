# Encumbra

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Personas que encumbran volantines en Santiago. El foco en familias y uso al aire libre se deriva de docs/02-PRODUCTO.md; es una hipótesis de público, pendiente de entrevistas reales.

## Product Purpose
Decidir si salir, a qué hora y en qué zona, y consultar las condiciones durante el vuelo.

## Capabilities and Constraints
Next.js y React. Pronóstico Open-Meteo para seis zonas; tres perfiles de volantín; viento, rachas, probabilidad de lluvia, ventanas y puesta de sol. El modo de vuelo conserva datos locales y ofrece calendario. Las diferencias entre parques de una misma zona no están resueltas por el modelo.

## Brand Commitments
Encumbra. Voz chilena cercana, instrucciones concretas y experiencia que refleja el tiempo y el disfrute de elevar un volantín, según el pedido del usuario.

## Product Principles
- La decisión antes que la explicación técnica.
- No confundir un pronóstico con una medición en terreno.
- Conservar perfil y zona entre preparación y vuelo.
- Legibilidad y controles cómodos al aire libre.

## Evidence on Hand
lib/score.ts, lib/bandas.ts, lib/zonas.ts, docs/02-PRODUCTO.md y docs/06-CALIBRACION.md. No hay entrevistas nuevas ni validación de demanda en esta intervención.

## Parque primero — instrucción del usuario
Mobile first. Encontrar un parque cercano, entender cuál resulta adecuado y explorar cualquier otro son tareas principales. Consultar v1 como evidencia histórica sin heredar su UI. Ubicación solo por acción explícita en el buscador. Sin permisos, búsqueda manual por nombre y comuna. El catálogo de coordenadas/comunas procede de lib/parks-data.ts de imkath/encumbra; no implica accesos o seguridad verificados.

## Corrección explícita de experiencia
El usuario rechazó el formato de página interminable. La superficie principal debe funcionar como app de celular: destinos separados, selección persistente y controles accesibles al pulgar. Se reemplaza la landing por Parques/Mi salida/Prepararme. El calendario de salida requiere luz confirmada además de viento: sunrise y sunset reales; sin esos datos no hay recomendación diurna.


Identidad revisada: el usuario rechazó la paleta retro de crema, terracota y verde. La dirección actual busca una experiencia contemporánea intergeneracional, con azul eléctrico, tinta azul y lima funcional; conservar claridad de mapas y controles sin recurrir a nostalgia. No se ha validado preferencia generacional con usuarios.
