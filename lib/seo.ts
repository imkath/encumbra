import type { Metadata } from "next";

import { PARQUES } from "./parques.ts";

export const SITIO_URL = "https://encumbra.nvrkth.com";
export const SITIO_DESCRIPCION =
  "Revisa si hay viento para volantines, compara parques de Santiago y elige una hora segura para encumbrar.";

export type GuiaSeo = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly intro: string;
  readonly reviewedAt: string;
};

export const GUIAS = [
  {
    slug: "viento-para-volantines",
    title: "¿Cuánto viento se necesita para elevar un volantín?",
    description:
      "Rangos de viento y rachas para volantines livianos, tradicionales y acrobáticos, con una forma simple de decidir si conviene salir.",
    intro:
      "No existe un único número para todos los volantines. El peso, la forma, la cola y las rachas cambian la respuesta.",
    reviewedAt: "2026-09-22",
  },
  {
    slug: "donde-encumbrar-volantines-santiago",
    title: "Dónde encumbrar volantines en Santiago",
    description:
      "Parques de Santiago para elevar volantines, con comuna, estado de autorización, fuentes y acceso al pronóstico de viento de cada lugar.",
    intro:
      "Un buen lugar necesita espacio abierto, distancia de cables y vías, permiso vigente y viento suficiente a la hora de la visita.",
    reviewedAt: "2026-09-22",
  },
  {
    slug: "seguridad-al-encumbrar-volantines",
    title: "Cómo encumbrar volantines de forma segura en Chile",
    description:
      "Qué revisar antes de elevar un volantín: lugar, viento, hilo, cables, calles y reglas chilenas sobre el hilo curado.",
    intro:
      "La seguridad depende tanto del lugar y del hilo como del viento. Esta lista reúne las precauciones oficiales que conviene revisar antes de salir.",
    reviewedAt: "2026-09-22",
  },
] as const satisfies readonly GuiaSeo[];

export type Guia = (typeof GUIAS)[number];

export function urlGuia(guia: GuiaSeo): string {
  return `${SITIO_URL}/guia/${guia.slug}`;
}

export function metadatosGuia(guia: GuiaSeo): Metadata {
  const canonical = `/guia/${guia.slug}`;
  return {
    title: guia.title,
    description: guia.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "es_CL",
      url: canonical,
      title: guia.title,
      description: guia.description,
      publishedTime: guia.reviewedAt,
      modifiedTime: guia.reviewedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: guia.title,
      description: guia.description,
    },
  };
}

export function datosEstructuradosGuia(guia: GuiaSeo) {
  const url = urlGuia(guia);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        headline: guia.title,
        description: guia.description,
        image: `${SITIO_URL}/opengraph-image`,
        datePublished: guia.reviewedAt,
        dateModified: guia.reviewedAt,
        inLanguage: "es-CL",
        isPartOf: { "@id": `${SITIO_URL}/#website` },
        author: {
          "@type": "Organization",
          name: "Encumbra",
          url: SITIO_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "Encumbra",
          url: SITIO_URL,
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Encumbra",
            item: SITIO_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guías",
            item: `${SITIO_URL}/guia`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guia.title,
            item: url,
          },
        ],
      },
    ],
  } as const;
}

// One page per venue, not per point: the six Mapocho Río stretches would be
// near-duplicate pages competing with each other for the same search.
export const LUGARES = [...new Set(PARQUES.map((p) => p.recintoId))].map(
  (recintoId) => {
    const puntos = PARQUES.filter((p) => p.recintoId === recintoId).sort(
      (a, b) => a.nombre.localeCompare(b.nombre, "es-CL", { numeric: true }),
    );
    const base = puntos[0]!;
    const corto = base.nombre.replace(/ · tramo \d+$/, "");
    const tipo = recintoId.startsWith("cerro-") ? "Cerro" : "Parque";
    return {
      slug: recintoId.replace(/^parque-/, ""),
      recintoId,
      nombre: /^(Parque|Cerro) /.test(corto) ? corto : `${tipo} ${corto}`,
      comuna: [...new Set(puntos.map((p) => p.comuna))].join(" y "),
      puntos,
      base,
    };
  },
);

export type Lugar = (typeof LUGARES)[number];

export function urlLugar(lugar: Lugar): string {
  return `${SITIO_URL}/parques/${lugar.slug}`;
}

export function tituloLugar(lugar: Lugar): string {
  return `Volantines en ${lugar.nombre}, ${lugar.comuna}`;
}

export function descripcionLugar(lugar: Lugar): string {
  return lugar.base.permiso === "autorizado"
    ? `¿Hay viento hoy para encumbrar volantines en ${lugar.nombre}? Pronóstico por hora, rachas y el permiso que lo respalda.`
    : `Viento por hora para volantines en ${lugar.nombre} y el estado real de su permiso, que Encumbra aún no ha confirmado.`;
}

export function metadatosLugar(lugar: Lugar): Metadata {
  const canonical = `/parques/${lugar.slug}`;
  const title = tituloLugar(lugar);
  const description = descripcionLugar(lugar);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "es_CL", url: canonical, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function datosEstructuradosLugar(lugar: Lugar) {
  const url = urlLugar(lugar);
  const guia = `${SITIO_URL}/guia/donde-encumbrar-volantines-santiago`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: tituloLugar(lugar),
        description: descripcionLugar(lugar),
        inLanguage: "es-CL",
        isPartOf: { "@id": `${SITIO_URL}/#website` },
        about: { "@id": `${url}#lugar` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": lugar.recintoId.startsWith("cerro-") ? "Mountain" : "Park",
        "@id": `${url}#lugar`,
        name: lugar.nombre,
        address: {
          "@type": "PostalAddress",
          addressLocality: lugar.comuna,
          addressRegion: "Región Metropolitana",
          addressCountry: "CL",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: lugar.base.lat,
          longitude: lugar.base.lon,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Encumbra", item: SITIO_URL },
          { "@type": "ListItem", position: 2, name: "Dónde encumbrar", item: guia },
          { "@type": "ListItem", position: 3, name: lugar.nombre, item: url },
        ],
      },
    ],
  } as const;
}

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
