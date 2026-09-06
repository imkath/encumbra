import type { BandaId } from "@/lib/bandas.ts";
import { brida, hilo, volantinEnEquilibrio } from "@/lib/fisica.ts";

type Props = {
  banda: BandaId | null;
  /** Set when the sun is down: nobody flies at night, so it comes down. */
  deNoche?: boolean;
  className?: string;
};

const ANCHO = 260;
const ALTO = 640;
/** The hand holding it, and the length of line let out. */
const MANO = { x: 216, y: ALTO - 8 };
const LARGO = 470;

/**
 * One kite, used on the landing and on the field screen. Position, lean and the
 * sag of its line are solved in lib/fisica.ts: the line is a real catenary, so
 * slack wind lets it belly down and a good breeze pulls it near straight.
 *
 * Line and kite live in the same group, and the line ends at the bridle rather
 * than at the centre of the sail. Animating them apart, or tying the string to
 * the middle of the diamond, is what made the kite look unattached.
 */
export function Volantin({ banda, deNoche = false, className }: Props) {
  const efectiva: BandaId | null = deNoche ? "plancha" : banda;
  const { posicion, inclinacion, tension } = volantinEnEquilibrio(
    efectiva,
    MANO,
    LARGO,
  );
  const nudo = brida(posicion, inclinacion);
  const trazo = hilo(MANO, nudo, LARGO);
  const vuela = tension > 0.4;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-label={vuela ? "Volantín volando" : "Volantín que apenas se levanta"}
    >
      {/* Everything that swings, swings together. */}
      <g
        className="volantin-conjunto"
        style={
          { "--pendulo": `${(1 - tension) * 4 + 0.8}deg` } as React.CSSProperties
        }
      >
        <path className="volantin-hilo" d={trazo} />
        <g
          transform={`translate(${posicion.x.toFixed(1)} ${posicion.y.toFixed(1)}) rotate(${inclinacion.toFixed(1)})`}
        >
          <path className="volantin-vela" d="M 0 -42 L 28 0 L 0 42 L -28 0 Z" />
          <path className="volantin-varilla" d="M 0 -42 L 0 42 M -28 0 L 28 0" />
          {/* The bridle: the short leader the line is actually tied to. */}
          <path className="volantin-brida" d="M -13 0 L 0 16 L 13 0" />
          <path
            className="volantin-cola"
            d="M 0 42 q 18 24 -6 40 q -24 16 -4 38 q 18 20 -2 36"
          />
        </g>
      </g>
    </svg>
  );
}
