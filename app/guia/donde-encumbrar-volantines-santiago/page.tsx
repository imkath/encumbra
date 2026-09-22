import Link from "next/link";

import { GuiaArticulo } from "@/components/GuiaArticulo.tsx";
import { PARQUES, parquesProponibles } from "@/lib/parques.ts";
import { GUIAS, metadatosGuia } from "@/lib/seo.ts";

const GUIA = GUIAS[1];
export const metadata = metadatosGuia(GUIA);

const RECINTOS = Array.from(
  new Map(
    parquesProponibles(PARQUES).map((parque) => [parque.recintoId, parque]),
  ).values(),
).sort((a, b) => a.nombre.localeCompare(b.nombre, "es-CL"));

export default function DondeEncumbrar() {
  return (
    <GuiaArticulo guia={GUIA}>
      <section>
        <h2>Antes de elegir un parque</h2>
        <p>
          Que un parque aparezca en una lista no significa que siempre esté
          abierto ni que toda su superficie sea adecuada. Confirma horarios y
          reglas, busca una explanada sin cables y revisa el viento de esa hora.
          Encumbra separa el estado del lugar del pronóstico para no confundir
          una autorización con una garantía de seguridad.
        </p>
      </section>

      <section>
        <div className="guia-seccion-titulo">
          <div>
            <p className="guia-ceja">Selección con fuente</p>
            <h2>{RECINTOS.length} recintos para revisar en Santiago</h2>
          </div>
          <Link href="/app">Comparar viento ahora →</Link>
        </div>
        <ul className="guia-lugares">
          {RECINTOS.map((parque) => (
            <li key={parque.recintoId}>
              <div>
                <strong>{parque.nombre.replace(/ · tramo \d+$/, "")}</strong>
                <span>{parque.comuna}</span>
              </div>
              <Link href={`/app?parque=${parque.id}&zona=${parque.zonaId}`}>
                Ver pronóstico
              </Link>
            </li>
          ))}
        </ul>
        <p className="guia-nota">
          Los tramos de Mapocho Río se muestran como un solo recinto en esta
          lista; la aplicación permite revisar sus puntos por separado.
        </p>
      </section>

      <section>
        <h2>Qué hace bueno a un lugar para elevar volantines</h2>
        <ol>
          <li><strong>Espacio despejado:</strong> lejos de cables, postes, árboles altos y calles.</li>
          <li><strong>Autorización vigente:</strong> las reglas y los horarios pueden cambiar por temporada o evento.</li>
          <li><strong>Viento compatible:</strong> un parque apropiado puede estar sin viento o con rachas fuertes.</li>
          <li><strong>Una revisión al llegar:</strong> el pronóstico no ve obstáculos pequeños ni cambios entre edificios.</li>
        </ol>
      </section>

      <section className="guia-fuentes">
        <h2>Fuentes y vigencia</h2>
        <p>
          La selección distingue recintos publicados por Parquemet de lugares
          cuyo permiso no está confirmado. La última revisión editorial fue el
          22 de septiembre de 2026; confirma la información antes de ir.
        </p>
        <ul>
          <li>
            <a href="https://www.minvu.gob.cl/noticia/ministro-montes-informa-sobre-los-parques-metropolitanos-donde-se-pueden-elevar-volantines/" target="_blank" rel="noopener noreferrer">
              MINVU: parques metropolitanos habilitados y criterios de seguridad ↗
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/p/DdAFJBpAZRn/" target="_blank" rel="noopener noreferrer">
              Publicación de Parquemet consultada para el catálogo vigente ↗
            </a>
          </li>
        </ul>
      </section>
    </GuiaArticulo>
  );
}
