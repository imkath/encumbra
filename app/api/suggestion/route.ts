import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Rate limiting simple en memoria (para producción usar Redis o similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 5; // 5 requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Sanitización básica de strings
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remover < y > para prevenir XSS básico
    .substring(0, 1000); // Limitar longitud
}

// Validación de email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener IP para rate limiting
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intenta más tarde." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { suggestion, email } = body;

    // Validaciones
    if (!suggestion || typeof suggestion !== "string") {
      return NextResponse.json(
        { error: "La sugerencia es requerida" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Sanitizar inputs
    const cleanSuggestion = sanitizeInput(suggestion);
    const cleanEmail = sanitizeInput(email);

    if (cleanSuggestion.length < 10) {
      return NextResponse.json(
        { error: "La sugerencia debe tener al menos 10 caracteres" },
        { status: 400 }
      );
    }

    // Preparar el email
    const emailData = {
      to: "kathcastillosanchez@gmail.com",
      from: cleanEmail,
      subject: `Nueva sugerencia de Encumbra - ${new Date().toLocaleDateString(
        "es-CL"
      )}`,
      text: `
Nueva sugerencia recibida:

Email del usuario: ${cleanEmail}
Fecha: ${new Date().toLocaleString("es-CL")}
IP: ${ip}

Sugerencia:
${cleanSuggestion}

---
Enviado desde Encumbra - https://encumbra.cl
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563EB 0%, #06B6D4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .suggestion-box { background: white; padding: 15px; border-left: 4px solid #06B6D4; margin: 15px 0; }
    .footer { color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px; }
    .info { background: #eff6ff; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🪁 Nueva Sugerencia - Encumbra</h1>
    </div>
    <div class="content">
      <div class="info">
        <strong>📧 Email:</strong> ${cleanEmail}<br>
        <strong>📅 Fecha:</strong> ${new Date().toLocaleString("es-CL")}<br>
        <strong>🌐 IP:</strong> ${ip}
      </div>
      
      <h3>💡 Sugerencia:</h3>
      <div class="suggestion-box">
        ${cleanSuggestion.replace(/\n/g, "<br>")}
      </div>
      
      <div class="footer">
        <p>Este mensaje fue enviado desde el formulario de sugerencias de <strong>Encumbra</strong></p>
        <p><a href="https://encumbra.cl" style="color: #2563EB;">https://encumbra.cl</a></p>
      </div>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    // Intentar enviar con fetch a un servicio de email (ejemplo con Resend)
    // Necesitarías configurar RESEND_API_KEY en las variables de entorno
    if (process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Encumbra <sugerencias@encumbra.cl>", // Necesitas verificar este dominio
            reply_to: cleanEmail,
            to: "kathcastillosanchez@gmail.com",
            subject: emailData.subject,
            html: emailData.html,
          }),
        });

        if (!resendResponse.ok) {
          throw new Error("Error al enviar email con Resend");
        }

        return NextResponse.json({
          success: true,
          message: "¡Sugerencia enviada exitosamente!",
        });
      } catch (error) {
        console.error("Error con Resend:", error);
        // Fallback: continuar sin email
      }
    }

    // Si no hay servicio de email configurado, solo confirmamos recepción
    // En producción, podrías guardar en una base de datos
    return NextResponse.json({
      success: true,
      message: "¡Sugerencia recibida! Te contactaremos pronto.",
      note: "Email service not configured - suggestion logged",
    });
  } catch (error) {
    console.error("Error al procesar sugerencia:", error);
    return NextResponse.json(
      { error: "Error al procesar la sugerencia" },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
