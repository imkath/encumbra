import { CONSEJOS, VEREDICTOS, type Perfil } from "@/lib/bandas.ts";
import { formatearHora, formatearVelocidad } from "@/lib/formato.ts";
import type { HoraPronostico } from "@/lib/openmeteo.ts";
import type { Ventana } from "@/lib/ventanas.ts";

export type VarianteVeredicto = {
  readonly perfil: Perfil;
  readonly hora: HoraPronostico;
  readonly proxima: Ventana | null;
  readonly alternativas: readonly {
    readonly id: string;
    readonly nombre: string;
  }[];
};

type VeredictoProps = {
  readonly variantes: readonly VarianteVeredicto[];
  readonly zona: string;
  readonly actualizadoEn: string;
  readonly desactualizado: boolean;
};

export function Veredicto({
  variantes,
  zona,
  actualizadoEn,
  desactualizado,
}: VeredictoProps) {
  const estandar = variantes.find(({ perfil }) => perfil === "estandar");
  const liviano = variantes.find(({ perfil }) => perfil === "liviano");
  const acrobatico = variantes.find(({ perfil }) => perfil === "acrobatico");

  if (!estandar || !liviano || !acrobatico) {
    return null;
  }

  return (
    <section
      className="veredicto"
      data-banda={estandar.hora.banda}
      data-banda-liviano={liviano.hora.banda}
      data-banda-acrobatico={acrobatico.hora.banda}
      aria-labelledby="veredicto"
    >
      <div className="veredicto__contenido">
        <p className="veredicto__momento">Ahora en {zona}</p>
        <h2 id="veredicto" className="veredicto__palabra">
          {variantes.map(({ perfil, hora }) => {
            const palabra = VEREDICTOS[hora.banda];
            return (
              <span
                className="veredicto__variante"
                data-perfil={perfil}
                data-largo={
                  palabra.length > 8
                    ? "maximo"
                    : palabra.length > 6
                      ? "true"
                      : "false"
                }
                key={perfil}
              >
                {palabra}
              </span>
            );
          })}
        </h2>

        <p className="veredicto__viento">
          viento {formatearVelocidad(estandar.hora.viento)} · rachas{" "}
          {formatearVelocidad(estandar.hora.racha)}
        </p>
        <p className="veredicto__lugar">
          Pronóstico de las
          <time dateTime={estandar.hora.fecha}>
            {formatearHora(estandar.hora.fecha)}
          </time>
        </p>

        <p className="veredicto__consejo">
          <span className="solo-lectura">Consejo: </span>
          {variantes.map(({ perfil, hora }) => (
            <span
              className="veredicto__variante"
              data-perfil={perfil}
              key={perfil}
            >
              {CONSEJOS[hora.banda]}
            </span>
          ))}
        </p>

        <div className="veredicto__alternativas">
          {variantes.map(({ perfil, hora, alternativas }) => {
            if (hora.banda === "ideal" && alternativas.length === 0) {
              return null;
            }

            return (
              <div
                className="veredicto__alternativa"
                data-perfil={perfil}
                key={perfil}
              >
                {alternativas.length > 0 ? (
                  <>
                    <p>
                      {hora.banda === "ideal"
                        ? "También anda ahora en"
                        : "Sí anda ahora en"}
                    </p>
                    <ul>
                      {alternativas.map(({ id, nombre }) => (
                        <li key={id}>
                          <a
                            href={`/?zona=${encodeURIComponent(id)}&perfil=${perfil}`}
                          >
                            {nombre}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>No anda ahora en ninguna de las seis zonas.</p>
                )}
              </div>
            );
          })}
        </div>

        {variantes.map(({ perfil, hora, proxima }) =>
          hora.banda !== "ideal" && proxima ? (
            <p className="veredicto__proxima" data-perfil={perfil} key={perfil}>
              a las{" "}
              <time dateTime={proxima.inicio}>
                {formatearHora(proxima.inicio)}
              </time>{" "}
              anda
            </p>
          ) : null,
        )}

        <p className="veredicto__fuente">
          Pronóstico Open-Meteo · actualizado{" "}
          <time dateTime={actualizadoEn}>{formatearHora(actualizadoEn)}</time>
        </p>
        {desactualizado ? (
          <p className="veredicto__estado">
            sin señal · último dato de las{" "}
            <time dateTime={actualizadoEn}>{formatearHora(actualizadoEn)}</time>
          </p>
        ) : null}
      </div>
    </section>
  );
}
