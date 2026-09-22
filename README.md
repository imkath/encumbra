# Encumbra

Encumbra convierte el pronóstico de Santiago en una decisión concreta: si el
viento sirve para tu volantín, a qué hora y en qué lugar. Está diseñada para
consultarse desde el teléfono antes de salir y mientras se vuela.

**[Ver aplicación](https://encumbra.nvrkth.com)** ·
**[Decisiones técnicas](docs/ARCHITECTURE.md)**

![Encumbra, pronóstico de viento para volantines en Santiago](https://encumbra.nvrkth.com/opengraph-image)

## Por qué existe

Una velocidad aislada no basta para decidir si encumbrar. Encumbra combina
viento medio, rachas, lluvia, luz disponible y el tipo de volantín, sin ocultar
la incertidumbre espacial de los modelos ni presentar un pronóstico como una
medición en terreno.

La experiencia incluye:

- pronóstico horario para parques de Santiago y para la ubicación solicitada;
- perfiles para volantín liviano, tradicional con cola y acrobático;
- contraste de Best Match, ICON y ECMWF, sin promedios arbitrarios;
- observaciones recientes de estaciones DMC como referencia independiente;
- catálogo y mapa de parques, con autorización y evidencia diferenciadas;
- planificación para hoy o mañana, calendario y modo de consulta en terreno;
- PWA responsive, tema claro/oscuro y funcionamiento degradado sin conexión.

## Ingeniería destacada

- **Dominio verificable.** La clasificación meteorológica vive en funciones
  puras, tiene una única fuente de umbrales y se cubre con pruebas de contrato.
- **Honestidad geográfica.** El GPS se solicita solo por acción explícita, se
  reduce a tres decimales antes de enviarlo y nunca se persiste. La interfaz
  muestra la comuna y la distancia al punto efectivo del modelo.
- **Datos resilientes.** Un cron de Cloudflare actualiza una instantánea en KV
  cada diez minutos. Un fallo del proveedor no reemplaza el último dato válido.
- **Frontend con carga progresiva.** Next.js usa Server Components por defecto;
  MapLibre y su CSS se descargan únicamente al abrir el mapa.
- **Defensa en profundidad.** CSP con nonce, headers de seguridad, secretos en
  Cloudflare, rate limit del endpoint de ubicación, timeouts de red, logs
  saneados y actualización automática de dependencias.
- **Accesibilidad y descubrimiento.** Navegación por teclado, foco visible,
  movimiento reducido, metadatos sociales, canonical, sitemap, robots,
  manifest y JSON-LD sin reseñas ni atributos inventados.

## Calidad verificada

Auditoría del 22 de septiembre de 2026 sobre producción, con Lighthouse 13.5
en perfil móvil:

| Categoría | Puntaje |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

La suite actual contiene **145 pruebas**. `pnpm check` ejecuta pruebas, ESLint,
TypeScript y el build optimizado. CI repite esa cadena y rechaza dependencias
con vulnerabilidades altas conocidas.

## Arquitectura

```mermaid
flowchart LR
    Cron[Cloudflare Cron] --> OM[Open-Meteo / ICON]
    Cron --> DMC[Estaciones DMC]
    OM --> KV[(Workers KV)]
    DMC --> KV
    KV --> Next[Next.js en Cloudflare Workers]
    GPS[GPS solicitado] --> API[/api/ubicacion]
    API --> Point[Best Match + ICON + ECMWF]
    API --> Next
    Next --> UI[Server Components + 2 fronteras cliente]
    UI -. bajo demanda .-> Map[MapLibre]
```

El flujo periódico alimenta los parques. La consulta puntual de ubicación es
deliberadamente independiente: tiene límite de tasa, tiempo máximo de espera y
no escribe coordenadas de usuarios en KV. El detalle de datos, privacidad,
amenazas y decisiones está en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Stack

- Next.js 16, React 19 y TypeScript estricto
- Cloudflare Workers, Workers KV y Rate Limiting
- OpenNext para el despliegue
- Open-Meteo, DMC, OpenStreetMap y OpenFreeMap
- MapLibre GL cargado bajo demanda
- Node Test Runner, ESLint y Playwright con Firefox

No se usa una librería de componentes, estado, fechas, gráficos, iconos o
`fetch`; se prefirió mantener pequeño y auditable el núcleo del producto.

## Desarrollo local

Requisitos: Node 22 y pnpm 10.

```bash
nvm use
pnpm install --frozen-lockfile
pnpm dev
```

Abrir <http://localhost:3000>. Para ejecutar toda la validación:

```bash
pnpm check
pnpm audit --prod --audit-level high
```

El smoke test usa Firefox visible y requiere Playwright para Python:

```bash
ENCUMBRA_BASE=http://localhost:3000 python3 scripts/smoke-firefox.py
```

## Configuración de Cloudflare

`wrangler.jsonc` declara el Worker, KV, cron, observabilidad y límite de tasa.
Las credenciales de DMC son opcionales y se guardan como secretos, nunca en el
repositorio ni en variables públicas:

```bash
pnpm exec wrangler secret put DMC_USUARIO
pnpm exec wrangler secret put DMC_TOKEN
```

Sin ellas, el pronóstico funciona y omite la capa observada. Para validar el
artefacto Cloudflare o desplegarlo:

```bash
pnpm preview
pnpm run deploy
```

## Estructura

```text
app/          rutas, metadatos y handlers HTTP
components/   interfaz y dos fronteras cliente principales
lib/          dominio puro, validación y adaptadores meteorológicos
server/       acceso a KV y DMC, solo del lado servidor
test/         contratos y regresiones con Node Test Runner
calibracion/  análisis reproducible de los umbrales
docs/         arquitectura, decisiones, seguridad y operación
```

## Límites conocidos

- Una celda de modelo no equivale al viento exacto dentro de una plaza o entre
  edificios. La aplicación lo declara y muestra la distancia correspondiente.
- La DMC aporta una estación cercana, no una medición en el parque, y no cambia
  todavía el veredicto del modelo.
- Los umbrales están calibrados con histórico de Santiago, pero requieren más
  validación con salidas reales antes de considerarse definitivos.
- Open-Meteo exige revisar sus condiciones antes de un uso comercial.
- La orientación del teléfono guía la lectura; no reemplaza comprobar el viento
  real y depende de los sensores del dispositivo.

## Licencias y atribuciones

Las licencias del estilo y los datos del mapa se conservan en `public/maps/` y
la atribución permanece visible dentro de MapLibre. El resto del repositorio no
incluye por ahora una licencia de reutilización; publicar el código permite su
revisión, no concede derechos adicionales sobre él.
