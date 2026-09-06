import { redirect } from "next/navigation";
import { VEREDICTOS, CONSEJOS, ETIQUETAS } from "@/lib/bandas.ts";
import {
  formatearHora,
  formatearVentana,
  formatearVelocidad,
} from "@/lib/formato.ts";
import { getPronostico } from "@/lib/openmeteo.ts";
import { ordenarParques } from "@/lib/parques.ts";
import { lecturasParques, type LecturaParque } from "@/lib/salida.ts";
import { Icono, MarcaVolantin } from "@/components/Icono.tsx";
import { ReglaBandas } from "@/components/ReglaBandas.tsx";
import { Cielo } from "@/components/Cielo.tsx";
import { Volantin } from "@/components/Volantin.tsx";

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
  const zonaMejor = pronostico.zonas.find((z) => z.id === mejor.zonaId);
  const hoy = ahora.toISOString().slice(0, 10);
  const delDia = (fechas: readonly string[] | undefined) =>
    fechas?.find((d) => d.slice(0, 10) === hoy);
  const anda = banda === "ideal" || banda === "liviano";
  // A flat "no" would talk the visitor out of the app; point at the next window.
  const proxima = ordenados
    .flatMap((p) => (p.ventanaDiurna ? [{ parque: p, v: p.ventanaDiurna }] : []))
    .sort((a, b) => Date.parse(a.v.inicio) - Date.parse(b.v.inicio))[0];

  return (
    <div className="portada">
      <header className="app-topbar">
        <a className="app-marca" href="/app">
          <MarcaVolantin />
          <span>encumbra</span>
        </a>
        <span className="portada-ciudad">Santiago, Chile</span>
      </header>

      <main>
        <section className="portada-hero">
          <Volantin className="portada-volantin" banda={banda} />
          <div className="portada-decir">
            <h1>El cielo es tuyo.</h1>
            <p className="portada-sub">
              Encumbra mira el viento de {parques.length} parques de Santiago y
              te dice en cuál anda, a qué hora y con qué volantín.
            </p>
            <a className="portada-accion" href="/app">
              Ver parques cerca
              <Icono nombre="flecha" />
            </a>
          </div>

          <div className="portada-tarjeta" data-estado={banda ?? "sin-datos"}>
            <span className="portada-tarjeta__ahora">Ahora en Santiago</span>
            <strong className="portada-tarjeta__palabra">
              {banda ? VEREDICTOS[banda] : "SIN DATOS"}
            </strong>
            <p className="portada-tarjeta__detalle">
              {banda
                ? anda && mejor.ventanaDiurna
                  ? `${nombreLugar(mejor)}, ${cuando(mejor.ventanaDiurna, ahora)}`
                  : proxima
                    ? `Aguanta: el mejor rato es ${cuando(proxima.v, ahora)} en ${nombreLugar(proxima.parque)}.`
                    : CONSEJOS[banda]
                : "No pudimos leer el viento ahora. La app igual te muestra los parques."}
            </p>
            {mejor.hora ? (
              <dl className="portada-datos">
                <div>
                  <dt>Viento</dt>
                  <dd>{formatearVelocidad(mejor.hora.viento)}</dd>
                </div>
                <div>
                  <dt>Rachas</dt>
                  <dd>{formatearVelocidad(mejor.hora.racha)}</dd>
                </div>
                <div>
                  <dt>Actualizado</dt>
                  <dd>
                    {pronostico.actualizadoEn
                      ? formatearHora(pronostico.actualizadoEn)
                      : "sin dato"}
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        </section>

        <section className="portada-cielo">
          <Cielo horas={mejor.horas} ahora={mejor.hora?.fecha} />
        </section>

        <section className="portada-lista">
          <div className="portada-lista__titulo">
            <h2>Los mejores ahora</h2>
            <span>{parques.length} parques en total</span>
          </div>
          <ul>
            {ordenados.slice(0, 4).map((p, i) => (
              <li key={p.id} className="parque-fila">
                <a
                  className="parque-abrir"
                  href={`/app?parque=${p.id}&zona=${p.zonaId}`}
                >
                  <span className="parque-simbolo">{i + 1}</span>
                  <span className="parque-identidad">
                    <strong>{p.nombre}</strong>
                    {p.nombre === p.comuna ? null : <span>{p.comuna}</span>}
                  </span>
                  <span
                    className="parque-condicion"
                    data-estado={p.banda ?? "sin-datos"}
                  >
                    <span>
                      <i />
                      {p.banda ? ETIQUETAS[p.banda] : "sin dato"}
                    </span>
                    <small>
                      {p.hora ? formatearVelocidad(p.hora.viento) : "—"}
                    </small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a className="portada-vertodos" href="/app">
            Ver los {parques.length} parques en el mapa
            <Icono nombre="flecha" />
          </a>
        </section>

        <section className="portada-escala">
          <h2>Cómo lo decide</h2>
          <p className="portada-sub">
            Un modelo calibrado con cinco años de viento de Santiago. Estos son
            los cortes reales, los mismos que usa la app.
          </p>
          <ReglaBandas viento={mejor.hora?.viento ?? null} />
          <p className="portada-honestidad">
            Esto es pronóstico, no medición en terreno. El viento del parque
            puede ser otro: mira el árbol antes de armar.
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
      </footer>
    </div>
  );
}
