# Encumbra

Webapp mobile-first para saber si anda el volantín, cuándo y en qué lugar de
Santiago. Traduce viento, rachas, lluvia, luz y tipo de volantín en una decisión
simple, sin mostrar el score interno ni inventar diferencias entre parques que
comparten la misma celda meteorológica.

Producción: **[encumbra.nvrkth.com/app](https://encumbra.nvrkth.com/app)**

## Qué incluye

- 15 recintos con autorización respaldada y parques adicionales elegibles,
  como Araucano, con permiso sin confirmar visible en su ficha. Bicentenario de
  Vitacura consta como confirmado directamente por su administración.
- Pronóstico horario para seis celdas de ICON en Santiago.
- Perfiles de volantín liviano, tradicional con cola y acrobático.
- Ubicación explícita como destino propio de «Mi salida», sin asociarla a un
  parque ni guardar la coordenada.
- Lista, búsqueda, favoritos y mapa MapLibre diferido.
- Planificación para hoy o mañana, luz, lluvia y calendario.
- Modo de terreno que conserva el último dato disponible sin señal y muestra
  de dónde viene el viento y hacia dónde va. Su brújula guía la posición del
  piloto y del volantín para despegar, a solas o con ayuda, cuando el navegador
  entrega norte real, en vertical u horizontal.
- Observación cercana de viento DMC en el modo de terreno, con estación y
  antigüedad visibles, cuando el Worker dispone de credenciales oficiales.
- Tema claro u oscuro elegible y persistido en el navegador; antes de elegir
  se respeta el sistema. La noche se informa por separado del viento.

## Arquitectura

- Next.js 16, React 19 y TypeScript.
- Server Components por defecto y exactamente dos fronteras `use client`.
- Lógica de dominio pura en `lib/`.
- Open-Meteo `icon_seamless` como fuente de pronóstico y DMC como capa
  observada opcional; la estación no reemplaza ni recalibra el veredicto.
- Cloudflare Cron cada 10 minutos: valida el pronóstico y lo guarda en una sola
  clave de Workers KV junto con las observaciones normalizadas. Las visitas
  productivas solo leen KV.
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

La DMC entrega las credenciales de web services al confirmar una cuenta del
[Portal de Servicios Climáticos](https://climatologia.meteochile.gob.cl/application/usuario/registroUsuario).
Se configuran como secretos, nunca como variables públicas ni archivos del repo:

```bash
pnpm exec wrangler secret put DMC_USUARIO
pnpm exec wrangler secret put DMC_TOKEN
```

Sin ambos secretos, el cron omite DMC y mantiene íntegro el pronóstico ICON.
En producción están configurados desde el 21 de septiembre de 2026; sus valores
no se guardan en el repositorio ni llegan al navegador.

## Límites conocidos

- El first load productivo medido sigue sobre el presupuesto original de
  120 KB. MapLibre ya está fuera de la carga inicial y no se elevó el techo.
- ICON aún no se ha validado contra una serie observada de la DMC.
- DMC aporta una referencia observada cercana, no una medición dentro del
  parque; una estación ausente o con más de veinte minutos no se muestra.
- No hay fallback meteorológico activo: otro proveedor requiere credenciales y
  recalibración antes de poder emitir las mismas bandas.
- Los encuentros comunitarios no se publican como lugares autorizados ni como
  coordenadas exactas sin evidencia suficiente.
