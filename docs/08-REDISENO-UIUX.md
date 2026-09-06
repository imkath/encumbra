# Rediseño: cielo abierto

## Autoprompt
Soy alguien preparando una salida con un volantín y poco tiempo. Necesito saber si vale la pena salir, cuándo, dónde y qué esperar al tirar del hilo. Diseñar una herramienta cercana que invite a estar afuera y permita decidir sin entender meteorología.

## Plan aplicado
1. Conservar cálculos, perfiles, zonas y flujo de vuelo existentes.
2. Sustituir los bloques de pantalla completa por preparación y veredicto contiguos en escritorio y secuenciales en móvil.
3. Usar cielo suave, papel cálido y tinta petróleo; geometría real de volantín y tonos de papel como identidad.
4. Mostrar estado textual por hora adaptado al perfil, con viento, racha y lluvia al desplegar.
5. Adelantar puesta de sol y explicar el acceso al modo de vuelo.
6. Validar tipos, lint, pruebas de dominio y navegador en móvil y escritorio.

## Criterios
La zona está visible; cada control tiene nombre; el color nunca es la única señal; no inventar clima, lugares seguros, testimonios ni precisión por parque. Diseño directamente en código por la delegación explícita del usuario de pensar, planear y aplicar.

## Verificación final
- `pnpm lint` y `pnpm build`: correctos.
- 42 pruebas de dominio aprobadas; nuevo caso evita recomendar vuelo con viento insuficiente.
- Playwright: escritorio 1440px, móvil 390px, selector de perfil, detalle de hora con lluvia, modo exterior y retorno conservando parámetros. Sin errores JavaScript ni desbordamiento en las capturas.
- Capturas en `.impeccable/reviews/`, obtenidas con fixture interceptado únicamente por un proceso temporal fuera del código del sitio. No corresponden al clima real.
- Revisión independiente: tres hallazgos resueltos (consejo contradictorio, CTA sobre datos, señal de despliegue). Disposición SHIP limitada a esa revisión.
- Limitación externa observada: la respuesta actual de Open-Meteo contiene rachas inferiores al viento medio; el validador existente rechaza todo el payload y muestra el estado sin datos. No se sustituyó por datos ficticios en producción.
