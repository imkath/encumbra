import { redirect } from "next/navigation";
import { VEREDICTOS, COLETILLAS, CONSEJOS, ETIQUETAS } from "@/lib/bandas.ts";
import {
  formatearHora,
  formatearVentana,
  formatearVelocidad,
} from "@/lib/formato.ts";
import { getPronostico } from "@/server/pronostico.ts";
import { ordenarParques } from "@/lib/parques.ts";
import { lecturasParques, type LecturaParque } from "@/lib/salida.ts";
import { Icono } from "@/components/Icono.tsx";
import { Marca } from "@/components/Marca.tsx";
import { ReglaBandas } from "@/components/ReglaBandas.tsx";
import { Cielo } from "@/components/Cielo.tsx";
import { VolantinPapel } from "@/components/VolantinPapel.tsx";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DEEP_LINK = ["parque", "zona", "perfil", "vista"] as const;

const DIA = new Intl.DateTimeFormat("es-CL", {
  timeZone: "America/Santiago",
  weekday: "long",
});

/** "hoy 16:00–18:30" or "sábado 11:00–14:00", so a bad now still points somewhere. */
function cuando(ventana: { inicio: string; fin: string }, ahora: Date): string {
  const mismoDia =
    DIA.format(new Date(ventana.inicio)) === DIA.format(ahora) &&
    Date.parse(ventana.inicio) - ahora.getTime() < 86_400_000;
  const etiqueta = mismoDia ? "hoy" : DIA.format(new Date(ventana.inicio));
  return `${etiqueta} ${formatearVentana(ventana.inicio, ventana.fin)}`;
}

function nombreLugar(p: LecturaParque): string {
  return p.nombre === p.comuna ? p.nombre : `${p.nombre}, ${p.comuna}`;
}

export default async function Landing({ searchParams }: Props) {
  const params = await searchParams;
  // Links shared before the app moved to /app must keep working.
  const heredados = new URLSearchParams();
  for (const clave of DEEP_LINK) {
    const valor = params[clave];
    if (typeof valor === "string") heredados.set(clave, valor);
  }
  if (heredados.size > 0) redirect(`/app?${heredados}`);

  const pronostico = await getPronostico();
  const ahora = new Date();
  const parques = lecturasParques(pronostico, "estandar", ahora, null);
  const ordenados = ordenarParques(parques, "adecuado");
  const mejor = ordenados[0]!;
  const banda = mejor.banda;
  const anda = banda === "ideal" || banda === "liviano";
  // A flat "no" would talk the visitor out of the app; point at the next window.
  const proxima = ordenados
    .flatMap((p) =>
      p.ventanaDiurna ? [{ parque: p, v: p.ventanaDiurna }] : [],
    )
    .sort((a, b) => Date.parse(a.v.inicio) - Date.parse(b.v.inicio))[0];
  const cuatro = ordenados.slice(0, 4);

  return (
    <div className="portada">
      <header className="portada-barra">
        <a className="portada-logo" href="/app" aria-label="Encumbra">
          <Marca />
        </a>
        <span className="portada-ciudad">Santiago, Chile</span>
      </header>

      {/* Say what this is before showing what it knows. */}
      <section className="portada-hero">
        <div className="portada-decir">
          <h1 className="portada-titular">
            <span className="portada-titular__grito">¿anda</span>
            <span className="portada-titular__hueco">o no anda?</span>
          </h1>
          <p className="portada-explica">
            Encumbra mira el viento de {parques.length} parques de Santiago y te
            dice en cuál vuela tu volantín, a qué hora y con cuál. En el parque
            sigue funcionando sin señal.
          </p>
          <a className="portada-accion" href="/app">
            Ver los parques
            <Icono nombre="flecha" />
          </a>
          <p className="portada-firma">El cielo es tuyo.</p>
        </div>

        {/* The live answer, as proof that the thing above actually works. */}
        <aside className="portada-ficha superficie-mate" data-paleta={banda ?? "sin-datos"}>
          <VolantinPapel
            className="portada-ficha__volantin"
            banda={banda}
            encuadre="tarjeta"
          />
          <div className="portada-ficha__cabeza">
            <p className="portada-ficha__ahora">El mejor ahora mismo</p>
            <p className="portada-ficha__lugar">{nombreLugar(mejor)}</p>
          </div>
          <div className="portada-ficha__cuerpo">
            <p className="portada-ficha__veredicto">
              {banda ? VEREDICTOS[banda] : "SIN DATOS"}{" "}
              <span>{banda ? COLETILLAS[banda] : "volvemos."}</span>
            </p>
            <p className="portada-ficha__cuando">
              {banda
                ? anda && mejor.ventanaDiurna
                  ? `Hay buen rato ${cuando(mejor.ventanaDiurna, ahora)}.`
                  : proxima
                    ? `El mejor rato es ${cuando(proxima.v, ahora)} en ${nombreLugar(proxima.parque)}.`
                    : CONSEJOS[banda]
                : "No pudimos leer el viento ahora."}
            </p>
            {mejor.hora ? (
              <dl className="portada-ficha__datos">
                <div>
                  <dt>viento</dt>
                  <dd>{formatearVelocidad(mejor.hora.viento)}</dd>
                </div>
                <div>
                  <dt>rachas</dt>
                  <dd>{Math.round(mejor.hora.racha)} km/h</dd>
                </div>
                <div>
                  <dt>al día</dt>
                  <dd>
                    {pronostico.actualizadoEn
                      ? formatearHora(pronostico.actualizadoEn)
                      : "—"}
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        </aside>
      </section>

      <main>
        {/* Three steps, because "what do I do with this" is the next question. */}
        <section className="portada-pasos">
          <h2>Cómo se usa</h2>
          <ol>
            <li>
              <span className="portada-paso__n">1</span>
              <strong>Dinos qué volantín tienes</strong>
              <p>
                Uno de papel liviano, uno con cola o uno acrobático. Cada uno
                necesita un viento distinto, y eso cambia la respuesta.
              </p>
            </li>
            <li>
              <span className="portada-paso__n">2</span>
              <strong>Mira los {parques.length} parques en el mapa</strong>
              <p>
                Cada parque dice si anda o no anda ahora, y a qué hora se pone
                bueno. No hay que leer números si no quieres.
              </p>
            </li>
            <li>
              <span className="portada-paso__n">3</span>
              <strong>Anda al parque y llévatelo</strong>
              <p>
                Ya en el pasto, la pantalla de terreno te dice cuánto rato te
                queda de viento y cuánta luz.
              </p>
            </li>
          </ol>
        </section>

        {/* Four kites, not four rows: the ranking is the picture. */}
        <section className="portada-podio">
          <div className="portada-lista__titulo">
            <h2>Los mejores ahora</h2>
            <span>de {parques.length} parques</span>
          </div>
          <ol className="portada-rombos">
            {cuatro.map((p, i) => (
              <li
                key={p.id}
                className="portada-rombo"
                data-paleta={p.banda ?? "sin-datos"}
                style={{ "--orden": i } as React.CSSProperties}
              >
                <a href={`/app?parque=${p.id}&zona=${p.zonaId}`}>
                  <span className="portada-rombo__papel superficie-mate" aria-hidden="true" />
                  <span className="portada-rombo__dentro">
                    <span className="portada-rombo__puesto">{i + 1}</span>
                    <strong>{p.nombre}</strong>
                    <span className="portada-rombo__viento">
                      {p.hora ? formatearVelocidad(p.hora.viento) : "sin dato"}
                    </span>
                    <span className="portada-rombo__estado">
                      {p.banda ? ETIQUETAS[p.banda] : "sin dato"}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <a className="portada-vertodos" href="/app">
            Verlos todos en el mapa
            <Icono nombre="flecha" />
          </a>
        </section>

        <section className="portada-cielo">
          <h2>El viento de hoy</h2>
          <p className="portada-sub">
            Cómo se mueve el viento en {mejor.nombre} durante el día. La franja
            marcada es cuando vuela.
          </p>
          <Cielo horas={mejor.horas} ahora={mejor.hora?.fecha} />
        </section>

        <section className="portada-escala">
          <h2>Cómo lo decide</h2>
          <p className="portada-sub">
            Un modelo calibrado con cinco años de viento de Santiago. Estos son
            los cortes que usa la app.
          </p>
          <ReglaBandas viento={mejor.hora?.viento ?? null} />
          <p className="portada-honestidad">
            Esto es pronóstico. El viento del parque puede ser otro, así que
            mira el árbol antes de armar.
          </p>
        </section>
      </main>

      <footer className="portada-pie">
        <a className="portada-accion" href="/app">
          Abrir Encumbra
          <Icono nombre="flecha" />
        </a>
        <p>
          Datos de Open-Meteo. Cartografía de OpenFreeMap, OpenMapTiles y
          OpenStreetMap.
        </p>
        <a className="portada-contacto" href="https://nvrkth.com" target="_blank" rel="noopener noreferrer">
          Contacto y sugerencias · nvrkth ↗
        </a>
      </footer>
    </div>
  );
}
