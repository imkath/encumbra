import { VolantinPapel } from "./VolantinPapel.tsx";
import { trazarCielo } from "@/lib/cielo.ts";
import { formatearHora } from "@/lib/formato.ts";

type Props = {
  horas: readonly { fecha: string; viento: number }[];
  ahora?: string;
};

/**
 * The next twelve hours of wind as a ridge, with the stretch that actually
 * flies laid over it in color and a kite resting on the current hour. It reads
 * as a picture and answers a question: does the curve enter the band today.
 *
 * The curve stretches to fill its box, so the kite lives outside the SVG as a
 * positioned element: inside it would be squashed by the same scaling, and it
 * shares the percentage maths with the hour labels so both stay in step.
 */
export function Cielo({ horas, ahora }: Props) {
  const cielo = trazarCielo(horas, ahora);
  if (cielo.puntos.length < 2) return null;
  const marca = cielo.ahora;
  const enBanda =
    marca !== null &&
    marca.y <= cielo.vuela.abajo &&
    marca.y >= cielo.vuela.arriba;
  const izquierda = (x: number) => `${(x / cielo.ancho) * 100}%`;
  const arriba = (y: number) => `${(y / cielo.alto) * 100}%`;

  return (
    <figure className="cielo">
      <div className="cielo-lienzo">
        <svg
          viewBox={`0 0 ${cielo.ancho} ${cielo.alto}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Viento de las próximas ${horas.length} horas. La franja marcada es el rango en que un volantín vuela.`}
        >
          <defs>
            <linearGradient id="cielo-relleno" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--app-ink)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--app-ink)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect
            className="cielo-vuela"
            x="0"
            y={cielo.vuela.arriba}
            width={cielo.ancho}
            height={cielo.vuela.abajo - cielo.vuela.arriba}
          />
          <path className="cielo-relleno" d={cielo.relleno} />
          <path className="cielo-cresta" d={cielo.cresta} />
        </svg>

        <span
          className="cielo-etiqueta"
          style={{ top: arriba(cielo.vuela.arriba) }}
        >
          aquí vuela
        </span>

        {marca ? (
          <span
            className="cielo-volantin"
            style={{ left: izquierda(marca.x), top: arriba(marca.y) }}
            data-vuela={enBanda ? "si" : "no"}
          >
            <VolantinPapel banda="ideal" encuadre="icono" />
          </span>
        ) : null}
      </div>

      <ol className="cielo-horas" aria-hidden="true">
        {cielo.puntos
          .filter((_, i) => i % 3 === 0)
          .map((p) => (
            <li key={p.fecha} style={{ left: izquierda(p.x) }}>
              {formatearHora(p.fecha)}
            </li>
          ))}
      </ol>
      <figcaption>
        Viento de las próximas {horas.length} horas. La franja clara es donde un
        volantín vuela.
      </figcaption>
    </figure>
  );
}
