import Link from "next/link";

import { GuiaArticulo } from "@/components/GuiaArticulo.tsx";
import { GUIAS, metadatosGuia } from "@/lib/seo.ts";

const GUIA = GUIAS[2];
export const metadata = metadatosGuia(GUIA);

export default function SeguridadAlEncumbrar() {
  return (
    <GuiaArticulo guia={GUIA}>
      <section>
        <h2>Checklist antes de elevar</h2>
        <ul className="guia-checklist">
          <li>Elige una explanada autorizada, abierta y lejos del tendido eléctrico.</li>
          <li>No uses hilo curado, hilo de competencia ni nylon.</li>
          <li>No fabriques el volantín con metal o papel de aluminio.</li>
          <li>No cruces calles ni entres a una autopista para perseguir uno cortado.</li>
          <li>No subas a postes, torres, techos o árboles para recuperarlo.</li>
          <li>Usa carrete y recoge todo el hilo al terminar.</li>
          <li>Si van niñas o niños, que los acompañe una persona adulta.</li>
          <li>Revisa viento y rachas; si Encumbra indica peligro, no salgas.</li>
        </ul>
      </section>

      <section>
        <h2>Qué dice la ley chilena sobre el hilo curado</h2>
        <p>
          La Ley 20.700 sanciona fabricar, comercializar, almacenar, transportar
          o usar hilo curado. También limita el hilo de competencia a personas
          adultas inscritas en clubes o asociaciones y a lugares determinados
          por la autoridad. Para una salida recreativa, la decisión segura es
          simple: usa hilo de algodón corriente, sin elementos abrasivos ni
          cortantes.
        </p>
        <div className="guia-resumen" role="note">
          <strong>Ojo con la palabra “permitido”</strong>
          <p>
            Un recinto incluido por una autoridad sigue sujeto a horario,
            cierres, señalización y reglas del día. Revisa el acceso en el lugar.
          </p>
        </div>
      </section>

      <section>
        <h2>El viento también es parte de la seguridad</h2>
        <p>
          No mires solo el promedio. Las rachas fuertes pueden tensar el hilo de
          golpe, volver difícil el control o arrastrar el volantín hacia una vía.
          Encumbra compara viento y rachas por tipo de volantín y marca peligro
          cuando cualquiera llega a 45 km/h.
        </p>
        <p>
          <Link className="guia-enlace-accion" href="/guia/viento-para-volantines">
            Ver los rangos por tipo de volantín →
          </Link>
        </p>
      </section>

      <section className="guia-fuentes">
        <h2>Fuentes oficiales</h2>
        <ul>
          <li>
            <a href="https://www.bcn.cl/leychile/navegar?idNorma=1054358" target="_blank" rel="noopener noreferrer">
              Biblioteca del Congreso Nacional: Ley 20.700 ↗
            </a>
          </li>
          <li>
            <a href="https://energia.gob.cl/noticias/nacional/elevalo-bien-consejos-para-encumbrar-volantin-de-forma-responsable" target="_blank" rel="noopener noreferrer">
              Ministerio de Energía: consejos para encumbrar responsablemente ↗
            </a>
          </li>
          <li>
            <a href="https://concesiones.mop.gob.cl/ministro-garcia-da-a-conocer-mapa-con-20-puntos-criticos-para-elevar-volantines-en-zonas-cercanas-a-autopistas-de-la-rm/" target="_blank" rel="noopener noreferrer">
              MOP: puntos críticos cerca de autopistas de Santiago ↗
            </a>
          </li>
        </ul>
      </section>
    </GuiaArticulo>
  );
}
