import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware de seguridad para Next.js
export function middleware(request: NextRequest) {
  // Crear respuesta
  const response = NextResponse.next();

  // Security Headers siguiendo OWASP best practices
  const securityHeaders = {
    // Protección contra XSS
    "X-XSS-Protection": "1; mode=block",

    // Prevenir MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Protección contra clickjacking
    "X-Frame-Options": "DENY",

    // Content Security Policy (CSP)
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://va.vercel-scripts.com", // Next.js y Vercel Analytics
      "style-src 'self' 'unsafe-inline' https://unpkg.com", // Leaflet CSS
      "img-src 'self' data: https: blob:", // Mapas y recursos externos
      "font-src 'self' data:",
      "connect-src 'self' https://api.open-meteo.com https://tile.openstreetmap.org https://vitals.vercel-insights.com", // APIs y Vercel Analytics
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy (antes Feature Policy)
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(self), interest-cohort=()",

    // Strict Transport Security (HSTS) - solo en producción con HTTPS
    ...(process.env.NODE_ENV === "production" && {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    }),

    // Cache control para páginas sensibles
    ...(request.nextUrl.pathname.startsWith("/api/") && {
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    }),
  };

  // Aplicar headers de seguridad
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting básico para APIs (para producción usar Upstash o similar)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // El rate limiting real está en cada API route
    // Aquí solo añadimos headers informativos
    response.headers.set("X-RateLimit-Limit", "60");
    response.headers.set("X-RateLimit-Remaining", "60");
  }

  return response;
}

// Configurar qué rutas pasan por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (images, icons, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
