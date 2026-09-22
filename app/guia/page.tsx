import type { Metadata } from "next";
import Link from "next/link";

import { Marca } from "@/components/Marca.tsx";
import { SelectorTema } from "@/components/SelectorTema.tsx";
import { GUIAS } from "@/lib/seo.ts";

export const metadata: Metadata = {
  title: "Guías para encumbrar volantines",
  description:
    "Guías de Encumbra sobre viento, parques de Santiago y seguridad para elegir cuándo y dónde elevar volantines.",
  alternates: { canonical: "/guia" },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/guia",
    title: "Guías para encumbrar volantines",
    description:
      "Viento, parques de Santiago y seguridad explicados para preparar una salida con volantines.",
  },
};

export default function Guia() {
  return (
    <div className="guia-pagina guia-indice">
      <header className="guia-barra">
        <Link href="/" className="guia-logo" aria-label="Encumbra, inicio">
          <Marca />
        </Link>
        <SelectorTema />
      </header>
      <main id="contenido-principal" className="guia-principal">
        <header className="guia-indice__cabecera">
          <p className="guia-ceja">Aprender antes de salir</p>
          <h1>Guías para encumbrar volantines</h1>
          <p>
            Lo importante, sin hablar en meteorólogo: cuánto viento sirve,
            dónde buscar un lugar y qué revisar para elevar de forma segura.
          </p>
        </header>
        <section className="guia-tarjetas" aria-label="Guías de Encumbra">
          {GUIAS.map((guia, indice) => (
            <Link key={guia.slug} href={`/guia/${guia.slug}`}>
              <span className="guia-tarjetas__numero">0{indice + 1}</span>
              <span className="guia-ceja">{guia.eyebrow}</span>
              <strong>{guia.title}</strong>
              <p>{guia.description}</p>
              <span className="guia-tarjetas__accion">Leer la guía →</span>
            </Link>
          ))}
        </section>
        <div className="guia-llamada">
          <div>
            <p className="guia-ceja">Datos de hoy</p>
            <h2>¿Quieres saber si anda ahora?</h2>
          </div>
          <Link href="/app">Ver el viento en los parques</Link>
        </div>
      </main>
    </div>
  );
}
