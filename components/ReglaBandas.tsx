import { VEREDICTOS } from "@/lib/bandas.ts";
import { tramosDeBanda, REGLA_TOPE } from "@/lib/score.ts";

/**
 * A wind chart, not a traffic light. The strip reads as one continuum from
 * still air to gale; the lime block is the window that actually flies, which
 * is the only thing the reader has to find. Labels carry the meaning so the
 * colour is never doing the work alone.
 */
export function ReglaBandas({ viento }: { viento: number | null }) {
  const tramos = tramosDeBanda();
  const ideal = tramos.find((t) => t.id === "ideal");
  const pct = (valor: number) => (valor / REGLA_TOPE) * 100;
  const posicion =
    viento === null ? null : pct(Math.min(Math.max(viento, 0), REGLA_TOPE));

  return (
    <figure className="regla">
      <div className="regla-pista">
        {ideal ? (
          <span
            className="regla-vuela"
            style={{
              left: `${pct(ideal.desde)}%`,
              width: `${pct(ideal.hasta - ideal.desde)}%`,
            }}
          >
            <b>vuela</b>
          </span>
        ) : null}
        {posicion === null ? null : (
          <span className="regla-ahora" style={{ left: `${posicion}%` }}>
            <b>{Math.round(viento!)} km/h ahora</b>
          </span>
        )}
      </div>
      <ol className="regla-cortes">
        {tramos.map((tramo) => (
          <li
            key={tramo.id + tramo.desde}
            data-banda={tramo.id}
            style={{ flexGrow: tramo.hasta - tramo.desde }}
          >
            <em>{Math.round(tramo.desde)}</em>
            <span>{VEREDICTOS[tramo.id]}</span>
          </li>
        ))}
      </ol>
      <figcaption>
        Viento sostenido en km/h, para un volantín estándar. Con rachas fuertes
        el corte baja antes.
      </figcaption>
    </figure>
  );
}
