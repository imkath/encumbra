import type { CSSProperties } from "react";

import { RACHA_PELIGRO, VEREDICTOS, type Perfil } from "@/lib/bandas.ts";
import { formatearHora, formatearVelocidad } from "@/lib/formato.ts";
import type { HoraPronostico } from "@/lib/openmeteo.ts";

type ColaProps = {
  readonly perfiles: readonly {
    readonly perfil: Perfil;
    readonly horas: readonly HoraPronostico[];
  }[];
};

type EstiloSegmento = CSSProperties & {
  "--ancho-cola": string;
  "--indice-cola": number;
};

export function Cola({ perfiles }: ColaProps) {
  const estandar = perfiles.find(({ perfil }) => perfil === "estandar");
  const liviano = perfiles.find(({ perfil }) => perfil === "liviano");
  const acrobatico = perfiles.find(({ perfil }) => perfil === "acrobatico");

  if (!estandar || !liviano || !acrobatico) {
    return null;
  }

  return (
    <section className="cola" aria-labelledby="titulo-cola">
      <div className="bloque__contenido">
        <h2 id="titulo-cola">Encuentra tu hora</h2>
        <p className="bloque__bajada">
          Las próximas 12 horas, para salir con tiempo. Abre una hora para ver
          viento, rachas y lluvia.
        </p>

        <div className="cola__leyenda">
          <span>Hora</span>
          <span>Fuerza de la racha</span>
          <span>Tu volantín</span>
        </div>
        <ol className="cola__lista">
          {estandar.horas.map((hora, indice) => {
            const horaLiviana = liviano.horas[indice];
            const horaAcrobatica = acrobatico.horas[indice];

            if (!horaLiviana || !horaAcrobatica) {
              return null;
            }

            const ancho = Math.min(hora.racha / RACHA_PELIGRO, 1) * 100;
            const estilo: EstiloSegmento = {
              "--ancho-cola": `${ancho}%`,
              "--indice-cola": indice,
            };

            return (
              <li className="cola__hora" key={hora.fecha} style={estilo}>
                <details>
                  <summary>
                    <time dateTime={hora.fecha}>
                      {formatearHora(hora.fecha)}
                    </time>
                    <span className="cola__riel" aria-hidden="true">
                      <span
                        className="cola__segmento"
                        data-banda={hora.banda}
                        data-banda-liviano={horaLiviana.banda}
                        data-banda-acrobatico={horaAcrobatica.banda}
                      />
                    </span>
                    <span className="cola__estado">
                      {[
                        { perfil: "estandar", hora },
                        { perfil: "liviano", hora: horaLiviana },
                        { perfil: "acrobatico", hora: horaAcrobatica },
                      ].map(({ perfil, hora: lectura }) => (
                        <span
                          key={perfil}
                          className="veredicto__variante"
                          data-perfil={perfil}
                        >
                          {VEREDICTOS[lectura.banda]}
                        </span>
                      ))}
                    </span>
                  </summary>
                  <p className="cola__detalle">
                    <span>
                      viento {formatearVelocidad(hora.viento)} · rachas{" "}
                      {formatearVelocidad(hora.racha)} · lluvia{" "}
                      {hora.probabilidadPrecipitacion}%
                    </span>
                  </p>
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
