import type { MetadataRoute } from "next";

import { SITIO_URL } from "@/lib/seo.ts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITIO_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITIO_URL}/app`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITIO_URL}/volar`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
