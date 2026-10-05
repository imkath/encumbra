import type { MetadataRoute } from "next";

import { GUIAS, LUGARES, SITIO_URL } from "@/lib/seo.ts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITIO_URL,
      lastModified: "2026-09-22",
      changeFrequency: "daily",
      priority: 1,
    },
    { url: `${SITIO_URL}/app`, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${SITIO_URL}/guia`,
      lastModified: "2026-09-22",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...GUIAS.map((guia) => ({
      url: `${SITIO_URL}/guia/${guia.slug}`,
      lastModified: guia.reviewedAt,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...LUGARES.map((lugar) => ({
      url: `${SITIO_URL}/parques/${lugar.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
