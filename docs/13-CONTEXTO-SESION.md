# Contexto para retomar Encumbra

Pegar esto al abrir una sesión nueva.

---

## El proyecto

**Encumbra** dice dónde y cuándo encumbrar un volantín en Santiago. Mira el
viento de 17 parques con datos de Open-Meteo y responde una sola pregunta:
¿anda o no anda? Su público es cualquiera que quiera salir a volar un volantín,
no gente que sepa leer datos meteorológicos. Un niño saliendo del colegio, un
adulto planeando el sábado.

**Stack:** Next 16 (App Router), React 19, TypeScript, CSS propio en
`app/globals.css` (Tailwind está instalado pero casi no se usan utilidades),
MapLibre 6 para el mapa, pnpm, Node 22 (`.nvmrc`).

**Rutas:**
- `/` landing
- `/app` la app shell (explorar parques, mi salida, prepararme)
- `/volar` pantalla de terreno, "ya estoy en el parque"

**Arquitectura:** `lib/` es lógica pura, no importa nada de `app/` ni
`components/` y no toca el DOM. Por eso es testeable con `node --test` sin
navegador ni mocks. Los tests viven en `test/*.test.ts` y son 82, todos en
verde. No hay framework de tests: `node --test` con type stripping nativo.

**Correr los tests:** `nvm use 22 && node --test test/*.test.ts`
Con el Node del sistema (v20) fallan con `ERR_UNKNOWN_FILE_EXTENSION`. Y
`node --test test/` sobre el directorio no toma los `.ts`: hace falta el glob.

---

## Dos trampas del entorno que cuestan horas

**1. Turbopack no recompila `globals.css`.** Al editar el CSS, el chunk servido
sigue igual: mismo hash, mismo tamaño, aunque pasen doce peticiones. Lo único
que funciona es reiniciar el dev server borrando `.next` entero. Si un cambio
de CSS "no se ve", casi siempre es esto y no el código. Se verifica así:

```bash
C=$(curl -s http://localhost:3002/ | grep -o '/_next/static/[^"]*\.css' | head -1)
curl -s "http://localhost:3002$C" | grep -c "mi-clase-nueva"
```

**2. `agent-browser` no ejecuta `requestAnimationFrame`.** Cualquier cosa que
dibuje desde un bucle de render (MapLibre, canvas animado) se ve rota ahí
aunque funcione perfecto en el navegador real. Comprobar antes de diagnosticar:

```js
new Promise((r) => { let n = 0; const t = () => { n++; n < 3 ? requestAnimationFrame(t) : r(n); };
  requestAnimationFrame(t); setTimeout(() => r("rAF NO CORRE"), 3000); })
```

---

## Qué hay hecho (commit `ffc5fc5`)

- **Landing en `/`** con el lenguaje visual de la app. Muestra los cuatro
  mejores parques de ahora con datos reales, y cuando no anda dice cuándo sí.
  Los deep links viejos (`/?parque=x&vista=salida`) redirigen a `/app`.
- **Física del volantín** en `lib/fisica.ts`: el hilo es una catenaria real
  resuelta por bisección, atada a la brida y no al centro de la vela. El ángulo
  del hilo sube hasta 64° con viento ideal y baja a 46° con viento bravo.
- **Paleta sin semáforo:** el color dice cuánta energía tiene el aire, no si
  algo es bueno o malo. Lima marca el tramo que vuela, rojo se reserva al
  peligro real. Las diez combinaciones verificadas en AA.
- **Tipografía unificada** en Archivo variable (antes `--font-archivo` cargaba
  DM Sans, con ese nombre).
- **Datos nuevos de Open-Meteo:** dirección de viento, nubosidad y código WMO,
  para distinguir despejado de nublado y lluvia real de pronóstico de lluvia.
- **Mapa arreglado:** MapLibre 6 no encuentra su worker bajo Next, hay que
  copiarlo a `public/` (`scripts/vendor-maplibre.mjs`, enganchado a `dev` y
  `build`) y llamar `setWorkerUrl`. Ver `docs/` y el commit `99084f0`.

---

## Lo que falta, y es lo importante

**El fondo y la onda visual.** Kath quiere que la landing y `/volar` sean algo
que dé ganas de sacarle screenshot y compartir: moderno, juvenil, con
identidad propia, y **sin pastel**. Que además sea útil y sorprendente.

Dejó tres referencias en **`~/Desktop/inspiracion/`**. Mirarlas antes de
proponer nada, y no copiarlas: extraer la decisión (paleta, tipo de gradiente,
cómo tratan la profundidad, qué se mueve y cuánto), no el pixel.

### Lo que ya se intentó y ella rechazó, para no repetirlo

1. **Bloque de color plano** con el veredicto gigante ocupando la pantalla:
   rompía con la app, no presentaba el producto y desincentivaba entrar.
2. **Gráfico de líneas** del viento de 12 horas: "una simpleza", es el
   componente más estándar que existe.
3. **Campo de partículas** tipo Windy: le habla a un meteorólogo, no a alguien
   que quiere salir a volar. Su crítica exacta: "¿qué le dice eso a un
   adolescente? ¿a un niño después del colegio?".
4. **Cielo dibujado** con sol redondo y cerros en zigzag: "parece dibujo
   infantil". Se reemplazó por crestas con curvas y luz difusa, pero igual no
   funcionó.
5. **Cielo saturado con velo oscuro** para la legibilidad: el velo se comió el
   día y "parecía cielo nocturno". Todo eso ya está revertido.

El compromiso que hay que resolver bien: un cielo con color de verdad deja el
texto oscuro en 1.89 de contraste. Aclararlo lo vuelve pastel. La salida no es
ninguno de los dos extremos.

### Pendiente concreto y chico

Recuperar del v1 (`github.com/imkath/encumbra`) las dos advertencias de
seguridad que se perdieron. Los 17 parques y sus coordenadas están idénticos,
solo faltan estas:

- **Parque O'Higgins:** evitar la zona norte por los tendidos eléctricos
- **Cerro San Cristóbal:** vientos variables por la altura

Un hilo en un tendido eléctrico es un accidente serio y hoy no se advierte.

---

## Cómo trabaja Kath

- Español, buena ortografía, sin guiones largos ni emojis.
- **Commits sin ningún rastro de IA:** nada de `Co-Authored-By` ni firmas.
  Mensajes en inglés, conventional (`feat:`/`fix:`/`docs:`), concretos.
- Quiere criterio, no complacencia: si una idea suya tiene un supuesto frágil,
  decírselo. Y si algo se ve genérico o hecho con plantilla, decirlo también.
- **Verificar antes de mostrarle.** Pedirle que revise algo roto le hace perder
  el tiempo y ya pasó varias veces.
