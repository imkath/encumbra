import { useId, type CSSProperties } from "react";
import type { BandaId, Perfil } from "@/lib/bandas.ts";

type Props = {
  banda: BandaId | null;
  deNoche?: boolean;
  perfil?: Perfil;
  encuadre?: "sangra" | "tarjeta" | "icono";
  className?: string;
  terreno?: { ancho: number; alto: number };
};

type Punto = readonly [number, number];
type Curva = readonly [Punto, Punto, Punto, Punto];
const POSES: Record<BandaId, readonly [number, number, number, number]> = {
  ideal: [220, 92, 12, .86],
  liviano: [192, 122, -18, .76],
  plancha: [173, 185, -66, .8],
  bravo: [220, 95, 28, .82],
  peligro: [182, 190, -62, .82],
};

/** Matte paper takes its tint from the surrounding surface; posture expresses wind. */
export function VolantinPapel({ banda, deNoche = false, perfil = "estandar", encuadre = "sangra", className, terreno }: Props) {
  const clipId = useId();
  const guardado = deNoche || banda === null || banda === "peligro";
  const reposo = guardado || banda === "plancha";
  const pose = POSES[guardado ? "peligro" : banda ?? "plancha"];
  const ancho = terreno?.ancho ?? 360, alto = terreno?.alto ?? 300;
  const escalaCampo = Math.min(2, ancho / 340);
  const [x, y, giro, escala] = terreno
    ? [ancho * (reposo ? .84 : .65), reposo ? alto - 78 * escalaCampo : alto * (banda === "liviano" ? .39 : .28), pose[2], escalaCampo * (reposo ? .66 : .9)]
    : pose;
  const mano = terreno ? { x: ancho * (ancho <= 420 ? .94 : .14), y: alto + 18 } : { x: 52, y: 286 };
  const movimiento = terreno && !reposo;

  const delta = perfil === "acrobatico";
  const vela = delta
    ? "M0 -72 -96 60 0 30 96 60Z"
    : "M0 -90 Q34 -48 82 -18 Q30 38 0 120 Q-30 38 -82 -18 Q-34 -48 0 -90Z";
  const rad = giro * Math.PI / 180;
  const transformar = (px: number, py: number) => `${x + (px * Math.cos(rad) - py * Math.sin(rad)) * escala} ${y + (px * Math.sin(rad) + py * Math.cos(rad)) * escala}`;
  const nudo = transformar(delta ? -24 : 0, delta ? 30 : 15);
  const hiloCampo = reposo
    ? `M${mano.x} ${mano.y} C${ancho*.3} ${alto-12} ${ancho*.5} ${alto+8} ${nudo}`
    : `M${mano.x} ${mano.y} Q${ancho*(ancho <= 420 ? .88 : .3)} ${alto*(banda === "liviano" ? .86 : .7)} ${nudo}`;
  const hilo = terreno ? hiloCampo : reposo ? `M52 273 C88 292 105 244 ${nudo}` : banda === "liviano" ? `M52 286 Q132 270 ${nudo}` : `M52 286 Q142 201 ${nudo}`;
  const curvas: readonly [Curva, Curva] = guardado
    ? [[[0,120],[30,123],[32,143],[12,144]],[[12,144],[-5,146],[-13,132],[2,133]]]
    : [[[0,120],[-24,132],[46,148],[22,165]],[[22,165],[2,181],[-36,191],[-10,205]]];
  const cola = curvas.map((c, i) => `${i === 0 ? `M${c[0].join(" ")} ` : ""}C${c.slice(1).map(p => p.join(" ")).join(" ")}`).join(" ");
  // Each bow is attached to a sampled point of the tail, aligned to its tangent.
  function lazo(segmento: 0 | 1, t: number, color = "var(--paper-light)") {
    const c = curvas[segmento], u = 1 - t;
    const posicion = (i: 0 | 1) => u*u*u*c[0][i] + 3*u*u*t*c[1][i] + 3*u*t*t*c[2][i] + t*t*t*c[3][i];
    const pos = [posicion(0), posicion(1)];
    const tangente = (i: 0 | 1) => 3*u*u*(c[1][i]-c[0][i]) + 6*u*t*(c[2][i]-c[1][i]) + 3*t*t*(c[3][i]-c[2][i]);
    const angulo = Math.atan2(tangente(1), tangente(0)) * 180 / Math.PI - 90;
    return <g transform={`translate(${pos.join(" ")}) rotate(${angulo})`}><path d="M0 0 Q-8 -8 -14 -6 Q-11 0 -14 6 Q-6 7 0 0 Q8 -7 14 -6 Q11 0 14 6 Q6 7 0 0Z" fill={color} stroke="var(--paper-shade)" strokeWidth=".5"/><path d="M-1 -2 1 2" stroke="var(--paper-rib)" strokeWidth="1.5"/></g>;
  }
  return (
    <svg className={`volantin-papel ${className ?? ""}`} viewBox={terreno ? `0 0 ${ancho} ${alto}` : encuadre === "icono" ? "130 0 180 285" : encuadre === "tarjeta" ? "0 -35 360 370" : "0 0 360 300"} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" data-postura={reposo ? "reposo" : "vuelo"} data-perfil={perfil}>
      <defs>
        <clipPath id={clipId}><path d={vela}/></clipPath>
        <linearGradient id={`${clipId}-papel`} x1="0" y1="0" x2=".8" y2="1">
          <stop stopColor="var(--paper-light)"/>
          <stop offset=".48" stopColor="var(--paper-mid)"/>
          <stop offset="1" stopColor="var(--paper-shade)"/>
        </linearGradient>
      </defs>
      <g className={movimiento ? "volantin-campo-balanceo" : undefined} style={terreno ? { transformOrigin: `${mano.x}px ${mano.y}px`, "--vuelo-amplitud": banda === "bravo" ? "1.2deg" : banda === "liviano" ? ".45deg" : ".75deg", "--vuelo-duracion": banda === "bravo" ? "3.6s" : "7s" } as CSSProperties : undefined}>
      {!terreno && reposo && <path d="M100 273 Q225 279 314 272" fill="none" stroke="currentColor" opacity=".25"/>}
      {encuadre !== "icono" && <path d={hilo} fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".65"/>}
      {delta && <path d={terreno ? `M${mano.x+12} ${mano.y} Q${ancho*.4} ${alto*.7} ${transformar(24,30)}` : `M64 288 Q158 225 ${transformar(24,30)}`} fill="none" stroke="currentColor" strokeWidth="1" opacity=".65"/>}
      <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
        {perfil === "estandar" && <g><path d={cola} fill="none" stroke="currentColor" strokeWidth="1.3"/>{lazo(0,.4)}{!guardado && lazo(0,.95)}{lazo(1,.8)}</g>}
        <path d={vela} fill="var(--paper-base)" stroke="var(--paper-light)" strokeWidth=".6"/>
        <g clipPath={`url(#${clipId})`}>
          <path d={vela} fill={`url(#${clipId}-papel)`}/>
          <path d="M0 -90 0 120 -82 -18Z" fill="var(--paper-light)" opacity=".15"/>
        </g>
        <path d={vela} fill="none" stroke="var(--paper-shade)" strokeWidth=".65"/>
        <path d={delta ? "M0 -72V30M-96 60 0 30 96 60" : "M0 -90V120M-82 -18Q0 -36 82 -18"} fill="none" stroke="var(--paper-rib)" strokeWidth="1.15"/>
        <path d={delta ? "M-24 30 0 25 24 30" : "M-24 -25 0 15 24 -25M0 15V47"} fill="none" stroke="#494a40" strokeWidth=".9"/>
        <circle cx={delta ? -24 : 0} cy={delta ? 30 : 15} r="1.7" fill="#494a40"/>
        {delta && <circle cx="24" cy="30" r="1.7" fill="#494a40"/>}
      </g>
      </g>
    </svg>
  );
}
