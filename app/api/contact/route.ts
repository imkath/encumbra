import { NextRequest, NextResponse } from "next/server";

// Rate limiting simple (en producción usa un rate limiter más robusto)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora
const MAX_REQUESTS = 5; // 5 mensajes por hora

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];

  // Limpiar requests antiguos
  const recentRequests = requests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Demasiados mensajes. Por favor intenta más tarde." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, email, subject = "Contacto desde Encumbra" } = body;

    // Validación
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "El mensaje es requerido" },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "El mensaje debe tener al menos 10 caracteres" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "El mensaje es muy largo (máximo 2000 caracteres)" },
        { status: 400 }
      );
    }

    if (email && typeof email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "El email no es válido" },
          { status: 400 }
        );
      }
    }

    // Log del mensaje solo en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("\n=== NUEVO MENSAJE DE CONTACTO ===");
      console.log("Asunto:", subject);
      console.log("Mensaje:", message);
      console.log("Email:", email || "No proporcionado");
      console.log("Fecha:", new Date().toLocaleString("es-CL"));
      console.log("IP:", ip);
      console.log("================================\n");
    }

    // Si tienes configurado RESEND_API_KEY, enviar email
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const emailHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">💬 ${subject}</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 16px; font-weight: 600;">Mensaje:</h2>
                <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>

              ${
                email
                  ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 16px; font-weight: 600;">Email del remitente:</h2>
                <p style="color: #374151;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></p>
              </div>
              `
                  : ""
              }

              <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 16px; font-weight: 600;">Información adicional:</h2>
                <ul style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                  <li><strong>Fecha:</strong> ${new Date().toLocaleString(
                    "es-CL",
                    {
                      dateStyle: "long",
                      timeStyle: "short",
                    }
                  )}</li>
                  <li><strong>IP:</strong> ${ip}</li>
                </ul>
              </div>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Este mensaje fue enviado desde el formulario de contacto de <strong>Encumbra</strong>
                </p>
              </div>
            </div>
          </div>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Encumbra <contacto@encumbra.cl>",
            to: "kathcastillosanchez@gmail.com",
            subject: `${subject} - Encumbra`,
            html: emailHtml,
            reply_to: email || undefined,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error("Error al enviar email con Resend:", errorText);
          // No devolver error al usuario, ya se registró en logs
        }
      } catch (emailError) {
        console.error("Error al enviar email:", emailError);
        // No devolver error al usuario
      }
    }

    return NextResponse.json(
      { success: true, message: "Mensaje recibido correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en contact API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
