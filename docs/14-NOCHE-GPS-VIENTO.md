# Plan: noche, GPS en el punto exacto, dirección del viento y permisos de parque

Documento de trabajo para ejecutar en una sesión de Codex. Escrito el 20 de
septiembre de 2026 contra el commit `93cecec`. Cuatro frentes independientes:
se pueden tomar en cualquier orden, pero el orden sugerido está al final.

**Corrección de partida:** esta app no vive en el VPS. Está en Cloudflare
Workers con OpenNext (`wrangler.jsonc`, Worker `encumbra`, dominio
`encumbra.nvrkth.com`). El VPS de DigitalOcean corre otras cosas. Cada deploy es
manual con `pnpm deploy` hasta que Workers Builds quede conectado a GitHub desde
el dashboard.

---

## Frente D · Permisos de parque (hacerlo primero)

Es el único frente donde el producto hoy afirma algo falso: ofrece como destino
parques donde encumbrar no está autorizado.

### Evidencia

Parquemet publicó el 7 de septiembre de 2026 que se puede encumbrar en **14 de
los 22 parques** de la Red de Parques Urbanos:

| Parque | Comuna | ¿Está en el catálogo? |
|---|---|---|
| La Hondonada | Cerro Navia | sí |
| Brasil | La Granja | sí |
| La Castrina | San Joaquín | sí |
| Bernardo Leighton | Estación Central | sí |
| Cerrillos | Cerrillos | sí |
| La Bandera | San Ramón | sí |
| Mahuidahue | Recoleta | sí |
| De la Familia | Quinta Normal | sí |
| André Jarlán | Pedro Aguirre Cerda | sí |
| La Platina | La Pintana | sí |
| Mapuhue | La Pintana | sí |
| Peñalolén | Peñalolén | sí |
| **Mapocho Río** | Quinta Normal / Cerro Navia | **falta** |
| **Pierre Dubois** | Pedro Aguirre Cerda | **falta** |

Fuentes: [24horas, 10-sep-2026](https://www.24horas.cl/actualidad/nacional/fiestas-patrias-parquemet-informa-la-lista-de-recintos-autorizados)
y [@parquemetminvu en Instagram, 7-sep-2026](https://www.instagram.com/p/DdAFJBpAZRn/).
La infografía oficial de ese post confirma los 14 uno por uno, y precisa que
Mapocho Río queda a caballo entre **Quinta Normal y Cerro Navia**.

### La otra lista: volantinódromos

Circula además una lámina comunitaria, "Volantinódromos de Chile, temporada
2026" (cuenta de volantines de Gaspar), con los puntos donde la gente se junta
de verdad a encumbrar y hacer pichanga. En la Región Metropolitana lista unos
veinte: Lo Martínez, La Platina, El Manantial, La Fábrica, Cerro La Ballena, El
Peral, Cerro Peñalolén, Las Castrinas, Parque Brasil, El Bajo, La Anguita, 3
Poniente, Judea, Los Adobes, Lo Boza, Colina, Melipilla, Talagante y otros, con
temporada (todo el año o solo temporada) y días.

**Esa lámina dice de sí misma, en su propio pie:** "No son lugares autorizados.
Son encuentros espontáneos para disfrutar la tradición". O sea, es una fuente
distinta en naturaleza a la de Parquemet: describe dónde va la gente, no dónde
se puede. Mezclar ambas en una sola lista sería el peor resultado posible,
porque borra justamente la distinción que el producto debería aportar.

Si se incorpora, va como **capa aparte** y con el aviso textual de la propia
lámina. Es decisión de Kath, y la dejo abierta: tiene valor real (es donde se
encuentra gente y ambiente, que es medio punto de encumbrar) y tiene un costo
claro (Encumbra pasaría a nombrar sitios sin permiso, algunos de ellos en
terrenos que no son parques). Yo la dejaría fuera de la v1 de este frente.

**El homónimo, resuelto.** La lámina lista un "Parque Bicentenario" en Av.
Pedro Aguirre Cerda 6100, Cerrillos. Es el **Parque Bicentenario de Cerrillos**,
levantado sobre los terrenos del ex aeropuerto, ~50 ha, a una cuadra de la
estación Cerrillos de Línea 6. **Ya está en el catálogo**, bajo el nombre
"Cerrillos", y está autorizado por Parquemet. El Bicentenario de Vitacura está a
11 km al nororiente y no tiene relación: coinciden de nombre porque ambos
conmemoran el Bicentenario de 2010.

**La lámina se solapa con Parquemet más de lo que parece.** De los diez primeros
puntos, **tres ya están en el catálogo como autorizados**: "San Joaquín / Parque
Las Castrinas" es el Parque La Castrina (el nombre de la lámina es una
deformación), "La Granja / Parque Brasil" es el Parque Brasil, y el Bicentenario
es Cerrillos. Cuando pueden, se juntan igual en los parques autorizados. Los
volantinódromos genuinamente nuevos son bastantes menos de veinte.

#### Coordenadas de la primera tanda

| Punto (lámina) | Comuna | lat | lon | Confianza | Qué es |
|---|---|---|---|---|---|
| Lo Martínez | La Pintana | -33.57713 | -70.62959 | alta (la esquina) | cruce Lo Martínez × Santa Rosa, nodo vial |
| La Platina | La Pintana | -33.56715 | -70.61232 | media-alta | Parque La Platina, ~42 ha; "Observatorio 0444" calza con Av. El Observatorio, su límite norte |
| El Manantial | Maipú | — | — | **no ubicable** | ver abajo |
| La Fábrica | Puente Alto | -33.6283 | -70.6003 | media-baja | cruce El Rodeo × Caletera Acceso Sur; la fuente es comunitaria, no cartográfica |
| Cerro La Ballena | Puente Alto | -33.60183 | -70.55534 | media | centroide del Parque Natural Cerro La Ballena; el "253" no se resuelve |
| El Peral | Puente Alto | -33.57381 | -70.54565 | alta (la esquina) | Av. El Peral × Loma Alta, piedemonte |
| Cerro Peñalolén | Peñalolén | -33.47946 | -70.52441 | alta (la esquina) | Av. Grecia × Diagonal Las Torres, piedemonte con paños eriazos |
| San Joaquín | San Joaquín | — | — | — | **ya en el catálogo**: Parque La Castrina |
| La Granja | La Granja | — | — | — | **ya en el catálogo**: Parque Brasil |
| Parque Bicentenario | Cerrillos | — | — | — | **ya en el catálogo**: Cerrillos |

**La imprecisión de estos puntos no importa para lo que hace Encumbra.** Varios
son esquinas, no recintos: el cruce está bien ubicado, pero el sitio donde se
juntan puede estar a 100 o 500 m, en el eriazo de al lado. Con celdas de
pronóstico de ~12 km, medio kilómetro cae en la misma celda y el viento que se
muestra es idéntico. Se pueden incluir sin mentir, **a condición de que la UI no
prometa precisión**: la dirección tal como la escribió la comunidad ("El Peral
con Loma Alta") es honesta; un pin que sugiera "el lugar exacto es acá", no.

Dos que quedaron sin cerrar, y que no se deben inventar:

- **El Manantial** (Maipú): "parcela 43-44" es numeración de loteo, no
  municipal. La calle Los Agricultores existe, con ~1,5 km de incertidumbre a lo
  largo. Ojo con el falso positivo: lo que devuelven los buscadores con ese
  nombre y esa calle es un **cementerio**, que casi seguro no es el sitio.
- **Cerro La Ballena** (Puente Alto): calle El Cerro bordea el cerro, pero OSM
  no tiene numeración domiciliaria ahí. El 253 está en alguno de sus 1,2 km.

#### Tarea pendiente: segunda tanda

Sin geocodificar todavía, con el texto tal cual de la lámina:

| Punto | Referencia de la lámina |
|---|---|
| El Bajo | Lo Errázuriz 1290 / Cerrillos |
| La Anguita | Los Morros con El Mariscal / San Bernardo |
| 3 Poniente | Av. 3 Poniente entre Campanario y Av. Sur / Maipú |
| Judea | esquina calle Quillín con Judea / Maipú |
| Los Adobes | entrada por calle Trasandino con Lo Ovalle / Quilicura |
| Lo Boza | frente al aeropuerto / Pudahuel |
| Colina | Mural San Alfonso con Reina Norte |
| Melipilla | entrada norte / Aeródromo, y Los Pinos / Carlos Avilés con Lomas de Manso |
| Talagante | al final de calle Monseñor Larraín |

Mismo criterio que la primera tanda: **Nominatim y OSM, nada de conjeturas**. Si
una dirección no se resuelve, se deja fuera con la razón escrita. Dos de estas
aparecen además en la lista de puntos críticos del MOP: "Lo Errázuriz" (Ruta 78)
es El Bajo, y "Sector Aeródromo Melipilla" es el punto de Melipilla. Ese cruce
hay que anotarlo en `riesgoVial`.

**Decisión previa a geocodificar**: Colina, Melipilla y Talagante quedan fuera
del Gran Santiago y arrastran celdas de pronóstico nuevas, cada una con su costo
de cuota. Encumbra dice de sí misma que es de Santiago. Recomendación: dejarlas
fuera de esta ronda y anotarlas, no descartarlas para siempre.

### Coordenadas verificadas

Todas contra OpenStreetMap con el polígono real del parque, comprobando por
ray casting que el punto cae **dentro** del polígono, no solo cerca. Las 12 del
catálogo estaban bien: ninguna cae fuera de su parque. Estas son las que
conviene usar.

| Parque | Comuna | lat | lon | Nota |
|---|---|---|---|---|
| La Hondonada | Cerro Navia | -33.425875 | -70.760074 | más central que la actual; ~26 ha |
| Brasil | La Granja | -33.519262 | -70.613582 | más central; ~48 ha |
| La Castrina | San Joaquín | -33.511944 | -70.629167 | la actual está bien |
| Bernardo Leighton | Estación Central | -33.465516 | -70.694895 | la actual, a 43 m del centro |
| **Bicentenario Cerrillos** | Cerrillos | -33.491826 | -70.697599 | la actual está en el borde sur; ~60 ha |
| La Bandera | San Ramón | -33.542011 | -70.643102 | verificada |
| Mahuidahue | Recoleta | -33.407037 | -70.618319 | forma irregular: el centroide cae **fuera**, usar este |
| De la Familia | Quinta Normal | -33.424020 | -70.680090 | verificada |
| André Jarlán | P. Aguirre Cerda | -33.485221 | -70.669826 | la actual, a 14 m del centro |
| La Platina | La Pintana | -33.566339 | -70.612685 | verificada |
| Mapuhue | La Pintana | -33.591431 | -70.629588 | verificada |
| Peñalolén | Peñalolén | -33.464836 | -70.547211 | verificada |
| **Pierre Dubois** | P. Aguirre Cerda | -33.487853 | -70.671374 | nuevo; 10,6 ha, calza con las 10,7 oficiales |
| **Mapocho Río** | Quinta Normal / Cerro Navia | ver abajo | | nuevo; parque lineal |

**El Bicentenario que se buscaba es el de Cerrillos.** El catálogo ya lo tiene,
bajo el nombre "Cerrillos": su nombre completo es **Parque Bicentenario
Cerrillos**, está autorizado por Parquemet y es el mismo que la lámina de
volantinódromos lista en Av. Pedro Aguirre Cerda. O sea que hay tres parques
Bicentenario en juego y solo uno importa para encumbrar. Vale la pena renombrar
la entrada del catálogo a su nombre completo: buscar "bicentenario" tiene que
llevar al de Cerrillos, no dejar a nadie en el de Vitacura.

Ojo también con **André Jarlán y Pierre Dubois**: son contiguos, a 300 m uno del
otro, y ambos autorizados. Son dos entradas distintas, no un duplicado.

**Mapocho Río no cabe en un pin.** Es un parque lineal de 7 km mapeados (9 km y
52 ha según Parquemet), de Quinta Normal a Cerro Navia, y cruza tres celdas de
pronóstico distintas. Un solo marcador miente sobre dónde queda. OSM lo tiene en
seis tramos, cada uno con punto interior verificado:

| Tramo | Comuna | lat | lon | ha |
|---|---|---|---|---|
| 1 | Quinta Normal | -33.411263 | -70.699573 | 5,4 |
| 2 | Quinta Normal | -33.409980 | -70.715551 | 6,6 |
| 3 | Cerro Navia | -33.412235 | -70.722799 | 7,4 |
| 4 | Cerro Navia | -33.412915 | -70.739898 | 5,3 |
| 5 | Cerro Navia | -33.413042 | -70.751196 | 4,6 |
| 6 | Cerro Navia | -33.413696 | -70.761354 | 9,0 |

Lo lazy y lo honesto coinciden acá: entra como **un lugar por tramo**, con el
nombre del parque y el tramo. No hace falta modelar geometrías ni polígonos;
son seis filas más en el mismo arreglo que ya existe. El acceso principal que
declara Parquemet (Av. Costanera Sur 2596, Quinta Normal, extremo este) no se
pudo geocodificar: queda como dato de texto, no como coordenada.

Dato de terreno que sirve para ordenar la lista: **La Hondonada, Bicentenario
Cerrillos y Mapocho Río son los que tienen paño abierto de verdad**. La Castrina
y Mapuhue son chicos.

### Los nombres y el icono

**Descartado anteponer "Parque" a todo.** En una lista en móvil, la palabra
repetida veinte veces a la izquierda come ancho donde no sobra y no aporta
nada: si todos son parques, decirlo veinte veces no informa. Además habría roto
el buscador, que busca dentro de `"${nombre} ${comuna}"`: escribir "parque"
habría devuelto la lista entera.

**Un icono en su lugar**, y con una condición para que valga la pena: que
**distinga**, no que decore. Un arbolito idéntico en todas las filas es el mismo
ruido que la palabra repetida, solo que más chico. El icono gana si marca a qué
categoría pertenece cada lugar, que es información que hoy no se ve:

| Categoría | Icono | Qué dice |
|---|---|---|
| Parque autorizado | arbolito | se puede, hay fuente |
| Permiso sin confirmar | arbolito atenuado | no sabemos |
| Volantinódromo | volantín | punto de encuentro, sin autorizar |
| Donde estoy | el pin de ubicación que ya existe | tu punto |

Va como un trazo más en `components/Icono.tsx`, que ya tiene 20 y largos, con
el mismo estilo de línea: `viento`, `sol`, `luna`, `pin`, `lluvia`. No entra
ninguna librería de iconos por un árbol. Y el icono **no reemplaza el texto del
estado**: es el atajo visual, la razón sigue escrita. Quien use lector de
pantalla necesita la palabra, no el dibujo.

**Aparte del icono, hay nombres que igual hay que arreglar**, porque son un
problema distinto y el icono no lo toca:

- `de la Familia`, en minúscula y suelto, no es un nombre sino un fragmento.
- `Brasil` solo es un país; `Peñalolén` y `Cerrillos` solos son comunas, y
  `Cerrillos` figura hoy a la vez como nombre y como comuna de la misma fila.
- `Cerrillos` es en realidad el **Parque Bicentenario Cerrillos**, y ese nombre
  sí importa: es el que la gente busca.

O sea: el campo guarda el nombre correcto de cada lugar, que en algunos casos
incluye la palabra y en otros no. Lo que se descarta es la regla mecánica de
ponérsela a todos.

### La tercera fuente: los puntos críticos del MOP

El MOP publica cada año, para Fiestas Patrias, un mapa de puntos críticos por
volantines **al costado de autopistas**. La versión más detallada que encontré
lista 38 puntos en la Región Metropolitana, repartidos por concesionaria:
Vespucio Norte 8, Autopista Central 14, Vespucio Sur 1, Ruta 78 6, Costanera
Norte 3, Ruta 68 3 y AVO I 2
([gob.cl](https://www.gob.cl/noticias/38-puntos-mas-riesgosos-elevar-volantin-santiago/),
8-sep-2024; el MOP ha publicado versiones con 20, 35 y 38 puntos según el año,
así que el número cambia y la lista hay que fecharla).

**Por qué aparecen lugares pegados a parques donde sí se puede.** Porque las dos
listas no hablan de lo mismo:

- Parquemet habla de **recintos**: dónde se autoriza encumbrar.
- El MOP habla de **bordes de autopista**: dónde los niños cruzan la calzada a
  perseguir un volantín cortado. Su campaña se llama "Que tu vida no dependa de
  un hilo" y el riesgo que describe es atropello, no el volantín en sí.

El caso que lo deja claro es **Parque La Bandera**: está en los 14 autorizados
de Parquemet **y** en los 38 puntos críticos del MOP, bajo Vespucio Sur. No es
una contradicción. El parque está autorizado y el borde de la autopista que pasa
al lado es peligroso. Las dos cosas son ciertas a la vez.

Lo mismo pasa con dos de los volantinódromos: "Lo Errázuriz" aparece en la lista
del MOP por Ruta 78 y es justo donde la lámina ubica el punto "El Bajo"; y
"Sector Aeródromo Melipilla" aparece en ambas.

**Consecuencia de diseño: permiso y riesgo son ejes independientes.** Un lugar
puede estar autorizado y ser riesgoso. Modelarlos como un solo semáforo obliga a
mentir en uno de los dos. Son dos campos:

```ts
permiso: "autorizado" | "no-autorizado" | "sin-confirmar" | "punto-de-encuentro";
riesgoVial?: string; // "Vespucio Sur pasa al lado", con la fuente y el año
```

No hace falta modelar los 38 puntos ni calcular distancias a autopistas: no hay
una fuente geográfica publicada de esos puntos y derivarla de OpenStreetMap es
un proyecto aparte. Basta anotar a mano el puñado de lugares del catálogo que
aparecen en la lista, y que el texto diga lo concreto: no "zona de riesgo", sino
que la autopista está al lado y que el peligro es cruzarla persiguiendo un
volantín.

Y una regla que no depende del lugar y vale en todos: **el hilo curado está
prohibido**, y es lo único que las tres fuentes prohíben de forma explícita.

### Trabajo

1. En `lib/parques.ts`, agregar a cada entrada de `UBICACIONES`:
   ```ts
   permiso: "autorizado" | "no-autorizado" | "sin-confirmar";
   fuente: string; // URL, para poder auditar el dato en seis meses
   ```
   Doce parques quedan `autorizado`, San Cristóbal `no-autorizado`, los cuatro
   municipales `sin-confirmar`.
2. Agregar Pierre Dubois y los seis tramos de Mapocho Río con las coordenadas
   verificadas de arriba, y corregir las cinco que quedaron en el borde o fuera
   del centro. `lib/zonas.ts` deja de escribirse a mano: las celdas se calculan
   desde las coordenadas, según [`15-ARQUITECTURA-DATOS.md`](15-ARQUITECTURA-DATOS.md).
3. **El catálogo solo afirma lo que sabe.** Esta es la regla de fondo del
   frente, y de ella salen las tres reglas de pantalla:
   - Los 14 `autorizado` son los destinos que la app propone. Son los únicos
     lugares donde Encumbra dice "acá se puede", porque son los únicos donde
     hay una fuente que lo dice.
   - `no-autorizado` (San Cristóbal) no se ofrece como destino. Aparece solo si
     se busca por nombre, con la razón visible, para que quien lo tenía en mente
     entienda por qué no está en vez de creer que a la app le falta un parque.
   - `sin-confirmar` (los cuatro municipales) sale de la lista de propuestas y
     queda buscable, con una línea sobria: "permiso no confirmado con la
     municipalidad". Nada de iconos de alerta rojos, el dato es una omisión de
     fuente, no un peligro. Si alguna municipalidad responde por escrito,
     cambia el campo y vuelve a la lista de propuestas.

   Sacarlos de las propuestas no es perder cobertura: para cualquier lugar que
   el catálogo no cubra está el frente B, que responde "¿anda acá donde estoy?"
   sin que la app tenga que pronunciarse sobre un permiso que no conoce.
4. En la vista "Prepararme", sumar las reglas que Parquemet publica junto con la
   autorización: **hilo curado prohibido** y sancionado, nada de hilo de
   competencia, parques libres de humo y de alcohol, llevarse los restos de
   hilo, papel y madera. Encaja con las tarjetas que ya existen ahí.

Tests: `test/parques.test.ts` ya existe. Sumar un caso de que ningún parque
`no-autorizado` entre en la lista propuesta.

---

## Frente C · Dirección del viento

El dato **ya está**: `crearUrlOpenMeteo()` pide `wind_direction_10m` y cada
`HoraPronostico` lleva `direccion: number | null`. Nadie lo muestra. Este frente
es casi todo presentación.

1. `lib/viento.ts` nuevo, lógica pura y testeada:
   - `cardinal(grados): "N" | "NNE" | ... | "NNO"` (16 rumbos, nomenclatura
     chilena con O de oeste, no W).
   - `frase(grados): string` en lenguaje de parque: "viene del poniente", "del
     sur". Santiago tiene una brisa de valle bastante estable del suroeste en la
     tarde; la frase importa más que los grados.
   - Casos de borde obligatorios en `test/viento.test.ts`: 0, 360, 348.75
     (frontera N/NNO), 11.25, y `null`.
2. **La trampa:** Open-Meteo entrega los grados de donde el viento **sopla**,
   no hacia donde va. Si se dibuja una flecha, decidir una sola convención y
   dejarla escrita en el componente. Recomendación: flecha apuntando hacia donde
   el viento **va** (`rotate(direccion + 180deg)`) con la etiqueta textual
   diciendo de dónde **viene**. Es lo que hacen las apps náuticas y lo que
   coincide con la intuición de ver el volantín irse para allá.
3. Dónde se muestra:
   - `/volar` (`components/Vivo.tsx`): junto a la velocidad, es el dato que
     sirve estando parado en el pasto. La instrucción útil es "ponte de espaldas
     al viento": ahí el volantín sube de frente.
   - Ficha de salida en `EncumbraApp`: en la cinta de horas basta el rumbo
     cardinal, sin flecha; son muchas celdas chicas.
4. `direccion` puede venir `null` (un payload cacheado de antes de pedir el
   campo no lo trae). Toda la UI tiene que aguantar la ausencia sin hueco feo.

---

## Frente A · Noche

Hoy la noche está en dos capas distintas y **ambas** se van a tocar.

### A1 · Que se pueda leer de noche

No hay una sola regla `prefers-color-scheme` en las 3.149 líneas de
`app/globals.css`. La app es únicamente clara, y es una app para usar afuera.

La buena noticia: ya existe una capa semántica de tokens en `:root`
(`--app-bg`, `--app-surface`, `--app-ink`, `--app-muted`, `--app-line`,
`--app-action`, `--app-good`, `--app-warning`, `--app-danger`,
`--color-verdict-bg`…). El tema oscuro es redefinir esos tokens, no reescribir
el CSS.

1. **Antes de nada**, tokenizar los colores sueltos: quedan unos 35 hex fuera de
   `:root` (`#ebe7dc` repetido, `#b6afa0` en tres scrollbars, `#454136`,
   `#70695d`, las sombras `#142337xx`). Mientras estén hardcodeados, el tema
   oscuro se ve roto por partes y nadie entiende por qué.
2. Bloque `@media (prefers-color-scheme: dark)` que redefine los `--app-*`, más
   un `[data-tema="oscuro"]` / `[data-tema="claro"]` en `<html>` para que el
   interruptor manual gane en ambas direcciones. Declarar `color-scheme` para
   que los controles nativos y las barras de scroll acompañen.
3. El mapa: `public/maps/encumbra.json` es un estilo claro de OpenFreeMap. Un
   mapa blanco dentro de una app oscura es exactamente el fogonazo que uno
   recibe en la cara en un parque sin luz. Hace falta una variante oscura del
   estilo (`encumbra-noche.json`) y que `MapaParques.tsx` elija según el tema.
   Cambiar el estilo en caliente con `map.setStyle()` borra las fuentes y capas
   propias: hay que volver a agregar el marcador de ubicación y la fuente de
   parques en el evento `styledata`. Es la parte que más rato toma de todo A1.
4. La paleta `noche` ya existe en `public/design-tokens.css` (`--state-bg:
   #29271f`) y `/volar` la usa cuando cae el sol. Reutilizarla, no inventar otra.
5. **No** poner el interruptor de tema en un menú de ajustes que no existe. Un
   botón en la cabecera, tres estados (sistema / claro / oscuro) o incluso solo
   dos, y `localStorage`. Y un script inline mínimo en `app/layout.tsx` que
   aplique el atributo antes del primer pintado, o la app parpadea en blanco al
   abrirse de noche, que es justo lo que se quiere evitar.

### A2 · Que la noche deje de ser un veto

Hoy el producto **prohíbe** la noche, en tres lugares:

- `lib/salida.ts::lecturasParques` recorta las ventanas contra los periodos
  entre `sunrise` y `sunset` (`tramosDiurnos`): una ventana de viento perfecto a
  las 21:00 simplemente no existe.
- `lib/salida.ts::contextoSalida` devuelve "Espera a que haya luz" para cualquier
  hora nocturna.
- `components/Vivo.tsx` reemplaza el veredicto por "POR HOY / hasta aquí" cuando
  `estadoLuz` da `terminada`, sin importar cómo esté el viento.

El cambio de fondo es de criterio: la noche deja de ser un bloqueo y pasa a ser
una **condición del vuelo**, como la lluvia.

1. `lecturasParques`: dejar de descartar los tramos nocturnos. Cada ventana
   pasa a llevar `deNoche: boolean` (se calcula con los mismos `periodos` que ya
   se arman ahí). `ventanaDiurna` deja de tener sentido como nombre: pasa a
   `ventana` con su bandera.
2. Orden: las ventanas con luz se siguen proponiendo primero. Quien abra la app
   un martes a las 16:00 tiene que ver lo mismo que hoy. La ventana nocturna
   aparece después, rotulada.
3. `contextoSalida`: `luz === false` deja de ser "Espera a que haya luz" y pasa
   a ser un aviso de condición. El contenido correcto no es "cuidado": es
   concreto. Volantín con luces o cintas reflectantes, no perderlo de vista
   nunca, y el hilo invisible en la oscuridad es el riesgo real para terceros
   que pasan caminando.
4. `Vivo.tsx`: el veredicto de la banda vuelve a mandar de noche. La puesta de
   sol sigue mostrándose como dato en el bloque de límites, y la paleta noche
   sigue activándose. Lo que se cae es el "POR HOY".
5. `luzEnHorario` y `estadoLuz` **no se tocan**: son dato correcto. Cambia quién
   decide con ese dato.

Tests: `test/salida.test.ts` y `test/contexto-salida.test.ts` tienen casos que
afirman el veto. Van a fallar, y tienen que fallar: hay que reescribirlos, no
parcharlos.

> **Decisión que quedó abierta:** no propongo un interruptor de "vuelo
> nocturno" guardado en preferencias. Una bandera por ventana y un orden que
> pone la luz primero logra lo mismo sin sumar estado que después hay que
> migrar, sincronizar y recordar. Si prefieres el interruptor explícito, se
> agrega después sobre esta misma bandera.

---

## Frente B · GPS en el punto exacto

Hoy `EncumbraApp.localizar()` pide `navigator.geolocation`, guarda las
coordenadas y las usa **solo** para ordenar parques por distancia. El pronóstico
sale siempre de las seis celdas fijas de `lib/zonas.ts`.

### B1 · Pronóstico en tus coordenadas

1. `lib/openmeteo.ts` está construido alrededor de `ZONAS`. Generalizarlo:
   - `crearUrlOpenMeteo(puntos: readonly {lat, lon}[])` en vez de leer `ZONAS`
     por dentro.
   - `crearPronostico(payload, actualizadoEn, puntos)`: hoy exige
     "exactamente seis zonas". Pasa a exigir que calcen con los puntos pedidos.
   - **Trampa de la API:** con varias coordenadas Open-Meteo devuelve un
     **arreglo**; con una sola devuelve un **objeto**. Normalizar con
     `Array.isArray(payload) ? payload : [payload]` o el parseo revienta en el
     primer uso real.
2. Ruta nueva `app/api/punto/route.ts`, `GET ?lat=&lon=`:
   - Validar que sean números finitos en rango (`lat` -90..90, `lon` -180..180) y
     rechazar con 400. Es un endpoint público: sin validación es un proxy
     gratuito hacia Open-Meteo con el nombre de Kath en los logs.
   - **Redondear a dos decimales** (~1,1 km) antes de consultar. Es el tamaño de
     celda que el modelo ICON puede resolver de verdad y convierte infinitas
     coordenadas en un puñado de claves de caché.
   - Cachear la respuesta con `caches.default` de Cloudflare por 10 minutos,
     igual que `REVALIDAR_SEGUNDOS`. Importa: `open-next.config.ts` es
     `defineCloudflareConfig()` pelado, sin caché incremental, así que
     `next: { revalidate }` **no persiste** entre invocaciones del Worker. Sin
     caché propia, cada apertura de la app es una llamada nueva.
   - El plan gratuito de Open-Meteo da 600 llamadas/minuto, 5.000/hora,
     10.000/día y 300.000/mes, y es solo para uso no comercial
     ([pricing](https://open-meteo.com/en/pricing)). Con caché por celda esto no
     se acerca al techo ni con un peak de 18 de septiembre.
3. Cliente: el punto entra al flujo **como un lugar más**, no como una pantalla
   aparte. `lecturasParques` recibe un sexto parámetro `parques = PARQUES`, y
   cuando hay punto propio se le pasa `[...PARQUES, aqui]` con el pronóstico del
   punto agregado a `pronostico.zonas` con id `aqui`. Cero componentes nuevos:
   la ficha, la cinta de horas y el veredicto ya saben pintar cualquier lugar.
4. Nombre en pantalla: "Donde estoy". Y decir de frente lo que el dato vale: el
   modelo tiene celdas de kilómetros, así que tu patio y el parque a 1 km van a
   dar casi lo mismo. Eso **no** invalida la función: sirve cuando estás en un
   sitio que no está en el catálogo. Pero si la UI insinúa precisión de metros,
   miente.
5. **El punto propio informa el viento, no otorga permiso.** Es la contraparte
   exacta de la regla del frente D: el catálogo afirma solo donde hay fuente, y
   acá la app no tiene ninguna sobre el sitio donde estás parado. Una línea
   basta, dicha una vez y sin dramatismo, del tipo "acá el viento anda; fíjate
   si el lugar permite encumbrar". Lo que **no** puede pasar es que un veredicto
   `ideal` sobre tus coordenadas se lea como que Encumbra autorizó el sitio.
   Ese matiz es todo el trabajo de este punto: son dos frases de copy, no
   código.

### B2 · "Estoy en tal parque"

Es el caso de uso de estar ya en la salida, y es el que más vale de los dos.

1. Botón en `/volar` que pide ubicación y resuelve así:
   - Si estás **dentro o muy cerca** de un parque del catálogo (umbral a
     calibrar, del orden de 300 m contra el punto de referencia del parque, que
     no es el centroide del polígono: varios parques miden más de eso), se fija
     ese parque y se dice cuál, con opción de corregir.
   - Si no, cae al punto exacto de B1.
2. Ese mismo botón es la "segunda opción" en la vista de parques: saltar al más
   cercano.
3. `distanciaKm` en `lib/parques.ts` ya hace haversine correcto. No escribir otro.
4. Manejar los tres fracasos que ya contempla `localizar()` (sin soporte,
   permiso denegado, timeout) y dejar siempre la salida manual. Y ojo: en iOS la
   geolocalización exige HTTPS, que en producción está, pero en `pnpm dev` por
   IP de red local no. Probar con `localhost` o con túnel.

---

## Orden sugerido

1. **D** (permisos). Es dato, es barato y es lo único que hoy está mal dicho.
2. **C** (dirección). El dato ya viaja; es un `lib/` nuevo con tests y dos
   lugares de UI.
3. **A2** (noche sin veto). Lógica pura, tests que reescribir, sin CSS.
4. **B** (GPS). Backend nuevo, pero acotado.
5. **A1** (tema oscuro). El más largo por el mapa y los hex sueltos; se puede
   hacer en paralelo porque casi no toca `lib/`.

## Criterios de aceptación

```bash
nvm use 22 && node --test test/*.test.ts   # los 82 en verde, más los nuevos
pnpm lint
pnpm build
```

- Ningún parque `no-autorizado` se ofrece como destino.
- Con el viento en banda `ideal` a las 21:00, `/volar` da veredicto de vuelo y
  el aviso nocturno, no "POR HOY".
- `/api/punto?lat=-33.45&lon=-70.66` responde un pronóstico; con `lat=abc`
  responde 400; dos llamadas seguidas gastan una sola llamada a Open-Meteo.
- La app abierta de noche no parpadea en blanco, y el mapa tampoco.

## Trampas del entorno, para no perder horas

Están en `docs/13-CONTEXTO-SESION.md`, pero estas cuatro pegan justo en este trabajo:

- **Tests:** `nvm use 22` obligatorio. Con Node 20 fallan con
  `ERR_UNKNOWN_FILE_EXTENSION`, y `node --test test/` sobre el directorio no
  toma los `.ts`: hace falta el glob.
- **CSS:** Turbopack no recompila `globals.css`. Si un cambio de color "no se
  ve", borrar `.next` entero y reiniciar el dev server. Va a pasar seguido en A1.
- **TypeScript:** `noImplicitReturns` está activo. Todo `useEffect` tiene que
  retornar en **todas** las ramas (`return undefined`), o el build muere con
  TS7030. Aplica al efecto nuevo del tema y al de la ubicación.
- **Deploy:** `pnpm`, nunca `npm`. Nada de `export const runtime = "edge"` en la
  ruta nueva: OpenNext se niega a empaquetar rutas edge, y bajo Workers todo
  corre ahí igual.

## Lo que este plan deja afuera a propósito

- Fase lunar y hora de salida de la luna para el vuelo nocturno. Open-Meteo no
  las entrega en la API de pronóstico; traerlas obliga a una segunda fuente.
- Mapa de obstáculos, cables y árboles por parque. No hay fuente de datos y sin
  ella es adivinar.
- Alertas push de "se abrió una ventana". Requiere backend con estado y permiso
  de notificaciones; es otro proyecto.
- **Que la gente aporte lugares** (guardar tu punto con nombre y que lo vean
  otros). Guardar *tus* puntos en `localStorage`, como ya se guardan los
  favoritos, es barato y cabe acá. Compartirlos con terceros no: necesita base
  de datos, moderación y hace que Encumbra publique sitios sin permiso
  verificado, que es justo lo contrario de la regla del frente D. Si se quiere,
  es un proyecto aparte y con esa conversación hecha antes.
- Los siete componentes huérfanos de la v1 (`Veredicto`, `Seguridad`, `Brecha`,
  `Cola`, `InterruptorModo`, `BuscarParque`, `SelectorVolantin`) siguen sin
  borrarse. `InterruptorModo` tiene código de geolocalización que puede servir
  de referencia para B, pero no se importa desde ningún lado.
