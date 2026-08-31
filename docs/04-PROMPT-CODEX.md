# Prompt para Codex

Codex trabaja dentro de este repo, así que el prompt apunta a los documentos en vez de repetirlos. Pegar tal cual, con el repo `encumbra-v2` abierto.

---

````
Vas a construir Encumbra v2 desde cero en este repo. Es una webapp mobile-first
que le dice a alguien en Santiago si anda el volantín, cuándo y dónde.

Hay una v1 que ya existe y se descartó por mala UX, arquitectura desktop-first y
una afirmación falsa sobre los datos. No la copies. El rediseño está decidido y
documentado.

## Antes de escribir una línea, lee estos cuatro archivos completos

- docs/01-ANALISIS-V1.md   qué falló y por qué, con la evidencia
- docs/02-PRODUCTO.md      qué hace la app, los dos modos de uso, el alcance
- docs/03-PLAN.md          arquitectura, contratos, fases, presupuestos
- docs/06-CALIBRACION.md   de dónde sale cada número del dominio
- DESIGN.md                el contrato visual: color, tipografía, forma, exclusiones

Son la especificación. Si algo no está ahí, decídelo leyendo la sección de
FILOSOFÍA del bloque correspondiente, no improvisando. Si encuentras una
contradicción entre dos documentos, detente y pregunta en vez de elegir tú.

## Reglas que no se negocian

1. Server Components por defecto. Exactamente dos islas "use client":
   el interruptor de modo y el refresco del modo volar. Una tercera necesita
   justificación explícita.
2. Cero dependencias nuevas. Sin librería de componentes, sin charts, sin
   iconos, sin gestor de estado, sin fetcher, sin librería de fechas.
   Intl.DateTimeFormat cubre las fechas.
3. Sin framework de tests. node --test con type stripping nativo, Node 22.
4. lib/ es lógica pura: no importa de app/ ni de components/, no toca el DOM.
5. Ningún número del 0 al 100 llega a la pantalla. El score es interno.
6. Nada en la interfaz afirma una diferencia de viento entre parques de la
   misma zona. El modelo tiene celdas de ~11 km y no las ve.
7. Presupuestos: JS de cliente first load bajo 120 KB gzip, y una sola petición
   de red para pintar el veredicto. Verifica con next build al terminar cada
   fase. Si te pasas del techo, corta funcionalidad; no subas el techo.
8. Sin dark mode. Es una decisión tomada, no un pendiente.
9. Revisa la lista de exclusión de DESIGN.md §8 antes de escribir cada
   componente. Si el reflejo que estás por escribir está ahí, usa el destino
   positivo de la columna derecha.

## Orden de trabajo

Sigue las fases de docs/03-PLAN.md §3, en orden, sin adelantarte. Cada fase
tiene un criterio de término explícito. Al terminar cada una, detente y
reporta: qué construiste, el resultado de next build y de node --test, y qué
decisión tomaste donde el documento dejaba espacio.

Empieza por la Fase 0 y la Fase 1. La Fase 1 termina sin una sola línea de UI:
solo dominio con tests en verde. No pases a la 2 hasta que esté.

## Qué hacer con lo que no sabes

Los umbrales de docs/03-PLAN.md §2.1 están calibrados contra la American
Kitefliers Association y cinco años de datos horarios de Santiago, y el
razonamiento completo está en docs/06-CALIBRACION.md. Aun así son una v1
ajustable, no una verdad: déjalos todos en lib/bandas.ts y no los repliques en
ningún otro archivo. Calibrar tiene que ser editar un archivo.

Hay una implementación de referencia en Python en calibracion/calibrar.py, con
las mismas funciones score() y banda(). Tu port a TypeScript tiene que dar
exactamente los mismos resultados en los nueve casos de docs/06-CALIBRACION.md
§5.1. Córrela con python3 calibracion/calibrar.py y compara.

Las 6 zonas de docs/03-PLAN.md §2.4 son la grilla de icon_seamless, no
geografía. Si cambias de modelo hay que recalcularlas. Nómbralas por los
parques que contienen: la grilla corta la ciudad de una forma que ningún punto
cardinal describe.

No cambies el modelo meteorológico sin comprobar la consistencia física de las
rachas. gfs_seamless devuelve rachas menores que el viento medio en el 64% de
las horas, y ese fue el error que costó rehacer esta parte del plan.

No inventes datos. Si necesitas un valor que no está en los documentos y no
puedes derivarlo de la API, márcalo como pendiente de verificar y sigue.
````
