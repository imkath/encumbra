# Encumbra

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Personas que encumbran volantines en Santiago, desde quien prepara una salida
familiar hasta quien ya está en terreno. No se asume conocimiento meteorológico.
El público sigue siendo una hipótesis de producto pendiente de entrevistas.

## Product Purpose
Decidir si salir, a qué hora, con qué tipo de volantín y en qué lugar; consultar
las condiciones durante el vuelo.

## Capabilities and Constraints
Next.js y React. Pronóstico ICON mediante Open-Meteo para seis celdas; tres
perfiles de volantín; viento, rachas, dirección, probabilidad de lluvia,
ventanas y luz calculada localmente. Cloudflare Cron escribe una clave KV y las
visitas solo leen. Cuando existen credenciales oficiales, el mismo cron añade
la última observación válida de estaciones DMC de Santiago al mismo objeto;
esa medición se muestra como referencia cercana, con estación y antigüedad, y
no modifica el veredicto. El modo de vuelo conserva el último dato local. El
mapa es MapLibre y se carga bajo demanda. El modelo no resuelve diferencias
entre parques de una misma celda. En terreno, la dirección distingue
explícitamente de dónde viene el viento y hacia dónde va. La rosa mantiene
norte arriba como base y, tras una acción de la persona, puede orientarse con
el sensor del teléfono sin guardar la lectura. La guía de despegue ubica al
piloto con el hilo a barlovento y el volantín delante, a sotavento; indica en
vivo hacia qué lado girar y confirma la alineación sin mostrar grados. Funciona
igual para quien despega por su cuenta o recibe ayuda: la asistencia no es un
modo ni un requisito. La guía toma como mira la parte superior visible de la
pantalla tanto en vertical como en horizontal.

## Brand Commitments
Voz chilena cercana, instrucciones concretas y una experiencia que se siente
como cielo, papel y septiembre, sin sacrificar legibilidad exterior.

## Product Principles
- La decisión antes que la explicación técnica.
- No confundir un pronóstico con una medición en terreno.
- Conservar perfil y zona entre preparación y vuelo.
- Legibilidad y controles cómodos al aire libre.
- No afirmar permisos, seguridad ni precisión espacial sin evidencia.
- La noche y el viento son condiciones independientes.

## Evidence on Hand
`lib/score.ts`, `lib/bandas.ts`, `lib/zonas.ts`, los tests y
`docs/BITACORA.md`. No hay entrevistas ni validación de demanda.

## Parque primero — instrucción del usuario
Mobile first. Encontrar un parque cercano, saber si el viento sirve y explorar
otros lugares son tareas principales. Ubicación solo por acción explícita y sin
persistencia. La búsqueda manual funciona por nombre y comuna. Solo los lugares
con evidencia de autorización entran en recomendaciones; el pronóstico no
implica acceso ni seguridad.

La selección manual está disponible para todo el catálogo, incluido Araucano y
otros parques con permiso sin confirmar. «Explorar todos los parques», el mapa,
«Cercanos», la búsqueda y «Guardados» incluyen estos lugares con su estado de
permiso visible. Guardarlos o elegirlos no cambia esa condición.

«Mi salida» acepta dos destinos equivalentes: un parque elegido o «donde
estoy». El segundo usa la celda ICON más cercana, no hereda permiso ni nombre
de un parque, no ofrece indicaciones para llegar y vuelve a pedir ubicación al
recargar porque la coordenada no se guarda.

## Corrección explícita de experiencia
El usuario rechazó el formato de página interminable. La superficie principal
funciona como app: Parques, Mi salida y Prepararme, con selección persistente y
controles accesibles al pulgar. Una ventana recomendada requiere viento y luz.
Sin evidencia suficiente se muestra ausencia, no un dato inventado.


Identidad vigente: Sol de septiembre + atmósfera mate con grano fino, Archivo
variable, hueso, carbón y amarillo solar. El usuario rechazó tanto la paleta
retro inicial como la exploración azul/lima. El tema oscuro usa carbón cálido,
nunca azul petróleo; claro y oscuro se pueden elegir y la preferencia queda en
el navegador. `DESIGN.md` es la fuente visual.
