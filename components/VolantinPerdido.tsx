import { VolantinPapel } from "./VolantinPapel.tsx";
import styles from "./VolantinPerdido.module.css";

/** One 4.8-second scene: tension, a broken line, then an empty sky. */
export function VolantinPerdido() {
  return (
    <svg className={styles.scene} viewBox="0 0 360 320" aria-hidden="true" focusable="false">
      <path className={styles.tether} d="M81 201 Q130 203 255.5 132.84" />
      <path className={styles.looseEnd} d="M81 201 Q105.5 202 149.125 184.96" />

      <g className={styles.escape}>
        <path className={styles.flyingEnd} d="M149.125 184.96 Q192.75 167.92 255.5 132.84" />
        <g className={styles.sway}>
          <svg x="190" y="0" width="180" height="285" overflow="visible">
            <VolantinPapel banda="liviano" encuadre="icono" className={styles.kite} />
          </svg>
        </g>
      </g>

      <path className={styles.snap} d="M141 175l-4-5m15 3 2-6m5 17 6 1" />

      <ellipse cx="83" cy="298" rx="49" ry="5" fill="currentColor" opacity=".07" />
      <g transform="translate(78 246) rotate(-18)">
        <g className={styles.reel}>
          {/* Two wooden flanges, wound white thread, perforated face and axle. */}
          <ellipse cx="-16" rx="34" ry="45" fill="#a9783f" stroke="#76542e" />
          <ellipse cx="-18" rx="30" ry="42" fill="#d4b17a" stroke="#edcea0" />
          <path d="M-16-40H14V40H-16C-40 31-40-31-16-40Z" fill="#e9e5d8" stroke="#b5ad97" />
          {[-12, -7, -2, 3, 8].map((x) => (
            <path key={x} d={`M${x}-39C${x - 26}-28 ${x - 26} 28 ${x} 39`} fill="none" stroke="#faf8ef" strokeWidth="2" />
          ))}
          <ellipse cx="14" rx="34" ry="45" fill="#bf9457" stroke="#76542e" />
          <ellipse cx="14" rx="30" ry="41" fill="#dabb83" stroke="#f0d6a6" strokeWidth="2" />
          <ellipse cx="14" rx="25" ry="35" fill="none" stroke="#b78c50" strokeWidth=".8" />
          <g className={styles.holes} fill="#937044" stroke="#edd3a5" strokeWidth="1.2">
            <ellipse cx="14" cy="-26" rx="5.5" ry="7" />
            <ellipse cx="30" cy="-15" rx="5" ry="6.5" />
            <ellipse cx="30" cy="15" rx="5" ry="6.5" />
            <ellipse cx="14" cy="26" rx="5.5" ry="7" />
            <ellipse cx="-2" cy="15" rx="5" ry="6.5" />
            <ellipse cx="-2" cy="-15" rx="5" ry="6.5" />
          </g>
          <ellipse cx="14" rx="9" ry="11" fill="#966432" />
          <path d="M14-7 36-2V12L14 7Z" fill="#b68a4e" stroke="#946a37" />
          <ellipse cx="36" cy="5" rx="6" ry="7" fill="#dfbf87" stroke="#a67b43" />
          <path d="M15-4 33 0" fill="none" stroke="#e8c990" />
        </g>
      </g>
    </svg>
  );
}
