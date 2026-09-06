import type { ReactNode } from "react";

import type { Perfil } from "@/lib/bandas.ts";

type SelectorVolantinProps = {
  readonly perfilInicial: Perfil;
  readonly zonaActual: string;
  readonly onPerfilChange?: (perfil: Perfil) => void;
};

function CometaPapel() {
  return (
    <svg aria-hidden="true" viewBox="0 0 220 220">
      <g stroke="#1a1a1a" strokeOpacity="0.25" strokeWidth="2">
        <polygon
          fill="none"
          points="100,10 160,70 100,130 40,70"
          vectorEffect="non-scaling-stroke"
        />
        <line x1="100" x2="100" y1="10" y2="130" />
        <line x1="40" x2="160" y1="70" y2="70" />
      </g>
      <polygon fill="#E96D12" points="100,70 100,10 40,70" />
      <polygon fill="#0081C9" points="100,70 160,70 100,10" />
      <polygon fill="#6C2CA7" points="100,70 100,130 160,70" />
      <polygon fill="#E4E91A" points="100,70 40,70 100,130" />
      <path
        d="M100,130 C85,155 115,175 95,200"
        fill="none"
        stroke="#1a1a1a"
        strokeOpacity="0.25"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <g>
        <polygon fill="#F04D98" points="86,155 93,150 100,155 93,160" />
        <polygon fill="#00A7D1" points="94,168 101,163 108,168 101,173" />
        <polygon fill="#FFB703" points="87,182 94,177 101,182 94,187" />
        <polygon fill="#7BD389" points="93,196 100,191 107,196 100,201" />
      </g>
    </svg>
  );
}

function CometaConCola() {
  return (
    <svg aria-hidden="true" viewBox="0 0 220 220">
      <g stroke="#1a1a1a" strokeOpacity="0.25" strokeWidth="2">
        <polygon
          fill="none"
          points="110,18 172,80 110,142 48,80"
          vectorEffect="non-scaling-stroke"
        />
        <line x1="110" x2="110" y1="18" y2="142" />
        <line x1="48" x2="172" y1="80" y2="80" />
      </g>
      <polygon fill="#19B394" points="110,80 110,18 48,80" />
      <polygon fill="#FF7F50" points="110,80 172,80 110,18" />
      <polygon fill="#5B3FD6" points="110,80 110,142 172,80" />
      <polygon fill="#FFD166" points="110,80 48,80 110,142" />
      <polygon
        fill="#1C8EF9"
        fillOpacity="0.85"
        points="110,18 130,60 110,80 90,60"
      />
      <path
        d="M110,142 C130,165 90,178 115,198"
        fill="none"
        stroke="#1a1a1a"
        strokeOpacity="0.25"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <polygon fill="#FF5A5F" points="114,160 121,155 128,160 121,165" />
      <polygon fill="#06D6A0" points="99,173 106,168 113,173 106,178" />
      <polygon fill="#FFD166" points="111,187 118,182 125,187 118,192" />
    </svg>
  );
}

function CometaAcrobatico() {
  return (
    <svg aria-hidden="true" viewBox="0 0 230 230">
      <polygon fill="#fff" fillOpacity="0.92" points="115,18 28,122 202,122" />
      <polygon fill="#43AA8B" points="115,18 28,122 92,122" />
      <polygon fill="#F3722C" points="115,18 92,122 138,122" />
      <polygon fill="#277DA1" points="115,18 138,122 202,122" />
      <g
        fill="none"
        stroke="#1a1a1a"
        strokeOpacity="0.28"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      >
        <polygon points="115,18 28,122 202,122" />
        <line x1="115" x2="115" y1="18" y2="122" />
        <line x1="40" x2="190" y1="112" y2="112" />
        <path d="M115,138 C135,160 95,178 130,206" />
      </g>
      <circle cx="115" cy="28" fill="#fff" fillOpacity="0.85" r="6" />
      <polygon
        fill="#fff"
        points="115,112 127,138 103,138"
        stroke="#1a1a1a"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <polygon fill="#FF5A5F" points="117,155 124,150 131,155 124,160" />
      <polygon fill="#06D6A0" points="103,169 110,164 117,169 110,174" />
      <polygon fill="#FFD166" points="115,189 122,184 129,189 122,194" />
    </svg>
  );
}

const OPCIONES = [
  {
    perfil: "liviano",
    nombre: "Papel",
    detalle: "liviano",
    Cometa: CometaPapel,
  },
  {
    perfil: "estandar",
    nombre: "Con cola",
    detalle: "tradicional",
    Cometa: CometaConCola,
  },
  {
    perfil: "acrobatico",
    nombre: "Acrobático",
    detalle: "dos hilos",
    Cometa: CometaAcrobatico,
  },
] as const satisfies readonly {
  readonly perfil: Perfil;
  readonly nombre: string;
  readonly detalle: string;
  readonly Cometa: () => ReactNode;
}[];

export function SelectorVolantin({
  perfilInicial,
  zonaActual,
  onPerfilChange,
}: SelectorVolantinProps) {
  return (
    <form
      id="selector-volantin"
      className="selector-volantin"
      action="/"
      method="get"
      onChange={(event) => {
        const input = event.target;
        if (
          input instanceof HTMLInputElement &&
          (input.value === "liviano" ||
            input.value === "estandar" ||
            input.value === "acrobatico")
        )
          onPerfilChange?.(input.value);
      }}
    >
      <input type="hidden" name="zona" value={zonaActual} />
      <fieldset>
        <legend>¿Cuál vas a encumbrar?</legend>
        <div className="selector-volantin__opciones">
          {OPCIONES.map(({ perfil, nombre, detalle, Cometa }) => (
            <span className="selector-volantin__opcion" key={perfil}>
              <input
                id={`perfil-${perfil}`}
                type="radio"
                name="perfil"
                value={perfil}
                defaultChecked={perfil === perfilInicial}
              />
              <label htmlFor={`perfil-${perfil}`}>
                <Cometa />
                <strong>{nombre}</strong>
                <small>{detalle}</small>
              </label>
            </span>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
