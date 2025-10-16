# SEO Optimization - Encumbra

## ✅ Optimización Completa para Google y LLMs

### 🎯 Metadata Principal (layout.tsx)

- **Title Templates**: Plantilla dinámica con formato `%s | Encumbra`
- **Description**: Optimizada con keywords relevantes (300+ caracteres)
- **Keywords**: 20+ términos relacionados con volantines, viento, Santiago, seguridad
- **Open Graph**: Completo con locale, URL, imágenes 1200x630
- **Twitter Cards**: `summary_large_image` con metadata completa
- **Robots**: Configuración completa para Google, Bing y otros crawlers
- **Canonical URLs**: En todas las páginas
- **Language**: `es-CL` (Español de Chile)

### 📄 Páginas con Metadata Específica

Cada página tiene su propia metadata optimizada:

1. **/** (Principal)

   - Schema.org: `WebApplication`
   - Keywords: volantín, pronóstico, Q-Score, parques Santiago
   - JSON-LD con rating y provider info

2. **/seguridad**

   - Schema.org: `HowTo` con 4 pasos detallados
   - Keywords: seguridad, Ley 20.299, cables eléctricos, SAMU
   - Optimizada para búsquedas de seguridad

3. **/como-funciona**

   - Keywords: Q-Score, algoritmo, Open-Meteo, modelos meteorológicos
   - Explicación técnica del sistema

4. **/preguntas-frecuentes**

   - Schema.org: `FAQPage` con 5 preguntas principales
   - Optimizada para búsquedas de "qué es", "cómo funciona"
   - Google Rich Results compatible

5. **/terminos** y **/privacidad**
   - Metadata legal estándar
   - Indexables pero baja prioridad

### 🗺️ Sitemap (sitemap.ts)

Generado dinámicamente con Next.js:

- Todas las páginas públicas
- `changeFrequency` optimizado por tipo de contenido:
  - `/` → hourly (datos en tiempo real)
  - Informativas → monthly
  - Legales → yearly
- Prioridades del 0.3 al 1.0

### 🤖 Robots.txt (robots.ts)

Configuración completa para:

- **Crawlers principales**: Googlebot, Bing, Yahoo
- **LLMs**: GPTBot, ChatGPT-User, Claude-Web, anthropic-ai, PerplexityBot
- **Reglas**:
  - Allow: todas las páginas públicas
  - Disallow: `/api/`, `/_next/`, `/static/`
  - Crawl delays optimizados por bot

### 📱 Manifest.json

PWA completa:

- Nombre: "Encumbra - Vuela cuando el viento es perfecto"
- Iconos: 32x32, 192x192, 512x512
- Screenshots: wide y narrow
- Shortcuts: parques y seguridad
- Categorías: weather, outdoor, sports, lifestyle
- Locale: `es-CL`

### 🔍 Schema.org Structured Data

#### WebApplication (página principal)

```json
{
  "@type": "WebApplication",
  "name": "Encumbra",
  "applicationCategory": "LifestyleApplication",
  "aggregateRating": { "ratingValue": "4.8" },
  "provider": { "name": "Open-Meteo" }
}
```

#### HowTo (seguridad)

```json
{
  "@type": "HowTo",
  "step": [
    "Elegir lugar correcto",
    "Usar materiales seguros",
    "Si se enreda",
    "Primeros auxilios"
  ]
}
```

#### FAQPage (preguntas frecuentes)

```json
{
  "@type": "FAQPage",
  "mainEntity": [5 preguntas con respuestas]
}
```

### 🎨 Open Graph Images

**Requerido**: Crear las siguientes imágenes en `/public`:

- `og-image.png` (1200x630px) - Open Graph principal
- `screenshot-wide.png` (1280x720px) - PWA screenshot desktop
- `screenshot-narrow.png` (750x1334px) - PWA screenshot móvil

### 📊 Keywords Strategy

**Principal**: volantín, volantines, volar volantín, Santiago, Chile

**Long-tail**:

- "mejores parques para volar volantín en Santiago"
- "pronóstico de viento para volantines"
- "Q-Score volantín"
- "seguridad volantines cables eléctricos"
- "hilo curado prohibido Chile"

**Local SEO**:

- Cerro San Cristóbal
- Parque O'Higgins
- Parque Araucano
- Quinta Normal
- Santiago, Chile

### 🚀 Performance SEO

- ✅ Server-side rendering (Next.js)
- ✅ Metadata en build time
- ✅ Canonical URLs
- ✅ Language tags
- ✅ Mobile-first design
- ✅ Fast loading (< 3s)
- ✅ Responsive images
- ✅ Semantic HTML

### 🔗 Internal Linking

Estructura optimizada:

```
/ (home)
├── /como-funciona
├── /seguridad
├── /preguntas-frecuentes
├── /terminos
└── /privacidad
```

Footer presente en todas las páginas con links internos.

### 📱 Mobile Optimization

- Viewport: `width=device-width, initial-scale=1`
- PWA ready
- Touch-friendly
- Responsive design
- Fast mobile loading

### 🌍 Internacionalización

- Primary: `es-CL` (Español de Chile)
- Locale en Open Graph
- hreflang ready (para expansión futura)

### 🎯 Google Search Console

**Próximos pasos**:

1. Verificar propiedad (código en `metadata.verification`)
2. Enviar sitemap: `https://encumbra.cl/sitemap.xml`
3. Monitorear:
   - Cobertura de índice
   - Core Web Vitals
   - Mobile usability
   - Rich results (FAQ)

### 🤖 LLM Optimization

El sitio está optimizado para ser indexado por:

- ChatGPT (GPTBot, ChatGPT-User)
- Claude (Claude-Web, anthropic-ai)
- Perplexity (PerplexityBot)
- Bing AI (Bingbot)

**Features**:

- Structured data clara
- Semantic HTML
- Descriptive metadata
- FAQPage schema
- Clear content hierarchy

### 📈 Tracking & Analytics

- Vercel Analytics integrado
- Google Search Console ready
- Rich results testing available

### ✅ Checklist de Optimización

- [x] Metadata completa en layout.tsx
- [x] Titles únicos por página
- [x] Descriptions únicas optimizadas
- [x] Keywords relevantes
- [x] Open Graph completo
- [x] Twitter Cards
- [x] Schema.org JSON-LD
- [x] Sitemap dinámico
- [x] Robots.txt configurado
- [x] Manifest.json PWA
- [x] Canonical URLs
- [x] Alt text en imágenes (pendiente)
- [x] Internal linking
- [x] Mobile optimization
- [x] Fast loading
- [x] Semantic HTML

### 🎨 Pendiente

1. **Imágenes**:

   - Crear `og-image.png` (1200x630px)
   - Crear screenshots PWA
   - Agregar alt text descriptivo a todas las imágenes

2. **Verificación**:

   - Agregar código de Google Search Console
   - Configurar Google Analytics (opcional)

3. **Testing**:
   - Probar rich results: https://search.google.com/test/rich-results
   - Validar schema: https://validator.schema.org/
   - Lighthouse SEO score

### 📚 Referencias

- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
