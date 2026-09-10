import type { MetadataRoute } from "next";

// Next sirve esto en /manifest.webmanifest. Los colores salen de
// public/design-tokens.css: --brand-bone de fondo, --brand-ink de tinta.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Encumbra",
    short_name: "Encumbra",
    description:
      "El viento de los parques de Santiago, para saber dónde vuela tu volantín.",
    lang: "es-CL",
    // Instalada abre en los parques, no en la landing: quien instala ya sabe qué es.
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f7f2",
    theme_color: "#f8f7f2",
    categories: ["weather", "sports", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Estoy en el parque", short_name: "Volar", url: "/volar" },
      { name: "Ver los parques", short_name: "Parques", url: "/app" },
    ],
  };
}
