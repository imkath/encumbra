import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const lectura = DM_Sans({
  display: "swap",
  variable: "--font-archivo",
  weight: "variable",
  subsets: ["latin"],
});

const titulares = Space_Grotesk({
  display: "swap",
  preload: true,
  variable: "--font-display",
  weight: "variable",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Encumbra",
  description: "Pronóstico para encumbrar volantines en Santiago.",
};

export const viewport: Viewport = {
  themeColor: "#f7f9fc",
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
      <body className={`${lectura.variable} ${titulares.variable}`}>
        {children}
      </body>
    </html>
  );
}
