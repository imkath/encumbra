import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Marca } from "@/components/Marca.tsx";
import { Icono } from "@/components/Icono.tsx";
import { SelectorTema } from "@/components/SelectorTema.tsx";
import { ETIQUETAS } from "@/lib/bandas.ts";
import { distanciaKm } from "@/lib/coordenadas.ts";
import { formatearHora, formatearVelocidad, formatearVentana } from "@/lib/formato.ts";
import { lecturasParques } from "@/lib/salida.ts";
import {
  LUGARES,
  datosEstructuradosLugar,
  metadatosLugar,
  serializarJsonLd,
  tituloLugar,
} from "@/lib/seo.ts";
import { getPronostico } from "@/server/pronostico.ts";

// Wind changes by the hour, so the page is rendered per request like the landing.
export const dynamic = "force-dynamic";

type Props = { readonly params: Promise<{ slug: string }> };

const FECHA = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Santiago",
});

const DIA = new Intl.DateTimeFormat("es-CL", {
  weekday: "long",
  timeZone: "America/Santiago",
});

const buscar = (slug: string) => LUGARES.find((lugar) => lugar.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lugar = buscar((await params).slug);
  return lugar ? metadatosLugar(lugar) : {};
}

export default async function Parque({ params }: Props) {
  const lugar = buscar((await params).slug);
  if (!lugar) notFound();

  const [pronostico, cabeceras] = await Promise.all([getPronostico(), headers()]);
  const nonce = cabeceras.get("x-nonce") ?? undefined;
  const ahora = new Date();
  const lectura = lecturasParques(pronostico, "estandar", ahora, null).find(
    (p) => p.id === lugar.base.id,
  );
  const { base } = lugar;
  const evidencia = base.evidenciaPermiso;
  const riesgo = "riesgoVial" in base ? base.riesgoVial : null;
  const enlaceApp = `/app?parque=${base.id}&zona=${base.zonaId}`;
  const cercanos = LUGARES.filter((otro) => otro.slug !== lugar.slug)
    .map((otro) => ({ otro, km: distanciaKm(base, otro.base) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);

  return (
    <div className="guia-pagina">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: serializarJsonLd(datosEstructuradosLugar(lugar)),
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
          <Link href="/guia/donde-encumbrar-volantines-santiago">Dónde encumbrar</Link>
        </nav>
        <article className="guia-articulo">
          <header className="guia-cabecera">
            <h1>{tituloLugar(lugar)}</h1>
            <p className="guia-bajada">
              {base.permiso === "autorizado"
                ? `${lugar.nombre} está entre los lugares con permiso para encumbrar volantines en ${lugar.comuna}. Antes de ir, revisa si hoy hay viento y a qué hora.`
                : `${lugar.nombre}, en ${lugar.comuna}, es un lugar donde mucha gente busca encumbrar, pero Encumbra no ha confirmado que tenga permiso.`}
            </p>
          </header>

          <div className="guia-contenido">
            <section>
              <div className="guia-seccion-titulo">
                <h2>¿Hay viento hoy?</h2>
                <Link href={enlaceApp}>
                  Ver hora por hora
                  <Icono nombre="flecha" />
                </Link>
              </div>
              <div className="guia-resumen">
                {lectura?.hora && lectura.banda ? (
                  <>
                    <strong>{ETIQUETAS[lectura.banda]}</strong>
                    <p>
                      A las {formatearHora(lectura.hora.fecha)} se esperan{" "}
                      {formatearVelocidad(lectura.hora.viento)} de viento con
                      rachas de {formatearVelocidad(lectura.hora.racha)}, para un
                      volantín tradicional con cola.
                    </p>
                    <p>
                      {lectura.ventanaDiurna
                        ? `La mejor ventana con luz es el ${DIA.format(new Date(lectura.ventanaDiurna.inicio))} entre ${formatearVentana(lectura.ventanaDiurna.inicio, lectura.ventanaDiurna.fin)}.`
                        : "En los próximos días no se ve una ventana con buen viento y luz."}
                    </p>
                  </>
                ) : (
                  <>
                    <strong>Sin pronóstico en este momento</strong>
                    <p>No pudimos leer el viento ahora. Prueba de nuevo en unos minutos.</p>
                  </>
                )}
              </div>
            </section>

            <section>
              <h2>¿Se puede encumbrar aquí?</h2>
              {base.permiso === "autorizado" && evidencia ? (
                <p>
                  Sí.{" "}
                  {evidencia.autoridad === "Parquemet"
                    ? "Aparece en el listado de recintos habilitados que publicó Parquemet. Esa lista se renueva por temporada, así que confirma horarios antes de ir."
                    : "Su administración confirmó la autorización directamente. Revisa reglas y horarios antes de ir."}{" "}
                  Encumbra lo revisó el{" "}
                  {FECHA.format(new Date(`${evidencia.verificadoEn}T12:00:00-03:00`))}.
                </p>
              ) : (
                <p>
                  No lo sabemos. {lugar.nombre} no aparece en el listado de
                  recintos habilitados que publicó Parquemet, y su administración
                  no nos ha confirmado un permiso. Por eso Encumbra no lo propone,
                  aunque puedes revisar su viento. Pregunta en el recinto antes de
                  elevar, o elige un{" "}
                  <Link href="/guia/donde-encumbrar-volantines-santiago">
                    parque con permiso confirmado
                  </Link>
                  .
                </p>
              )}
              {riesgo ? <p><strong>Ojo:</strong> {riesgo.detalle}</p> : null}
              {evidencia?.fuente ? (
                <p className="guia-fuentes">
                  <a href={evidencia.fuente} target="_blank" rel="noopener noreferrer">
                    Ver la publicación de {evidencia.autoridad}
                    <Icono nombre="salir" />
                  </a>
                </p>
              ) : null}
            </section>

            {lugar.puntos.length > 1 ? (
              <section>
                <h2>{lugar.puntos.length} tramos para elegir</h2>
                <p>
                  {lugar.nombre} es largo y el viento cambia de un tramo a otro.
                  Encumbra lee cada uno por separado.
                </p>
                <ul className="guia-lugares">
                  {lugar.puntos.map((punto) => (
                    <li key={punto.id}>
                      <div>
                        <strong>{punto.nombre}</strong>
                        <span>{punto.comuna}</span>
                      </div>
                      <Link href={`/app?parque=${punto.id}&zona=${punto.zonaId}`}>
                        Ver pronóstico
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2>Cómo llegar</h2>
              <p>
                {lugar.nombre} está en {lugar.comuna}. La ubicación marca el
                recinto, no un acceso puntual: al llegar, busca una explanada
                lejos de cables, postes, árboles altos y calles.
              </p>
              <p className="guia-fuentes">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${base.lat},${base.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir en el mapa
                  <Icono nombre="salir" />
                </a>
              </p>
            </section>

            <section>
              <h2>Parques cercanos</h2>
              <ul className="guia-lugares">
                {cercanos.map(({ otro, km }) => (
                  <li key={otro.slug}>
                    <div>
                      <strong>{otro.nombre}</strong>
                      <span>
                        {otro.comuna} · a {km.toLocaleString("es-CL", { maximumFractionDigits: 1 })} km
                      </span>
                    </div>
                    <Link href={`/parques/${otro.slug}`}>Ver parque</Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </main>
      <footer className="guia-pie">
        <p>Pronóstico de Open-Meteo. Esto es pronóstico: mira el árbol antes de armar.</p>
        <nav aria-label="Navegación del pie">
          <Link href="/app">Ver el viento ahora</Link>
          <Link href="/guia/seguridad-al-encumbrar-volantines">Encumbrar seguro</Link>
        </nav>
      </footer>
    </div>
  );
}
