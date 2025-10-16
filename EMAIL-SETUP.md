# 📧 Configuración de Email - Resend

Guía completa para configurar el servicio de emails con Resend en Encumbra.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Requisitos Previos](#-requisitos-previos)
3. [Configuración de Resend](#-configuración-de-resend)
4. [Variables de Entorno](#-variables-de-entorno)
5. [Código Implementado](#-código-implementado)
6. [Testing](#-testing)
7. [Troubleshooting](#-troubleshooting)
8. [Alternativas](#-alternativas)

---

## 🎯 Descripción General

**Función:** Enviar sugerencias de usuarios desde el formulario del footer a **kathcastillosanchez@gmail.com**

**Stack:**

- **Servicio:** [Resend](https://resend.com)
- **API Route:** `/api/suggestion` (POST)
- **Rate Limiting:** 5 emails/hora por IP
- **Validación:** Email regex + sanitización de inputs

**Arquitectura:**

```
Usuario → Footer.tsx → /api/suggestion → Resend API → kathcastillosanchez@gmail.com
```

---

## ✅ Requisitos Previos

- Cuenta en [Resend](https://resend.com) (tier gratuito: 100 emails/día)
- Dominio verificado (opcional, puedes usar `onboarding@resend.dev`)
- Node.js 20+ y pnpm instalado

---

## 🚀 Configuración de Resend

### Paso 1: Crear Cuenta

1. Ve a https://resend.com
2. Regístrate con tu email (kathcastillosanchez@gmail.com)
3. Verifica tu email

### Paso 2: Obtener API Key

1. Una vez en el dashboard, ve a **API Keys**
2. Crea una nueva API key:
   - **Name:** `Encumbra Production`
   - **Permission:** `Sending access`
3. **Copia la API key** (solo se muestra una vez)
4. Formato: `re_xxxxxxxxxxxxxxxxxxxxx`

### Paso 3: Verificar Dominio (Opcional)

**Para producción** es recomendado verificar tu dominio propio:

1. Ve a **Domains** en el dashboard
2. Agrega `encumbra.cl`
3. Copia los registros DNS (TXT, CNAME, MX)
4. Agrégalos en tu proveedor de dominio (NIC Chile, Cloudflare, etc.)
5. Espera propagación (puede tomar hasta 48 horas)

**Para desarrollo:** Usa el dominio de Resend:

```typescript
from: "Encumbra <onboarding@resend.dev>";
```

**Para producción (dominio verificado):**

```typescript
from: "Encumbra <noreply@encumbra.cl>";
```

---

## 🔐 Variables de Entorno

### Archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### Vercel (Producción)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_xxxxxxxxxxxxxxxxxxxxx`
   - **Environment:** Production, Preview, Development

### Validación

```bash
# Verificar que la variable existe (local)
echo $RESEND_API_KEY

# En producción (Vercel logs)
# La API key NO debe aparecer en logs
```

---

## 💻 Código Implementado

### 1. API Route: `/app/api/suggestion/route.ts`

```typescript
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting: 5 emails/hora por IP
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const requestLog = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];

  const recentRequests = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }

  recentRequests.push(now);
  requestLog.set(ip, recentRequests);
  return true;
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "").substring(0, 1000);
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 254;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intenta más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { suggestion, email } = body;

    if (!suggestion || typeof suggestion !== "string") {
      return NextResponse.json(
        { error: "La sugerencia es requerida" },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const sanitizedSuggestion = sanitizeInput(suggestion);
    const sanitizedEmail = email ? sanitizeInput(email) : "No proporcionado";

    await resend.emails.send({
      from: "Encumbra <onboarding@resend.dev>",
      to: "kathcastillosanchez@gmail.com",
      subject: "Nueva Sugerencia - Encumbra",
      html: `
        <h2>Nueva Sugerencia</h2>
        <p><strong>Email del usuario:</strong> ${sanitizedEmail}</p>
        <p><strong>Sugerencia:</strong></p>
        <p>${sanitizedSuggestion}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Enviado desde encumbra.cl
        </p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Sugerencia enviada correctamente",
    });
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
```

### 2. Frontend: `components/Footer.tsx`

```typescript
const handleSubmitSuggestion = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!suggestion.trim()) return;

  setIsSubmitting(true);

  try {
    const response = await fetch("/api/suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        suggestion: suggestion.trim(),
        email: email.trim() || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al enviar sugerencia");
    }

    // Éxito
    setSuggestion("");
    setEmail("");
    alert("✅ Sugerencia enviada. ¡Gracias!");
  } catch (error) {
    console.error(error);
    alert("❌ Error al enviar. Intenta nuevamente.");
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🧪 Testing

### 1. Test Local (Development)

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear .env.local con tu API key
echo "RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx" > .env.local

# 3. Iniciar servidor
pnpm dev

# 4. Ir a http://localhost:3000
# 5. Scroll al footer
# 6. Enviar una sugerencia
```

**Resultado esperado:**

- ✅ Mensaje "Sugerencia enviada" aparece
- ✅ Email llega a kathcastillosanchez@gmail.com
- ✅ Logs en consola: `"📧 Email enviado"`

### 2. Test con cURL

```bash
curl -X POST http://localhost:3000/api/suggestion \
  -H "Content-Type: application/json" \
  -d '{
    "suggestion": "Test desde cURL",
    "email": "test@example.com"
  }'

# Respuesta esperada:
# {"success":true,"message":"Sugerencia enviada correctamente"}
```

### 3. Test de Rate Limiting

```bash
# Enviar 6 requests (el 6to debe fallar)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/suggestion \
    -H "Content-Type: application/json" \
    -d '{"suggestion":"Test '$i'","email":"test@example.com"}'
  echo ""
done

# Respuesta del 6to request:
# {"error":"Demasiadas solicitudes. Por favor intenta más tarde."}
```

### 4. Test en Producción

Después del deploy en Vercel:

```bash
curl -X POST https://encumbra.cl/api/suggestion \
  -H "Content-Type: application/json" \
  -d '{
    "suggestion": "Test producción",
    "email": "test@example.com"
  }'
```

---

## 🔍 Troubleshooting

### Error: "Invalid API key"

**Causa:** API key incorrecta o no configurada

**Solución:**

```bash
# Verificar variable existe
cat .env.local | grep RESEND_API_KEY

# Si no existe, crear archivo
echo "RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx" > .env.local

# Reiniciar servidor
pnpm dev
```

### Error: "Failed to send email"

**Posibles causas:**

1. **Rate limit de Resend:**

   - Tier gratuito: 100 emails/día
   - Solución: Esperar 24 horas o upgrade plan

2. **Dominio no verificado:**

   - Solución temporal: Usar `onboarding@resend.dev`
   - Solución permanente: Verificar tu dominio

3. **Email bloqueado:**
   - Gmail puede marcar como spam
   - Solución: Revisar carpeta spam, whitelist sender

### Error: 429 Too Many Requests

**Causa:** Rate limiting activado (5 emails/hora)

**Solución:**

```bash
# Esperar 1 hora
# O reiniciar servidor (dev only)
pnpm dev
```

### No llega el email

1. **Revisar spam/junk** en Gmail
2. **Verificar logs de Resend:**

   - Ve a https://resend.com/emails
   - Busca el email enviado
   - Revisa status: `delivered`, `bounced`, `complained`

3. **Verificar logs de Vercel:**
   ```bash
   # Ver logs en tiempo real
   vercel logs --follow
   ```

---

## 🔄 Alternativas a Resend

Si Resend no funciona para ti, aquí hay alternativas:

### 1. SendGrid

```bash
pnpm add @sendgrid/mail
```

```typescript
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: "kathcastillosanchez@gmail.com",
  from: "noreply@encumbra.cl",
  subject: "Nueva Sugerencia",
  html: `...`,
});
```

**Pricing:** 100 emails/día gratis

### 2. Nodemailer (SMTP)

```bash
pnpm add nodemailer
```

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

await transporter.sendMail({
  from: '"Encumbra" <noreply@encumbra.cl>',
  to: "kathcastillosanchez@gmail.com",
  subject: "Nueva Sugerencia",
  html: `...`,
});
```

**Pricing:** Gratis con Gmail

### 3. Mailgun

```bash
pnpm add mailgun-js
```

**Pricing:** 5,000 emails/mes gratis

### 4. AWS SES

Usar AWS Simple Email Service

**Pricing:** 0.10 USD por 1000 emails

---

## 📊 Monitoreo

### Dashboard de Resend

- **URL:** https://resend.com/emails
- **Métricas:**
  - Emails enviados
  - Delivery rate
  - Bounces
  - Opens (si está activado tracking)

### Logs de Vercel

```bash
# Ver logs en tiempo real
vercel logs --follow

# Buscar emails enviados
vercel logs | grep "Email enviado"
```

---

## 📚 Referencias

- **Resend Docs:** https://resend.com/docs
- **Resend API:** https://resend.com/docs/api-reference/emails/send-email
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 🎯 Checklist de Deploy

- [ ] API key de Resend obtenida
- [ ] Variable `RESEND_API_KEY` en `.env.local`
- [ ] Variable en Vercel (Production)
- [ ] Test local exitoso (email llega)
- [ ] Test de rate limiting exitoso
- [ ] Deploy en Vercel
- [ ] Test de producción exitoso
- [ ] Verificar email en carpeta spam
- [ ] Whitelist sender en Gmail (si es necesario)
- [ ] Monitorear logs de Resend las primeras 24h

---

**Última actualización:** 3 de octubre de 2025  
**Contacto:** kathcastillosanchez@gmail.com
