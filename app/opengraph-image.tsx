import { ImageResponse } from "next/og";

export const alt =
  "Encumbra, pronóstico de viento para volantines en Santiago";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#f8f7f2",
        color: "#252520",
        display: "flex",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "space-between",
        overflow: "hidden",
        padding: "68px 76px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "66%",
        }}
      >
        <div style={{ display: "flex", fontSize: 64, fontWeight: 900 }}>
          encumbra
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              fontWeight: 900,
              letterSpacing: "-7px",
              lineHeight: 0.88,
            }}
          >
            ¿anda
          </div>
          <div
            style={{
              color: "#666257",
              display: "flex",
              fontSize: 92,
              fontWeight: 600,
              letterSpacing: "-5px",
              lineHeight: 1,
            }}
          >
            o no anda?
          </div>
          <div style={{ display: "flex", fontSize: 28, marginTop: 30 }}>
            El viento de Santiago, explicado para tu volantín.
          </div>
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          background: "#ffda24",
          clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
          display: "flex",
          height: 360,
          justifyContent: "center",
          marginTop: 48,
          transform: "rotate(7deg)",
          width: 300,
        }}
      >
        <div
          style={{
            background: "#252520",
            display: "flex",
            height: 250,
            opacity: 0.14,
            width: 3,
          }}
        />
      </div>
    </div>,
    size,
  );
}
