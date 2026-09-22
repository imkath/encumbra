export function rutaApp(parametros: URLSearchParams): string {
  const consulta = parametros.toString();
  return consulta ? `/app?${consulta}` : "/app";
}
