import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// One family for app and landing. The width axis carries the signage register
// that a second display face used to, and its tabular figures hold the numbers.
const archivo = Archivo({
  display: "swap",
  preload: true,
  variable: "--font-archivo",
  axes: ["wdth"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Encumbra",
  description: "Pronóstico para encumbrar volantines en Santiago.",
};

export const viewport: Viewport = {
  themeColor: "#f8f7f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body className={archivo.variable}>{children}</body>
    </html>
  );
}
