# Validación física pendiente

Este documento no contiene resultados simulados. Separa lo que puede verificarse
en código de lo que requiere observación real antes de mover los umbrales de
`lib/bandas.ts` o cambiar `icon_seamless`.

## 1. Salida con un volantín

**Estado:** pendiente de una salida real.

Registrar una fila por intento, sin ajustar la app durante la sesión:

| Fecha y hora | Zona de la app | Perfil | Banda mostrada | Viento / racha mostrados | Qué pasó realmente | Observaciones |
|---|---|---|---|---|---|---|
| Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Tipo de volantín, cola, altura aproximada y tirones |

Condiciones mínimas para que la observación sirva:

- usar el mismo volantín durante la serie;
- anotar antes de intentar volar, no de memoria al final;
- registrar también los intentos fallidos;
- no convertir una sola salida en un nuevo umbral;
- cambiar únicamente `lib/bandas.ts` cuando haya un patrón repetido.

## 2. Comparación con una estación DMC

**Estado:** fuente y método confirmados; cálculo pendiente de acceso a la serie.

Estación elegida: **Quinta Normal, Santiago (330020)**. La ficha oficial la
ubica en `-33.444999, -70.682777`, a 520 m, en el valle de Santiago. La DMC
publica viento a 10 m y viento promedio móvil de 2 minutos para esta estación.

Fuentes confirmadas:

- [Ficha oficial de Quinta Normal](https://climatologia.meteochile.gob.cl/application/informacion/fichaDeEstacion/330020)
- [Inventario horario de viento promedio de 2 minutos](https://climatologia.meteochile.gob.cl/application/informacion/inventarioComponentesPorEstacion/330020/149/401)
- [Archivo de pronóstico histórico de Open-Meteo](https://open-meteo.com/en/docs/historical-forecast-api)

El portal confirma 720 observaciones horarias para septiembre de 2025, pero la
descarga mensual exige una cuenta de usuario. El servicio de datos recientes
también exige correo y token personales. No se creó una cuenta ni se eludió ese
control de acceso.

Cuando exista la exportación oficial:

1. descargar septiembre de 2025 para viento medio y racha o máximo horario;
2. pedir el mismo período y coordenada a Historical Forecast API con
   `models=icon_seamless`, `wind_speed_10m` y `wind_gusts_10m`;
3. convertir las unidades oficiales a km/h antes de comparar;
4. alinear por hora UTC, no por posición de fila;
5. calcular por separado sesgo y error absoluto medio para viento y racha;
6. registrar faltantes y tamaño final de la muestra;
7. comparar otro modelo solo con exactamente las mismas horas válidas.

No se declarará que ICON es preciso hasta completar esa tabla. Por ahora sigue
elegido únicamente porque conserva la consistencia física `racha >= viento` en
el payload verificado.
