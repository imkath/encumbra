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
            __html: `(()=>{const clave="encumbra:tema";const media=matchMedia("(prefers-color-scheme: dark)");const guardado=()=>{try{const valor=localStorage.getItem(clave);return valor==="light"||valor==="dark"?valor:null}catch{return null}};const sincronizarControles=(tema)=>{const oscuro=tema==="dark";document.querySelectorAll("[data-theme-toggle]").forEach((boton)=>{boton.setAttribute("aria-checked",String(oscuro));boton.setAttribute("title",oscuro?"Cambiar a tema claro":"Cambiar a tema oscuro")})};const aplicar=(tema)=>{const raiz=document.documentElement;raiz.dataset.theme=tema;raiz.style.colorScheme=tema;const color=tema==="dark"?"#181916":"#f8f7f2";document.querySelectorAll('meta[name="theme-color"]').forEach((meta)=>meta.setAttribute("content",color));sincronizarControles(tema)};const sistema=()=>media.matches?"dark":"light";aplicar(guardado()??sistema());addEventListener("DOMContentLoaded",()=>{aplicar(guardado()??sistema());document.addEventListener("click",(evento)=>{const boton=evento.target instanceof Element?evento.target.closest("[data-theme-toggle]"):null;if(!boton)return;const tema=document.documentElement.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem(clave,tema)}catch{}const reducir=matchMedia("(prefers-reduced-motion: reduce)").matches;if(!document.startViewTransition||reducir){aplicar(tema);return}const caja=boton.getBoundingClientRect();const x=caja.left+caja.width/2;const y=caja.top+caja.height/2;const radio=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));const raiz=document.documentElement;raiz.style.setProperty("--theme-x",x+"px");raiz.style.setProperty("--theme-y",y+"px");raiz.style.setProperty("--theme-radius",radio+"px");document.startViewTransition(()=>aplicar(tema))})},{once:true});media.addEventListener("change",()=>{if(!guardado())aplicar(sistema())})})()`,
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
