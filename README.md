# Encumbra v2

Webapp mobile-first que responde una sola pregunta: **¿anda el volantín, cuándo y dónde?**
Santiago de Chile, viento en tiempo real, veredicto en una palabra.

Reescritura completa desde cero. La v1 (`imkath/encumbra`) se descartó por UX
desktop-first, un monolito de 1375 líneas y un ranking de parques que afirmaba
diferencias de viento que el modelo meteorológico no puede ver.

## Documentación

| Documento | Qué contiene |
|---|---|
| [`docs/01-ANALISIS-V1.md`](docs/01-ANALISIS-V1.md) | Qué hacía la v1, qué se rescata, qué falló y con qué evidencia |
| [`docs/02-PRODUCTO.md`](docs/02-PRODUCTO.md) | Los dos modos de uso, el alcance, el fundamento de UX |
| [`docs/03-PLAN.md`](docs/03-PLAN.md) | Arquitectura, contratos, fases, presupuestos |
| [`DESIGN.md`](DESIGN.md) | Contrato visual: color, tipografía, forma, lista de exclusión |
| [`docs/06-CALIBRACION.md`](docs/06-CALIBRACION.md) | De dónde sale cada número, con las fuentes y los datos |
| [`docs/04-PROMPT-CODEX.md`](docs/04-PROMPT-CODEX.md) | Prompt de implementación |
| [`docs/05-PROMPT-V0.md`](docs/05-PROMPT-V0.md) | Prompt de exploración visual |

## Estado

Planificación cerrada. Sin implementar.

Los umbrales del dominio están calibrados contra la American Kitefliers
Association y cinco años de datos horarios de Santiago. Se reproduce con:

```bash
python3 calibracion/calibrar.py
```

## Stack

Next 16 · React 19 · Tailwind 4 · TypeScript · Open-Meteo · pnpm · Node 22

## Correr local

```bash
pnpm install
pnpm dev
```
