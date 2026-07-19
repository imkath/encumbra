# Encumbra

App para decidir cuándo y dónde volar volantín en Santiago, según el viento y el clima en tiempo real.

## Qué hace

- Índice de vuelo (0-100) a partir del viento, con una curva centrada en la velocidad ideal y penalización por ráfagas según el tipo de volantín
- Clima y viento en tiempo real (Open-Meteo), con reintentos y manejo de límites de la API
- 17 parques de Santiago con coordenadas, para comparar condiciones por lugar
- Vista mobile-first
- Formulario de contacto y de sugerencia de parques (envío por email con rate limiting)

## Stack

- Next.js (App Router) · Tailwind CSS
- Open-Meteo (clima) · Resend (email)

## Correr local

```bash
npm install
npm run dev
```
