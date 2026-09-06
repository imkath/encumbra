import type { CSSProperties } from "react";
const trazos = {
  luna: <path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z" />,
  calendario: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18m-9 3v5m-2.5-2.5h5" /></>,
  buscar: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  cerca: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="m15 9-2 4-4 2 2-4Z" />
    </>
  ),
  ubicacion: (
    <>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
    </>
  ),
  viento: (
    <>
      <path d="M3 8h12c4 0 4-5 1-5M3 12h17M3 16h10c4 0 4 5 1 5" />
    </>
  ),
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  lluvia: (
    <>
      <path d="M6 14a4 4 0 0 1 0-8 6 6 0 0 1 11 0 4 4 0 0 1 1 8M8 17l-1 3m6-3-1 3m6-3-1 3" />
    </>
  ),
  flecha: <path d="M5 12h14m-6-6 6 6-6 6" />,
  atras: <path d="M19 12H5m6-6-6 6 6 6" />,
  chevron: <path d="m8 5 7 7-7 7" />,
  abajo: <path d="m6 9 6 6 6-6" />,
  guardar: <path d="M6 3h12v18l-6-4-6 4Z" />,
  guia: (
    <>
      <path d="M6 3h12v18H6Z M9 7h6M9 11h6M9 15h3" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  salir: (
    <>
      <path d="M14 4h6v6m0-6L9 15M10 4H4v16h16v-6" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  cerrar: <path d="m6 6 12 12M6 18 18 6" />,
  refrescar: (
    <>
      <path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5" />
    </>
  ),
  mapa: (
    <>
      <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16" />
    </>
  ),
} as const;
export function Icono({
  nombre,
  style,
}: {
  nombre: keyof typeof trazos;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {trazos[nombre]}
    </svg>
  );
}
/** Paper panels, bamboo spars and a cloth tail: three distinct flying shapes. */
export function Volantin({ perfil = "estandar" }: { perfil?: "liviano" | "estandar" | "acrobatico" }) {
  return (
    <svg className="volantin" viewBox="0 0 80 96" fill="none" aria-hidden="true">
      <g className="volantin__vela">
        {perfil === "acrobatico" ? <>
          <path d="M40 8 5 60 40 48 75 60Z" fill="#1d2642" />
          <path d="M40 8 20 54 40 43 60 54Z" fill="#b0a1ff" />
          <path d="m40 8-7 38 7-3 7 3Z" fill="#d9fc69" />
          <path d="M40 8v40M5 60l35-12 35 12" stroke="#142a85" strokeWidth="1.2" />
          <path d="M24 54c-6 17 13 19 5 35M56 54c6 17-13 19-5 35" stroke="#7784a5" strokeWidth="1" />
        </> : <>
          <path d="M40 5 71 35 40 66 9 35Z" fill={perfil === "liviano" ? "#d9fc69" : "#3155f5"} />
          <path d="M40 5v30H9Z" fill={perfil === "liviano" ? "#efffb0" : "#8cbdff"} />
          <path d="M40 35h31L40 66Z" fill={perfil === "liviano" ? "#97c730" : "#1933b5"} />
          <path d="M40 5v61M9 35h62" stroke="#f7faff" strokeWidth="1.1" />
          <path d="M11 35 40 7l29 28-29 29Z" stroke="#10255126" />
          <path className="volantin__cola" d="M40 66c-17 9 17 13 1 27" stroke="#253ff0" strokeWidth="1.6" />
          {perfil === "estandar" && <>
            <path d="m34 71 7 3-7 4Zm11 10-7 3 7 4Z" fill="#253ff0" />
            <path d="m43 89-6 2 6 4Z" fill="#3155f5" />
          </>}
          <path d="M40 35c-2 16-13 20-22 26" stroke="#f7faff" strokeWidth=".8" />
        </>}
      </g>
    </svg>
  );
}
export function MarcaVolantin() {
  return <Volantin />;
}
