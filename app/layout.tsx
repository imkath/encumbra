import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://encumbra.cl"),
  title: {
    default: "Encumbra - Vuela cuando el viento es perfecto",
    template: "%s | Encumbra",
  },
  description:
    "Descubre las mejores condiciones para volar volantín en Santiago de Chile. Pronósticos de viento en tiempo real, Q-Score inteligente, parques recomendados y guías de seguridad. Vuela cuando el viento es perfecto.",
  keywords: [
    "volantín",
    "volantines",
    "volar volantín",
    "condiciones de viento",
    "pronóstico viento Santiago",
    "parques para volar volantín",
    "viento Chile",
    "Q-Score",
    "Encumbra",
    "meteorología",
    "Open-Meteo",
    "parques Santiago",
    "Cerro San Cristóbal",
    "Parque O'Higgins",
    "seguridad volantines",
    "hilo de algodón",
    "tradición chilena",
    "18 de septiembre",
    "fiestas patrias",
  ],
  authors: [{ name: "Encumbra" }],
  creator: "Encumbra",
  publisher: "Encumbra",
  generator: "Next.js",
  manifest: "/manifest.json",
  applicationName: "Encumbra",
  referrer: "origin-when-cross-origin",
  category: "Weather",
  classification: "Weather Forecast Application",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Encumbra",
    google: "notranslate",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/icon-192.png",
      },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://encumbra.cl",
    siteName: "Encumbra",
    title: "Encumbra - Vuela cuando el viento es perfecto",
    description:
      "Descubre las mejores condiciones para volar volantín en Santiago de Chile. Pronósticos de viento en tiempo real, Q-Score inteligente y parques recomendados.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Encumbra - Pronóstico de viento para volar volantines",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Encumbra - Vuela cuando el viento es perfecto",
    description:
      "Descubre las mejores condiciones para volar volantín en Santiago de Chile. Pronósticos de viento en tiempo real.",
    images: ["/og-image.png"],
    creator: "@encumbra",
    site: "@encumbra",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://encumbra.cl",
    languages: {
      "es-CL": "https://encumbra.cl",
    },
  },
  verification: {
    google: "tu-codigo-de-verificacion-aqui",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Toaster />
        <Analytics debug={false} />
      </body>
    </html>
  );
}
