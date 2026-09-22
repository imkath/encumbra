export const SITIO_URL = "https://encumbra.nvrkth.com";
export const SITIO_DESCRIPCION =
  "Pronóstico de viento para elegir dónde y cuándo encumbrar volantines en Santiago.";

export const DATOS_ESTRUCTURADOS = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITIO_URL}/#website`,
      url: SITIO_URL,
      name: "Encumbra",
      description: SITIO_DESCRIPCION,
      inLanguage: "es-CL",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITIO_URL}/#application`,
      url: `${SITIO_URL}/app`,
      name: "Encumbra",
      description: SITIO_DESCRIPCION,
      applicationCategory: "WeatherApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript and geolocation only when requested",
      inLanguage: "es-CL",
      isAccessibleForFree: true,
      areaServed: {
        "@type": "City",
        name: "Santiago de Chile",
      },
      featureList: [
        "Pronóstico horario de viento y rachas",
        "Comparación de modelos ICON y ECMWF para la ubicación solicitada",
        "Observaciones cercanas de la Dirección Meteorológica de Chile",
        "Planificación por tipo de volantín",
        "Modo de terreno disponible sin conexión después de la primera visita",
      ],
    },
  ],
} as const;

export function serializarJsonLd(valor: unknown): string {
  return JSON.stringify(valor).replace(/</g, "\\u003c");
}
