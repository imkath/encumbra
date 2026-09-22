import Link from "next/link";

import { GuiaArticulo } from "@/components/GuiaArticulo.tsx";
import { PERFILES, VIENTO_PELIGRO } from "@/lib/bandas.ts";
import { GUIAS, metadatosGuia } from "@/lib/seo.ts";

const GUIA = GUIAS[0];
export const metadata = metadatosGuia(GUIA);

export default function VientoParaVolantines() {
  return (
    <GuiaArticulo guia={GUIA}>
      <section>
        <h2>La respuesta corta</h2>
        <p>
          Como referencia práctica, un volantín liviano trabaja mejor cerca de
          <strong> {PERFILES.liviano.centro} km/h</strong>, uno tradicional con
          cola cerca de <strong>{PERFILES.estandar.centro} km/h</strong> y uno
          acrobático cerca de <strong>{PERFILES.acrobatico.centro} km/h</strong>.
          No son mínimos universales: Encumbra evalúa también las rachas, la
          lluvia, la luz y la estabilidad de las horas siguientes.
        </p>
        <div className="guia-resumen" role="note">
          <strong>Una regla fácil</strong>
          <p>
            Si apenas se mueven las hojas, prueba con uno liviano. Si las ramas
            dan tirones o cuesta sostener el hilo, espera. Desde {VIENTO_PELIGRO}
            {" "}km/h de viento o racha, Encumbra indica no salir.
          </p>
        </div>
      </section>

      <section>
        <h2>Referencia por tipo de volantín</h2>
        <div className="guia-tabla" tabIndex={0} role="region" aria-label="Rangos de viento por tipo de volantín">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Centro favorable</th>
                <th>Techo de racha</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Liviano de papel</th>
                <td>{PERFILES.liviano.centro} km/h</td>
                <td>{PERFILES.liviano.techoRacha} km/h</td>
              </tr>
              <tr>
                <th>Tradicional con cola</th>
                <td>{PERFILES.estandar.centro} km/h</td>
                <td>{PERFILES.estandar.techoRacha} km/h</td>
              </tr>
              <tr>
                <th>Acrobático</th>
                <td>{PERFILES.acrobatico.centro} km/h</td>
                <td>{PERFILES.acrobatico.techoRacha} km/h</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          “Centro favorable” es la velocidad alrededor de la cual el modelo
          entrega su mejor evaluación. El techo de racha evita recomendar un
          momento que parece bueno por su promedio, pero viene con tirones
          demasiado fuertes para ese perfil.
        </p>
      </section>

      <section>
        <h2>Por qué no basta con mirar una velocidad</h2>
        <ul>
          <li><strong>Las rachas mandan:</strong> pueden tirar el volantín de golpe aunque el promedio sea cómodo.</li>
          <li><strong>El modelo tiene resolución limitada:</strong> edificios y árboles cambian el viento dentro del mismo barrio.</li>
          <li><strong>El tipo de volantín importa:</strong> uno liviano despega con menos aire que uno acrobático.</li>
          <li><strong>La hora importa:</strong> una lectura buena ahora no garantiza una tarde completa.</li>
        </ul>
      </section>

      <section>
        <h2>Cómo tomar la decisión</h2>
        <ol>
          <li>Elige en Encumbra el tipo de volantín que realmente llevarás.</li>
          <li>Revisa el veredicto y la ventana horaria, no solo el número actual.</li>
          <li>Compara la racha con el viento medio: una brecha grande anticipa tirones.</li>
          <li>Al llegar, mira árboles y banderas antes de armar; el parque puede sentirse distinto al modelo.</li>
        </ol>
        <p>
          <Link className="guia-enlace-accion" href="/app">
            Revisar el viento de Santiago ahora →
          </Link>
        </p>
      </section>

      <section className="guia-metodo">
        <h2>Cómo se construyó esta guía</h2>
        <p>
          Los valores son los mismos que usa Encumbra, calibrados con cinco
          años de datos horarios de Santiago y rangos de vuelo publicados por
          la American Kitefliers Association. Son una ayuda para decidir, no
          una certificación física ni una medición en el parque.
        </p>
      </section>
    </GuiaArticulo>
  );
}
