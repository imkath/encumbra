import { crearCalendario } from "@/lib/vivo.ts";

export function GET(request: Request): Response {
  const params = new URL(request.url).searchParams;
  const inicio = params.get("inicio") ?? "";
  const fin = params.get("fin") ?? "";
  const lugar = params.get("lugar") ?? "";
  const desde = Date.parse(inicio);
  const hasta = Date.parse(fin);
  if (!Number.isFinite(desde) || !Number.isFinite(hasta) || hasta <= desde ||
      hasta - desde > 7 * 86400000 || !lugar.trim() || lugar.length > 200) {
    return new Response("Horario o lugar inválido", { status: 400 });
  }
  return new Response(crearCalendario({ inicio, fin }, lugar, new Date()), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="encumbra.ics"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
