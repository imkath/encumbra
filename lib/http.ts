export type Limitador = {
  limit(entrada: { readonly key: string }): Promise<{ readonly success: boolean }>;
};

const ENCABEZADOS_SIN_CACHE = {
  "Cache-Control": "private, no-store",
  "Content-Type": "application/json; charset=utf-8",
  "Retry-After": "60",
  "X-Content-Type-Options": "nosniff",
} as const;

export function crearCsp(nonce: string, desarrollo: boolean): string {
  const scripts = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(desarrollo ? ["'unsafe-eval'"] : []),
  ];

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src ${scripts.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://tiles.openfreemap.org",
    "font-src 'self' data: https://tiles.openfreemap.org",
    "connect-src 'self' https://tiles.openfreemap.org",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function limitarConsultaUbicacion(
  request: Request,
  limitador: Limitador,
): Promise<Response | null> {
  const actor = request.headers.get("cf-connecting-ip")?.trim() || "anonymous";
  const { success } = await limitador.limit({ key: `ubicacion:${actor}` });
  if (success) return null;

  return Response.json(
    { error: "Demasiadas consultas de ubicación. Reintenta en un minuto." },
    { status: 429, headers: ENCABEZADOS_SIN_CACHE },
  );
}
