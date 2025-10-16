# 🪁 Encumbra - Vuela cuando el viento es perfecto

**Aplicación web para encontrar las mejores condiciones de viento para volar volantines en Santiago, Chile.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.25-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.18-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Parques Incluidos](#-parques-incluidos)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Deploy a Producción](#-deploy-a-producción)
- [Arquitectura](#-arquitectura)
- [Documentación Adicional](#-documentación-adicional)
- [Sugerencias y Feedback](#-sugerencias-y-feedback)
- [Licencia](#-licencia)

---

## ✨ Características

### 🌪️ Datos Meteorológicos en Tiempo Real

- **API Conectada**: Open-Meteo API para pronósticos meteorológicos precisos
- **19 Parques**: Datos simultáneos de los principales parques de Santiago
- **Caché Inteligente**: Sistema de caché de 30 minutos para optimizar rendimiento
- **Geolocalización**: Selección automática del parque más cercano al usuario
- **Persistencia**: Tu ubicación se guarda localmente para futuras visitas

### 🎯 Decisión Inmediata

- **Evaluación Instantánea**: Respuesta clara SÍ/NO para volar ahora mismo
- **Mejores Ventanas**: Predicción de ventanas óptimas para hoy y mañana
- **Puntaje Q**: Algoritmo personalizado que considera viento, ráfagas y perfil
- **3 Perfiles de Volantín**: Liviano, Estándar, Acrobático con parámetros ajustados

### 📊 Información Detallada

- **Panel de Ventanas**: Lista las próximas 4-6 mejores oportunidades con horarios exactos
- **Factor de Ráfagas (GF)**: Indicador de turbulencia y estabilidad del viento
- **Ranking de Parques**: Top 3 parques con mejores condiciones en tiempo real
- **Distancia y ETA**: Cálculo automático desde tu ubicación actual
- **Mapa Interactivo**: Visualización estilo Google Maps con indicadores de calidad

## 🏞️ Parques Incluidos

**19 parques principales de Santiago - Región Metropolitana:**

1. **Cerro San Cristóbal** - Recoleta
2. **Parque O'Higgins** - Santiago Centro
3. **Parque Bicentenario** - Vitacura
4. **Parque Mahuida** - La Reina
5. **Parque Araucano** - Las Condes
6. **Estadio Nacional** - Ñuñoa
7. **Parque Los Dominicos** - Las Condes
8. **Parque Quinta Normal** - Quinta Normal
9. **Parque Padre Hurtado** - La Reina
10. **Parque La Bandera** - San Ramón
11. **Cerrillos Bicentenario** - Cerrillos
12. **Parque Juan Pablo II** - Maipú
13. **Parque Violeta Parra** - Conchalí
14. **Parque Inés de Suárez** - Providencia
15. **Parque Los Reyes** - Santiago
16. **Parque Balmaceda** - Providencia
17. **Parque La Familia** - Quilicura
18. **Parque André Jarlán** - Estación Central
19. **Parque Alberto Hurtado** - Renca

_Cada parque incluye coordenadas GPS precisas, dirección completa y comuna._

## �️ Tecnologías

### Stack Principal

```
Frontend:
├── Next.js 14.2.25 (App Router + Server Components)
├── React 19.2.0
├── TypeScript 5.x
├── Tailwind CSS 3.4.18
└── Framer Motion 12.23.22 (animaciones)

UI Components:
├── Radix UI (primitivos accesibles)
├── shadcn/ui (componentes base)
├── Lucide React (iconografía)
└── React Icons (iconos adicionales)

Maps & Geolocation:
├── Leaflet 1.9.4
├── React Leaflet 4.2.1
└── Browser Geolocation API

APIs:
├── Open-Meteo (pronósticos meteorológicos - gratis)
└── Resend (email de sugerencias - opcional)

Security & Performance:
├── Middleware de seguridad (CSP, HSTS, XSS Protection)
├── Rate limiting (5 req/hora)
├── Input sanitization
└── Cache strategy (30 min)
```

---

## �🚀 Instalación

### Requisitos Previos

- **Node.js** >= 18.17.0 (recomendado: 20.x)
- **pnpm** (recomendado) o npm
- Git

### Setup Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/imkath/encumbra.git
cd encumbra

# 2. Usar Node.js 20
nvm use 20  # o instalar: nvm install 20

# 3. Instalar dependencias
pnpm install

# 4. Ejecutar en desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

```bash
pnpm dev          # Desarrollo con hot-reload
pnpm build        # Build para producción (genera 14 páginas estáticas)
pnpm start        # Ejecutar build de producción
pnpm lint         # Linter (ESLint)
```

## 🔧 Configuración

### Variables de Entorno

La aplicación funciona **sin configuración adicional** - utiliza APIs públicas gratuitas.

Para habilitar el formulario de sugerencias por email, crea `.env.local`:

```bash
# Email (opcional - ver EMAIL-SETUP.md para guía completa)
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Sin configurar email:** El formulario seguirá visible pero las sugerencias no se enviarán (modo silencioso).

---

## 🚀 Deploy a Producción

### Opción 1: Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/imkath/encumbra)

**O manualmente:**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

**Configuración en Vercel:**

1. Dashboard → Settings → Environment Variables
2. Agregar `RESEND_API_KEY=re_xxxxx` (opcional - solo si quieres emails)
3. Deploy automático en cada push a `main`

### Opción 2: Otros Hostings

```bash
# Build
pnpm build

# La carpeta .next/ contiene el build
# Configurar tu hosting para ejecutar:
pnpm start
```

**Requisitos del hosting:**

- Node.js 18.17+
- Soporte para Next.js App Router
- HTTPS habilitado (para seguridad)

### Dominio Personalizado

**Si tienes `encumbra.cl`:**

1. **En Vercel:** Settings → Domains → Add `encumbra.cl`
2. **En tu DNS provider:**
   ```
   A Record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com
   ```
3. **Esperar:** 5-10 minutos para propagación

---

## 📦 Arquitectura

### Estructura del Proyecto

```
encumbra/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── suggestion/           # Email de sugerencias
│   │   ├── contact/              # Formulario de contacto
│   │   └── geocode/              # Geocodificación inversa
│   ├── layout.tsx                # Layout raíz con metadatos SEO
│   ├── page.tsx                  # Página principal (dashboard)
│   ├── robots.ts                 # SEO: robots.txt dinámico
│   ├── sitemap.ts                # SEO: sitemap.xml automático
│   └── [pages]/                  # Páginas estáticas (Cómo Funciona, Privacidad, etc.)
├── components/                    # Componentes React
│   ├── ui/                       # Componentes base (Button, Card, Dialog, etc.)
│   ├── WelcomeHero.tsx           # Hero con animación de volantines
│   ├── FlyingKites.tsx           # Animación de fondo (Framer Motion)
│   ├── interactive-map.tsx       # Mapa Leaflet estilo Google Maps
│   ├── TopParksRanking.tsx       # Top 3 parques en tiempo real
│   ├── BestWindowPanel.tsx       # Panel de mejores ventanas
│   ├── Footer.tsx                # Footer con formulario de sugerencias
│   └── [otros componentes]/      # AtGlanceCard, SafetyCallout, etc.
├── lib/                          # Lógica de negocio y utilidades
│   ├── volantin-score.ts        # Algoritmo de scoring (Q-Score)
│   ├── find-windows.ts          # Detección de ventanas óptimas
│   ├── wind-windows.ts          # Análisis de ventanas de viento
│   ├── weather-api.ts           # Cliente API Open-Meteo con caché
│   ├── parks-data.ts            # 19 parques con coordenadas GPS
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Helpers generales
├── hooks/                        # React Hooks personalizados
│   ├── use-geolocation.ts       # Hook de geolocalización con caché
│   ├── use-alert-monitor.ts     # Monitor de alertas
│   └── use-toast.ts             # Sistema de notificaciones
├── public/                       # Assets estáticos
│   ├── manifest.json            # PWA manifest (offline support)
│   ├── favicon.ico              # Favicons y app icons
│   └── [iconos de volantín]/    # 192x192, 512x512
├── middleware.ts                 # Security headers (CSP, HSTS, XSS)
├── next.config.mjs              # Configuración Next.js
└── [documentación]/             # SECURITY.md, EMAIL-SETUP.md, etc.
```

### Algoritmos Clave

**1. Q-Score Individual (0-100):**

```typescript
// Distribución gaussiana centrada en viento óptimo según perfil
base = 100 * exp(-((velocidad - óptimo)²) / (2 * sigma²));
penalización_ráfagas = factor_ráfagas(GF);
score = clamp(base - penalización_ráfagas, 0, 100);
```

**2. Window Q-Score (calidad de ventana):**

```typescript
Q = promedio_scores - 15 * max(0, GF_máximo - 1.25) - 0.2 * desviación_std;
// Penaliza turbulencia y variabilidad
```

**3. Factor de Ráfagas (GF):**

```typescript
GF = velocidad_ráfagas / velocidad_promedio;
// GF ≤ 1.3: ✅ Estable | GF > 1.35: ⚠️ Turbulento
```

**Documentación completa:** Ver [`SCORES-GUIDE.md`](SCORES-GUIDE.md) para análisis detallado

## 📡 APIs y Servicios

### Open-Meteo API (Meteorología)

- **URL**: `https://api.open-meteo.com/v1/forecast`
- **Datos**: Velocidad de viento, ráfagas, dirección (10m de altura)
- **Frecuencia**: Actualización cada hora
- **Pronóstico**: 2 días (48 horas)
- **Costo**: Gratuito (sin API key requerida)
- **Cache**: 30 minutos local

### Browser Geolocation API

- **Función**: Detectar ubicación del usuario automáticamente
- **Permisos**: Solicita acceso a GPS/ubicación
- **Precisión**: ~10-50 metros en dispositivos móviles
- **Cache**: 5 minutos en localStorage
- **Fallback**: Selección manual de parque si se deniega

### Resend API (Email - Opcional)

- **Función**: Envío de sugerencias desde footer
- **Configuración**: Ver [`EMAIL-SETUP.md`](EMAIL-SETUP.md)
- **Rate Limit**: 5 emails/hora por IP
- **Costo**: 100 emails/día gratis

---

## 🎨 Design System

### Colores Principales

```css
--brand: #2ea8ff; /* Azul cielo */
--ok: #22c55e; /* Verde - condiciones óptimas */
--mid: #f59e0b; /* Amarillo - condiciones marginales */
--bad: #e11d48; /* Rojo - no recomendado */
--google-green: #34a853; /* Marcador disponible */
--google-red: #ea4335; /* Marcador seleccionado */
--google-blue: #4285f4; /* Usuario en mapa */
```

### Layout Responsive

- **Desktop (>1024px)**: 3 columnas - Dashboard completo
- **Tablet (768-1023px)**: 2 columnas - Mapa compacto
- **Mobile (<768px)**: 1 columna - Stack vertical
- **Accesibilidad**: WCAG AA compliant, ARIA labels

### Animaciones

- **Volantines de fondo**: Framer Motion con paths aleatorios
- **Transiciones**: 200-300ms ease-in-out
- **Hover states**: Escalado y cambios de color sutiles
- **Loading states**: Skeletons y spinners

---

## ⚡ Optimizaciones y Performance

### Sistema de Caché

- **API Weather**: 30 minutos por parque
- **Geolocation**: 5 minutos en localStorage
- **Cálculos**: Memoización de scores y ventanas
- **Build**: 14 páginas pre-renderizadas (Static Generation)

### Bundle Optimization

- **First Load JS**: ~186 kB
- **Shared Chunks**: React, Next.js core
- **Code Splitting**: Por ruta automático
- **Tree Shaking**: Componentes no usados eliminados

### Carga de Datos

- **Paralela**: 19 parques cargan simultáneamente
- **Error Handling**: Reintentos con exponential backoff
- **Stale-While-Revalidate**: Muestra datos expirados mientras actualiza
- **Optimistic Updates**: UI responde inmediatamente

### Performance Metrics (Esperados)

- **Lighthouse Performance**: 90+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1

## 🔍 Troubleshooting

### Error: "Node.js version required"

```bash
Error: You are using Node.js 16.x. For Next.js >= v18.17.0 is required.
```

**Solución:**

```bash
nvm install 20
nvm use 20
pnpm install
```

### Datos no cargan en la app

1. **Verificar conexión a internet** - Open-Meteo requiere conectividad
2. **Revisar consola del navegador** - Buscar errores de API (F12)
3. **Limpiar caché** - `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
4. **Permisos de ubicación** - Verificar que el navegador tiene acceso a GPS

### Geolocalización no funciona

1. **Permisos denegados**: Navegador → Configuración → Permisos → Ubicación
2. **HTTPS requerido**: Geolocation API solo funciona en HTTPS (o localhost)
3. **Timeout**: Si tarda >30s, selecciona manualmente un parque del mapa

### Build falla en producción

```bash
# Limpiar cache y reinstalar
rm -rf .next node_modules
pnpm install
pnpm build
```

### Performance lenta

- **Cache activo**: Los datos se refrescan cada 30 min (comportamiento esperado)
- **Conexión lenta**: La app carga 19 parques simultáneamente (~400KB datos)
- **Dispositivo antiguo**: Considerar reducir número de parques en `parks-data.ts`

---

## 📚 Documentación Adicional

| Documento                              | Descripción                                              |
| -------------------------------------- | -------------------------------------------------------- |
| **[SECURITY.md](SECURITY.md)**         | Auditoría OWASP Top 10, headers de seguridad             |
| **[EMAIL-SETUP.md](EMAIL-SETUP.md)**   | Guía completa de configuración de emails Resend          |
| **[SEO-README.md](SEO-README.md)**     | Estrategia SEO, Schema.org, metadatos                    |
| **[SCORES-GUIDE.md](SCORES-GUIDE.md)** | Algoritmos de scoring y ventanas (documentación técnica) |

---

## 🔒 Seguridad y Compliance

### Security Headers Implementados

```
✅ Content-Security-Policy (CSP)
✅ X-XSS-Protection
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Permissions-Policy
✅ Strict-Transport-Security (HSTS) - Producción
```

### Protecciones Activas

- **Rate Limiting**: 5 requests/hora en API de sugerencias
- **Input Sanitization**: Limpieza de inputs con regex y DOMPurify
- **Email Validation**: Formato + longitud máxima (254 chars)
- **XSS Prevention**: CSP + sanitización de outputs
- **CSRF Protection**: SameSite cookies + Origin check

### Compliance

- ✅ **OWASP Top 10** - Mitigaciones implementadas
- ✅ **GDPR Ready** - Política de privacidad incluida
- ✅ **WCAG 2.1 AA** - Accesibilidad básica
- ✅ **PWA Standards** - Manifest + Service Worker ready

**Auditoría completa:** Ver [`SECURITY.md`](SECURITY.md)

---

## 💬 Sugerencias y Feedback

**¿Tienes ideas para mejorar Encumbra?**

Aunque este proyecto no acepta contribuciones de código directas, ¡me encantaría escuchar tus sugerencias!

### Cómo enviar sugerencias

1. **Formulario en el sitio** (recomendado):

   - Scroll al footer de [encumbra.cl](https://encumbra.cl)
   - Completa el formulario "Envíanos tus sugerencias"
   - Opcional: Deja tu email si quieres respuesta

2. **GitHub Issues**:

   - Abre un issue con la etiqueta `suggestion`
   - Describe tu idea o mejora propuesta

3. **Email directo**:
   - kathcastillosanchez@gmail.com

### Ejemplos de sugerencias útiles

- Nuevos parques para agregar
- Mejoras en la UI/UX
- Errores o bugs encontrados
- Ideas de funcionalidades
- Feedback sobre los algoritmos de scoring

**Nota:** Este es un proyecto personal y todas las decisiones de implementación son tomadas por la autora. Las sugerencias son bienvenidas pero no garantizan su implementación.

---

## 📝 Licencia

**Copyright © 2025 Katherine Castillo - All Rights Reserved**

Este proyecto y su código son propiedad exclusiva de Katherine Castillo. No se permite la copia, modificación, distribución o uso comercial sin autorización expresa por escrito.

Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Créditos y Tecnologías

### APIs y Servicios

- **[Open-Meteo](https://open-meteo.com)** - Datos meteorológicos de alta calidad (API gratuita)
- **[OpenStreetMap](https://www.openstreetmap.org)** - Datos cartográficos colaborativos
- **[Resend](https://resend.com)** - Servicio de email transaccional

### Libraries y Frameworks

- **[Next.js](https://nextjs.org)** - Framework React para producción
- **[Leaflet](https://leafletjs.com)** - Biblioteca de mapas interactivos
- **[Radix UI](https://www.radix-ui.com)** - Componentes accesibles
- **[shadcn/ui](https://ui.shadcn.com)** - Sistema de componentes
- **[Framer Motion](https://www.framer.com/motion)** - Animaciones fluidas
- **[Tailwind CSS](https://tailwindcss.com)** - Framework CSS utility-first

### Hosting

- **[Vercel](https://vercel.com)** - Plataforma de deployment y hosting

---

## 📞 Contacto

- **Sitio Web:** [encumbra.cl](https://encumbra.vercel.app)
- **Sugerencias:** Formulario en el footer del sitio
- **Issues/Bugs:** [GitHub Issues](https://github.com/imkath/encumbra/issues)
- **Email:** kathcastillosanchez@gmail.com
- **Autor:** Katherine Castillo

---

<div align="center">

### ¡Que vuelen alto tus volantines! 🪁

**Encumbra** - Encuentra el momento perfecto para volar

_Hecho con ❤️ por [OBLIQ](https://obliq.kthcsk.me) en Santiago, Chile_

---

**[Ver Demo](https://encumbra.vercel.app)** • **[Reportar Bug](https://github.com/imkath/encumbra/issues)** • **[Sugerir Mejora](https://encumbra.vercel.app#footer)**

</div>
```
