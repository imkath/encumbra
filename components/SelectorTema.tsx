import { Icono } from "./Icono.tsx";

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
      aria-label="Cambiar entre tema claro y oscuro"
      title="Cambiar apariencia"
    >
      <span className="selector-tema__sol" aria-hidden="true">
        <Icono nombre="sol" />
      </span>
      <span className="selector-tema__luna" aria-hidden="true">
        <Icono nombre="luna" />
      </span>
      <span className="selector-tema__texto">Tema</span>
    </button>
  );
}
