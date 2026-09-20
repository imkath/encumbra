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
  appleWebApp: { capable: true, title: "Encumbra", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#181916" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{const clave="encumbra:tema";const media=matchMedia("(prefers-color-scheme: dark)");const guardado=()=>{try{const valor=localStorage.getItem(clave);return valor==="light"||valor==="dark"?valor:null}catch{return null}};const aplicar=(tema)=>{const raiz=document.documentElement;raiz.dataset.theme=tema;raiz.style.colorScheme=tema;const color=tema==="dark"?"#181916":"#f8f7f2";document.querySelectorAll('meta[name="theme-color"]').forEach((meta)=>meta.setAttribute("content",color))};const sistema=()=>media.matches?"dark":"light";aplicar(guardado()??sistema());addEventListener("DOMContentLoaded",()=>{aplicar(guardado()??sistema());document.addEventListener("click",(evento)=>{const boton=evento.target instanceof Element?evento.target.closest("[data-theme-toggle]"):null;if(!boton)return;const tema=document.documentElement.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem(clave,tema)}catch{}aplicar(tema)})},{once:true});media.addEventListener("change",()=>{if(!guardado())aplicar(sistema())})})()`,
          }}
        />
      </head>
      <body className={archivo.variable}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if("serviceWorker" in navigator){addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}),{once:true})}',
          }}
        />
      </body>
    </html>
  );
}
