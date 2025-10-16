# Guía de Sistema de Scores - Encumbra

## 🎯 Resumen del Sistema

La aplicación usa **dos tipos de scores diferentes** que trabajan juntos:

### 1. **Q-Score Individual (0-100)**

Mide la calidad de las condiciones en **una hora específica**.

### 2. **Q-Score de Ventana**

Mide la calidad de una **ventana de tiempo continua** (puede ser negativo o >100).

---

## 📊 Q-Score Individual (Hora por Hora)

### Cálculo

Archivo: `lib/volantin-score.ts` → función `calculateVolantinScore()`

```typescript
Q = base - penGust - penExtra

Donde:
- base = 100 * exp(-((v - 19)²) / (2 * 6²))  // Gaussiana centrada en 19 km/h
- v = velocidad del viento (km/h)
- GF = gust factor = ráfagas / max(v, 1)

Penalizaciones:
- penGust:
  * GF ≤ 1.3: 0 puntos
  * 1.3 < GF ≤ 1.6: hasta 25 puntos
  * GF > 1.6: 25+ hasta 60 puntos
- penExtra: 20 puntos si v < 8 o v > 35
```

### Interpretación

| Score  | Nivel             | Significado                    |
| ------ | ----------------- | ------------------------------ |
| 80-100 | 🔵 Excelente      | Condiciones ideales para volar |
| 60-79  | 🟢 Bueno          | Buenas condiciones             |
| 40-59  | 🟡 Marginal       | Puede requerir ajustes         |
| 0-39   | 🔴 No recomendado | Condiciones no aptas           |

### Uso

- **Condiciones por Hora**: Cada hora muestra su Q-Score individual
- **Decisión Rápida - "Ahora Mismo"**: Usa el Q-Score de la hora actual
- **Ranking de Parques**: Usa el mejor Q-Score individual de las próximas horas
- **Gráfico horario**: Cada barra colorea según su Q-Score individual

---

## 🪟 Q-Score de Ventana

### Cálculo

Archivo: `lib/find-windows.ts` → dentro de función `findWindows()`

```typescript
Q_ventana = meanS - 15 * max(0, maxGF - 1.25) - 0.2 * stdS

Donde:
- meanS = velocidad promedio del viento en la ventana (km/h)
- maxGF = máximo factor de ráfagas en la ventana
- stdS = desviación estándar de la velocidad
```

### Interpretación del Q-Score de Ventana

| Q-Score | Calidad   | Descripción                                                    |
| ------- | --------- | -------------------------------------------------------------- |
| ≥ 15    | Excelente | Ventana muy estable y con buen viento                          |
| 10-15   | Muy buena | Ventana consistente                                            |
| 5-10    | Buena     | Ventana aprovechable                                           |
| 0-5     | Marginal  | Ventana menos consistente                                      |
| < 0     | Mala      | Ventana con problemas (ráfagas fuertes o viento inconsistente) |

### Normalización a 0-100

Archivo: `lib/find-windows.ts` → función `normalizeQScore()`

Para mostrar visualmente en badges, el Q-Score de ventana se normaliza:

```typescript
Q ≥ 15    → 90-100  (Excelente)
Q 10-15   → 75-90   (Muy bueno)
Q 5-10    → 60-75   (Bueno)
Q 0-5     → 40-60   (Marginal)
Q < 0     → 0-40    (Malo)
```

### Uso

- **Decisión Rápida - "Mejor Hoy"**: Usa Q-Score normalizado de la mejor ventana
- **Decisión Rápida - "Mejor Mañana"**: Usa Q-Score normalizado de la mejor ventana
- **Ventanas Recomendadas**: Cada ventana muestra su Q-Score normalizado
- **Lista de Parques Cercanos**: Usa Q-Score normalizado de la mejor ventana del parque

---

## 🎭 Criterios de Filtrado de Ventanas

Archivo: `lib/find-windows.ts` → función `findWindows()`

### Umbrales por Perfil de Volantín

```typescript
Liviano: (S_min = 40), (GF_max = 1.9); // Muy permisivo
Estándar: (S_min = 45), (GF_max = 1.8); // Balanceado
Acrobático: (S_min = 55), (GF_max = 1.7); // Más exigente
```

### Condiciones para formar ventana

Una hora se incluye en una ventana si:

1. **Score individual ≥ S_min** (según perfil)
2. **GF ≤ GF_max** (según perfil)
3. **Precipitación ≤ 30%**

### Ventana mínima

- Duración mínima: **30 minutos continuos**
- Si no hay ventanas con los criterios del perfil, se busca con umbral muy permisivo (S_min=35, GF_max=2.0)

---

## 🔄 Flujo de Datos

### 1. Carga Inicial

```
API Open-Meteo (72 horas)
  → HourlyWind[] con score individual
  → Almacenar en allParksWeather
```

### 2. Procesamiento por Parque

```
HourlyWind[]
  → Convertir a HourPoint[]
  → findWindows() con perfil de volantín
  → Window[] ordenadas por Q-Score
```

### 3. Componentes UI

#### Decisión Rápida (AtGlanceCard)

- **Ahora**: Q-Score individual de hora actual (0-100)
- **Mejor Hoy**: Q-Score normalizado de mejor ventana hoy (0-100)
- **Mejor Mañana**: Q-Score normalizado de mejor ventana mañana (0-100)

#### Condiciones por Hora (HourlyChart)

- Cada hora muestra su **Q-Score individual** (0-100)
- Colores según nivel (Excelente/Bueno/Marginal/Malo)

#### Ventanas Recomendadas (BestWindowPanel)

- Lista de ventanas ordenadas por Q-Score de ventana
- Muestra **Q-Score normalizado** (0-100) en badge
- Muestra velocidad media (meanS) y GF máximo

#### Ranking de Parques (TopParksRanking)

- Ordenados por **Q-Score individual** de mejor hora próxima
- Score mostrado: Q-Score individual (0-100)

---

## ✅ Validación de Consistencia

### Coherencia entre componentes

1. **Hora actual** en "Decisión Rápida" debe coincidir con **primera hora** de "Condiciones por Hora"
2. **Mejor ventana hoy** debe estar dentro de las horas mostradas en "Condiciones por Hora"
3. **Ranking de parques** debe ordenar según condiciones actuales/próximas
4. **Ventanas recomendadas** deben usar Q-Score normalizado para badges (no velocidad del viento)

### Verificaciones importantes

- ✅ Scores individuales siempre usan escala 0-100
- ✅ Q-Scores de ventana se normalizan antes de mostrar en badges
- ✅ Velocidad del viento (meanS) solo se muestra como etiqueta complementaria
- ✅ Todos los badges WindowBadge reciben scores en rango 0-100

---

## 🐛 Problemas Corregidos

### Problema Original

Se estaba usando `meanS` (velocidad promedio) como score en badges, lo que causaba:

- Badges siempre mostrando colores verdes/azules (velocidades 15-25 km/h parecían scores 60-80)
- Inconsistencia visual entre calidad real y color mostrado

### Solución Implementada

- Crear función `normalizeQScore()` para mapear Q-Score de ventana a rango 0-100
- Actualizar todos los usos de ventanas para usar Q-Score normalizado en badges
- Mantener velocidad (meanS) solo como información complementaria

### Archivos Modificados

1. `lib/find-windows.ts` - Agregada función `normalizeQScore()`
2. `app/page.tsx` - Usar `normalizeQScore(w.Q)` en vez de `w.meanS` para badges
3. Mantener estructura existente de componentes

---

## 📝 Notas para Desarrollo

### Al agregar nuevos componentes que muestran scores:

1. Preguntarse: ¿Es un score de hora individual o de ventana?
2. Si es de ventana, usar `normalizeQScore()` antes de pasarlo a WindowBadge
3. Si es individual, usar directamente el score (ya está en 0-100)
4. Documentar claramente qué tipo de score se está usando

### Al modificar algoritmos:

1. Actualizar este documento
2. Verificar que los rangos de normalización sigan siendo válidos
3. Probar con datos reales para validar colores y etiquetas
