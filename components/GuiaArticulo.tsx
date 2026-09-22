import Link from "next/link";
import { headers } from "next/headers";
import type { ReactNode } from "react";

import { Marca } from "@/components/Marca.tsx";
import { SelectorTema } from "@/components/SelectorTema.tsx";
import {
  GUIAS,
  datosEstructuradosGuia,
  serializarJsonLd,
  type Guia,
} from "@/lib/seo.ts";

type Props = {
  readonly guia: Guia;
  readonly children: ReactNode;
};

const FECHA = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Santiago",
});

export async function GuiaArticulo({ guia, children }: Props) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const relacionadas = GUIAS.filter(({ slug }) => slug !== guia.slug);

  return (
    <div className="guia-pagina">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: serializarJsonLd(datosEstructuradosGuia(guia)),
        }}
      />
      <header className="guia-barra">
        <Link href="/" className="guia-logo" aria-label="Encumbra, inicio">
          <Marca />
        </Link>
        <SelectorTema />
      </header>
      <main id="contenido-principal" className="guia-principal">
        <nav className="guia-migas" aria-label="Migas de pan">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link href="/guia">Guías</Link>
        </nav>
        <article className="guia-articulo">
          <header className="guia-cabecera">
            <p className="guia-ceja">{guia.eyebrow}</p>
            <h1>{guia.title}</h1>
            <p className="guia-bajada">{guia.intro}</p>
            <p className="guia-revision">
              Por <Link href="/">Encumbra</Link> · Revisado el {FECHA.format(new Date(`${guia.reviewedAt}T12:00:00-03:00`))}
            </p>
          </header>
          <div className="guia-contenido">{children}</div>
        </article>
        <aside className="guia-relacionadas" aria-labelledby="otras-guias">
          <h2 id="otras-guias">Sigue preparando tu salida</h2>
          <div>
            {relacionadas.map((item) => (
              <Link key={item.slug} href={`/guia/${item.slug}`}>
                <span>{item.eyebrow}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </aside>
      </main>
      <footer className="guia-pie">
        <p>Encumbra traduce el viento de Santiago a una decisión simple.</p>
        <nav aria-label="Navegación del pie">
          <Link href="/app">Ver el viento ahora</Link>
          <Link href="/guia">Todas las guías</Link>
        </nav>
      </footer>
    </div>
  );
}
