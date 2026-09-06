import type { CSSProperties } from "react";

import {
  RACHA_PELIGRO,
  type Perfil,
} from "@/lib/bandas.ts";
import { formatearVelocidad } from "@/lib/formato.ts";
import type { HoraPronostico } from "@/lib/openmeteo.ts";
import { fraseBrecha } from "@/lib/planear.ts";

export type LecturaPerfil = {
  readonly perfil: Perfil;
  readonly hora: HoraPronostico;
};

type BrechaProps = {
  readonly lecturas: readonly LecturaPerfil[];
};

type EstiloBrecha = CSSProperties & {
  "--ancho-viento": string;
  "--ancho-racha": string;
};

export function Brecha({ lecturas }: BrechaProps) {
  return (
    <section className="brecha" aria-labelledby="titulo-brecha">
      <div className="bloque__contenido">
        <h2 id="titulo-brecha">No todo viento se siente igual</h2>
        <p className="bloque__bajada">
          El viento sostiene. La racha tira del hilo.
        </p>

        <div className="brecha__lecturas">
          {lecturas.map(({ perfil, hora }) => {
            const estilo: EstiloBrecha = {
              "--ancho-viento": `${Math.min(hora.viento / RACHA_PELIGRO, 1) * 100}%`,
              "--ancho-racha": `${Math.min(hora.racha / RACHA_PELIGRO, 1) * 100}%`,
            };

            return (
              <div
                className="brecha__lectura"
                data-perfil={perfil}
                data-banda={hora.banda}
                key={perfil}
                style={estilo}
              >
                <div className="brecha__valores" aria-label={`Viento ${formatearVelocidad(hora.viento)}; rachas ${formatearVelocidad(hora.racha)}`}>
                  <div className="brecha__lado brecha__lado--viento">
                    <span>viento</span>
                    <strong>
                      {Math.round(hora.viento)}
                      <small>km/h</small>
                    </strong>
                    <i aria-hidden="true" />
                  </div>
                  <div className="brecha__lado brecha__lado--racha">
                    <span>racha</span>
                    <strong>
                      {Math.round(hora.racha)}
                      <small>km/h</small>
                    </strong>
                    <i aria-hidden="true" />
                  </div>
                </div>
                <p className="brecha__frase">{fraseBrecha(hora, perfil)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
