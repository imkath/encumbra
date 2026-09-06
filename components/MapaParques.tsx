"use client";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import type { LecturaParque } from "@/lib/salida.ts";
import type { Coordenadas } from "@/lib/parques.ts";

type Props = {
  parques: readonly LecturaParque[];
  seleccionado: string;
  ubicacion: Coordenadas | null;
  elegir: (id: string) => void;
};
export default function MapaParques({
  parques,
  seleccionado,
  ubicacion,
  elegir,
}: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<Leaflet.Map | null>(null);
  const capa = useRef<Leaflet.LayerGroup | null>(null);
  const libreria = useRef<typeof Leaflet | null>(null);
  const seleccionar = useRef(elegir);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    seleccionar.current = elegir;
  }, [elegir]);
  useEffect(() => {
    let activo = true;
    let observer: ResizeObserver | undefined;
    import("leaflet")
      .then((L) => {
        if (!activo || !contenedor.current) return;
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const m = L.map(contenedor.current, {
          zoomControl: false,
          scrollWheelZoom: false,
          zoomAnimation: !reduce,
          fadeAnimation: !reduce,
        }).setView([-33.455, -70.635], 11);
        libreria.current = L;
        mapa.current = m;
        L.control
          .zoom({
            position: "topright",
            zoomInTitle: "Acercar mapa",
            zoomOutTitle: "Alejar mapa",
          })
          .addTo(m);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
          .on("tileerror", () => setError(true))
          .addTo(m);
        capa.current = L.layerGroup().addTo(m);
        observer = new ResizeObserver(() => m.invalidateSize({ pan: false }));
        observer.observe(contenedor.current);
        setListo(true);
      })
      .catch(() => {
        if (activo) setError(true);
      });
    return () => {
      activo = false;
      observer?.disconnect();
      mapa.current?.remove();
      mapa.current = null;
    };
  }, []);
  useEffect(() => {
    const L = libreria.current,
      m = mapa.current,
      grupo = capa.current;
    if (!listo || !L || !m || !grupo) return;
    grupo.clearLayers();
    parques.forEach((p, indice) => {
      const elemento = document.createElement("span");
      elemento.className = `mapa-pin${p.id === seleccionado ? " mapa-pin--elegido" : ""}`;
      const circulo = document.createElement("span");
      circulo.className = "mapa-pin__punto";
      circulo.textContent = String(indice + 1);
      elemento.append(circulo);
      const texto = document.createElement("span");
      texto.textContent = p.nombre;
      elemento.append(texto);
      L.marker([p.lat, p.lon], {
        icon: L.divIcon({
          html: elemento,
          className: "mapa-marcador",
          iconSize: [28, 34],
          iconAnchor: [12, 17],
        }),
        title: `Ver ${p.nombre}`,
        alt: `Parque ${p.nombre}`,
        keyboard: true,
        zIndexOffset: p.id === seleccionado ? 1000 : 0,
      })
        .on("click", () => seleccionar.current(p.id))
        .addTo(grupo);
    });
    if (ubicacion)
      L.circleMarker([ubicacion.lat, ubicacion.lon], {
        radius: 8,
        fillColor: "#3155f5",
        fillOpacity: 1,
        color: "#fff",
        weight: 3,
      })
        .addTo(grupo)
        .bindTooltip("Tu ubicación");
  }, [parques, seleccionado, ubicacion, listo]);
  const encuadre = parques.map((p) => `${p.lat},${p.lon}`).join(";");
  useEffect(() => {
    const m = mapa.current;
    const L = libreria.current;
    if (!listo || !m || !L || !encuadre) return;
    const puntos = encuadre.split(";").map((p) => {
      const [lat, lon] = p.split(",").map(Number);
      return L.latLng(lat!, lon!);
    });
    m.fitBounds(L.latLngBounds(puntos), {
      paddingTopLeft: [32, 48],
      paddingBottomRight: [48, 35],
      maxZoom: 14,
      animate: false,
    });
  }, [encuadre, listo]);
  useEffect(() => {
    if (!mapa.current || !ubicacion) return;
    mapa.current.setView([ubicacion.lat, ubicacion.lon], 13, {
      animate: false,
    });
  }, [ubicacion, listo]);
  return (
    <div className="mapa-superficie">
      <div
        ref={contenedor}
        className="mapa-lienzo"
        aria-label="Mapa de parques de Santiago"
      />
      {!listo && !error ? (
        <span className="mapa-cargando">Abriendo Santiago…</span>
      ) : null}
      {error ? (
        <p className="mapa-error">
          El mapa no cargó completo. Puedes elegir desde la lista.
        </p>
      ) : null}
      <span className="mapa-leyenda">
        <i />
        {parques.length} parques · toca un punto
      </span>
    </div>
  );
}
