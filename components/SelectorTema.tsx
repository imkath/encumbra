/**
 * El cambio se resuelve en el layout antes de hidratar. Así este control sirve
 * también en la portada sin crear una tercera isla de cliente.
 */
export function SelectorTema({ compacto = false }: { compacto?: boolean }) {
  return (
    <button
      type="button"
      className={`selector-tema${compacto ? " selector-tema--compacto" : ""}`}
      data-theme-toggle
      role="switch"
      aria-checked="false"
      aria-label="Tema oscuro"
      title="Cambiar a tema oscuro"
    >
      <span className="selector-tema__cielo" aria-hidden="true">
        <svg viewBox="0 0 36 36" focusable="false">
          <g className="selector-tema__sol">
            <circle cx="18" cy="16" r="5" />
            <path d="M18 5v3M18 24v3M7 16h3M26 16h3M10.2 8.2l2.1 2.1M23.7 21.7l2.1 2.1M25.8 8.2l-2.1 2.1M12.3 21.7l-2.1 2.1" />
          </g>
          <g className="selector-tema__luna">
            <path d="M23.7 21.8A8.5 8.5 0 0 1 14.2 9a8.5 8.5 0 1 0 9.5 12.8Z" />
            <circle className="selector-tema__estrella selector-tema__estrella--uno" cx="26.5" cy="8" r="1" />
            <circle className="selector-tema__estrella selector-tema__estrella--dos" cx="29" cy="14" r=".75" />
          </g>
          <path className="selector-tema__brisa" d="M6 30c5-3 9-3 13 0 4 3 7 2 11-1" />
        </svg>
      </span>
      <span className="selector-tema__texto" aria-hidden="true">
        <span className="selector-tema__estado selector-tema__estado--claro">
          Claro
        </span>
        <span className="selector-tema__estado selector-tema__estado--oscuro">
          Oscuro
        </span>
      </span>
    </button>
  );
}
