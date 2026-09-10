"use client";

import { useEffect } from "react";

/**
 * Registra el service worker y nada más. Instalar la app queda a criterio de
 * quien entra: el navegador ya ofrece "Agregar a la pantalla de inicio" en su
 * menú, así que no hay banner ni prompt propio pidiéndolo.
 */
export function ServicioOffline() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;

    // Después de load, para no competir por ancho de banda con el primer render.
    const registrar = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };
    if (document.readyState === "complete") {
      registrar();
      return undefined;
    }
    window.addEventListener("load", registrar);
    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
