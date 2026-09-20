# Encumbra

Webapp mobile-first para saber si anda el volantín, cuándo y en qué lugar de
Santiago. Traduce viento, rachas, lluvia, luz y tipo de volantín en una decisión
simple, sin mostrar el score interno ni inventar diferencias entre parques que
comparten la misma celda meteorológica.

Producción: **[encumbra.nvrkth.com/app](https://encumbra.nvrkth.com/app)**

## Qué incluye

- 14 recintos con autorización respaldada y parques adicionales elegibles,
  como Araucano, con permiso sin confirmar visible en su ficha.
- Pronóstico horario para seis celdas de ICON en Santiago.
- Perfiles de volantín liviano, tradicional con cola y acrobático.
- Ubicación explícita como destino propio de «Mi salida», sin asociarla a un
  parque ni guardar la coordenada.
- Lista, búsqueda, favoritos y mapa MapLibre diferido.
- Planificación para hoy o mañana, luz, lluvia y calendario.
- Modo de terreno que conserva el último dato disponible sin señal y muestra
  de dónde viene el viento y hacia dónde va. Su brújula guía la posición del
  piloto y del ayudante para despegar cuando el navegador entrega norte real,
  en vertical u horizontal.
- Tema claro u oscuro elegible y persistido en el navegador; antes de elegir
  se respeta el sistema. La noche se informa por separado del viento.

## Arquitectura

- Next.js 16, React 19 y TypeScript.
- Server Components por defecto y exactamente dos fronteras `use client`.
- Lógica de dominio pura en `lib/`.
- Open-Meteo `icon_seamless` como única fuente meteorológica activa.
- Cloudflare Cron cada 10 minutos: valida el pronóstico y lo guarda en una sola
  clave de Workers KV. Las visitas productivas solo leen KV.
- Amanecer y puesta de sol calculados localmente.
- Pruebas nativas de Node, sin framework adicional.
- Sin librería de componentes, estado, fechas, gráficos, iconos ni fetch.

## Documentación vigente

- [PRODUCT.md](PRODUCT.md): contrato funcional y límites del producto.
- [DESIGN.md](DESIGN.md): contrato visual aplicado.
- [docs/BITACORA.md](docs/BITACORA.md): decisiones, calibración, arquitectura,
  bugs conocidos, descartes, deuda y procedimiento de cambios.
- [AGENTS.md](AGENTS.md): instrucciones operativas para agentes.
- `public/maps/LICENSE*.md`: licencias y atribuciones del estilo de mapa.

Los planes, prompts y reportes intermedios se consolidaron en la bitácora para
que no existan varias fuentes contradictorias.

## Requisitos

- Node 22, definido en `.nvmrc`.
- pnpm.
- Python 3 solo para reproducir la calibración y el smoke test de navegador.

## Desarrollo local

```bash
nvm use
pnpm install
pnpm dev
```

Abrir <http://localhost:3000>. El script de desarrollo copia primero el worker
de MapLibre que Next necesita servir desde `public/vendor/`.

## Verificación

```bash
node --test test/*.test.ts
pnpm lint
pnpm build
python3 calibracion/calibrar.py
```

Smoke en Firefox visible contra producción:

```bash
ENCUMBRA_BASE=https://encumbra.nvrkth.com python3 scripts/smoke-firefox.py
```

No usar `node --test test/`: Node no descubre aquí los archivos TypeScript del
directorio sin el glob.

## Cloudflare

Vista previa:

```bash
pnpm preview
```

Despliegue manual:

```bash
pnpm run deploy
```

Debe usarse `pnpm run deploy`; `pnpm deploy` es otro comando de pnpm. La
configuración de Worker, binding KV y cron vive en `wrangler.jsonc`; el handler
programado vive en `custom-worker.ts`.

## Límites conocidos

- El first load productivo medido sigue sobre el presupuesto original de
  120 KB. MapLibre ya está fuera de la carga inicial y no se elevó el techo.
- ICON aún no se ha validado contra una serie observada de la DMC.
- No hay fallback meteorológico activo: otro proveedor requiere credenciales y
  recalibración antes de poder emitir las mismas bandas.
- Los encuentros comunitarios no se publican como lugares autorizados ni como
  coordenadas exactas sin evidencia suficiente.
