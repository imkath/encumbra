"use client";

import { useEffect, useRef, useState } from "react";
import type { BandaId, Perfil } from "@/lib/bandas.ts";
import { VolantinPapel } from "./VolantinPapel.tsx";

/** Measure the field so the line ends below the actual screen at every ratio. */
export function VolantinCampo({ banda, perfil, deNoche = false }: {
  banda: BandaId | null;
  perfil: Perfil;
  deNoche?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [terreno, setTerreno] = useState({ ancho: 390, alto: 844 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setTerreno({ ancho: width, alto: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="vivo__campo" aria-hidden="true">
    <VolantinPapel banda={banda} perfil={perfil} deNoche={deNoche} terreno={terreno} />
  </div>;
}
