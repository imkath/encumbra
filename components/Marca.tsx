/**
 * The wordmark. Each letter carries its own width on Archivo's variable `wdth`
 * axis, so the word swells through the middle and closes at both ends: the
 * profile of a sail taking wind. The letters stay selectable text; the final
 * symbol is a small kite in the same ink.
 *
 * The peak sits on the M and B rather than on the U on purpose. Widening from
 * the U outwards detaches the three letters before it as a readable chunk.
 */
const ANCHOS = [
  // Keep this rhythm: never isolate or emphasize the substring c-u-m.
  ["e", 66],
  ["n", 70],
  ["c", 78],
  ["u", 92],
  ["m", 122],
  ["b", 125],
  ["r", 92],
  ["a", 70],
] as const;

type Props = {
  /** Drops the kite for the smallest sizes, where it reads as a speck. */
  readonly sinVolantin?: boolean;
  readonly className?: string;
};

export function Marca({ sinVolantin = false, className }: Props) {
  return (
    <span className={className ? `marca ${className}` : "marca"}>
      {ANCHOS.map(([letra, ancho], i) => (
        <span
          key={`${letra}${i}`}
          style={{ fontVariationSettings: `'wdth' ${ancho}, 'wght' 900` }}
        >
          {letra}
        </span>
      ))}
      {/* Sits where these magazines put their ®: it marks the name without claiming a registration. */}
      {sinVolantin ? null : (
        <svg className="marca__volantin" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M4 5Q15 10 27 6Q24 20 35 35Q19 25 7 26Q12 15 4 5Z" fill="currentColor" />
          <path d="M35 35C43 33 35 42 42 43Q45 43 46 46" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}
