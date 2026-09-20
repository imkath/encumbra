"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as Mapa, Marker, GeoJSONSource } from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";
import type { LecturaParque } from "@/lib/salida.ts";
import type { Coordenadas } from "@/lib/parques.ts";

type Props = {
  parques: readonly LecturaParque[];
  seleccionado: string;
  ubicacion: Coordenadas | null;
  elegir: (id: string) => void;
};

export default function MapaParques({ parques, seleccionado, ubicacion, elegir }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<Mapa | null>(null);
  const seleccionar = useRef(elegir);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const datos = useMemo<FeatureCollection<Point>>(() => ({
    type: "FeatureCollection",
    features: parques.map((p, indice) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      properties: { id: p.id, nombre: p.nombre, numero: indice + 1, elegido: p.id === seleccionado ? 1 : 0 },
    })),
  }), [parques, seleccionado]);
  const datosActuales = useRef(datos);
  useEffect(() => { seleccionar.current = elegir; }, [elegir]);
  useEffect(() => {
    datosActuales.current = datos;
    if (listo) (mapa.current?.getSource("parques") as GeoJSONSource | undefined)?.setData(datos);
  }, [datos, listo]);

  useEffect(() => {
    let activo = true;
    let m: Mapa | undefined;
    let observer: ResizeObserver | undefined;
    const marcadores = new Map<string, Marker>();
    const abort = new AbortController();
    const limite = window.setTimeout(() => { if (activo) setError(true); }, 15000);
    // A style failure must not block the local park source or the list.
    Promise.all([import("maplibre-gl"), fetch("/maps/encumbra.json", { signal: abort.signal }).then((r) => {
      if (!r.ok) throw new Error("Estilo no disponible");
      return r.json();
    })]).then(([L, style]) => {
      if (!activo || !contenedor.current) return;
      // Bundled, import.meta.url is not http(s), so MapLibre resolves its worker to ""
      // and the browser blocks the site root as text/html. Point it at the vendored copy.
      L.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      m = new L.Map({
        container: contenedor.current, style, center: [-70.635, -33.455], zoom: 10,
        attributionControl: false, dragRotate: false, pitchWithRotate: false,
        maxPitch: 0, maxZoom: 18, renderWorldCopies: false,
        locale: { "NavigationControl.ZoomIn": "Acercar mapa", "NavigationControl.ZoomOut": "Alejar mapa", "AttributionControl.ToggleAttribution": "Fuentes del mapa" },
      });
      const actual = m;
      mapa.current = actual;
      actual.touchZoomRotate.disableRotation();
      actual.scrollZoom.disable();
      actual.addControl(new L.NavigationControl({ showCompass: false }), "top-right");
      actual.addControl(new L.AttributionControl({ compact: true }), "bottom-left");
      actual.on("error", () => { if (activo) setError(true); });
      actual.on("load", () => {
        if (!activo) return;
        clearTimeout(limite);
        actual.addSource("parques", {
          type: "geojson", data: datosActuales.current,
          cluster: true, clusterRadius: 55, clusterMaxZoom: 15,
          clusterProperties: { elegido: ["+", ["get", "elegido"]] },
        });
        actual.addLayer({ id: "parques-datos", type: "circle", source: "parques", paint: { "circle-radius": 1, "circle-opacity": 0 } });
        const dibujar = () => {
          if (!activo || !actual.isSourceLoaded("parques")) return;
          const visibles = new Set<string>();
          for (const f of actual.querySourceFeatures("parques")) {
            if (f.geometry.type !== "Point") continue;
            const p = f.properties;
            const agrupado = Boolean(p.cluster);
            const clave = agrupado ? `grupo-${p.cluster_id}-${p.point_count}-${p.elegido}` : `parque-${p.id}-${p.numero}-${p.elegido}`;
            const coord = f.geometry.coordinates as [number, number];
            if (!actual.getBounds().contains(coord)) continue;
            visibles.add(clave);
            if (marcadores.has(clave)) continue;
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = `mapa-punto${agrupado ? " mapa-punto--grupo" : ""}${p.elegido ? " mapa-punto--elegido" : ""}`;
            boton.textContent = agrupado ? `${p.point_count} puntos` : `${p.numero}`;
            const nombre = agrupado ? `Acercar ${p.point_count} puntos` : `Ver ${p.nombre}`;
            boton.setAttribute("aria-label", nombre);
            boton.title = nombre;
            boton.addEventListener("click", async () => {
              if (!agrupado) { seleccionar.current(p.id); return; }
              try {
                const zoom = await (actual.getSource("parques") as GeoJSONSource).getClusterExpansionZoom(p.cluster_id);
                if (activo) actual.easeTo({ center: coord, zoom: Math.min(zoom + .15, 18), duration: reduce ? 0 : 300 });
              } catch { if (activo) setError(true); }
            });
            marcadores.set(clave, new L.Marker({ element: boton }).setLngLat(coord).addTo(actual));
          }
          for (const [clave, marcador] of marcadores) {
            if (!visibles.has(clave)) { marcador.remove(); marcadores.delete(clave); }
          }
        };
        actual.on("render", dibujar);
        setListo(true);
      });
      observer = new ResizeObserver(() => actual.resize());
      observer.observe(contenedor.current);
    }).catch(() => { if (activo) setError(true); });
    return () => {
      activo = false;
      abort.abort();
      clearTimeout(limite);
      observer?.disconnect();
      for (const marker of marcadores.values()) marker.remove();
      m?.remove();
      mapa.current = null;
    };
  }, [intento]);

  // Reframe only when the result set changes, not when weather refreshes.
  const encuadre = parques.map((p) => `${p.lon},${p.lat}`).sort().join(";");
  useEffect(() => {
    const m = mapa.current;
    if (!listo || !m || !encuadre) return;
    const puntos = encuadre.split(";").map((p) => p.split(",").map(Number));
    const lon = puntos.map((p) => p[0]!); const lat = puntos.map((p) => p[1]!);
    m.fitBounds([[Math.min(...lon), Math.min(...lat)], [Math.max(...lon), Math.max(...lat)]], {
      padding: { top: 45, bottom: 38, left: 30, right: 55 }, maxZoom: 14, duration: 0,
    });
  }, [encuadre, listo]);

  useEffect(() => {
    const m = mapa.current;
    if (!listo || !m || !ubicacion) return;
    let marcador: Marker | undefined;
    let activo = true;
    import("maplibre-gl").then((L) => {
      if (!activo) return;
      const punto = document.createElement("span");
      punto.className = "mapa-tu-posicion";
      punto.setAttribute("aria-label", "Tu ubicación");
      marcador = new L.Marker({ element: punto }).setLngLat([ubicacion.lon, ubicacion.lat]).addTo(m);
      m.jumpTo({ center: [ubicacion.lon, ubicacion.lat], zoom: 12 });
    });
    return () => { activo = false; marcador?.remove(); };
  }, [ubicacion, listo]);

  return (
    <div className="mapa-superficie">
      <div ref={contenedor} className="mapa-lienzo" aria-label="Mapa de parques de Santiago" />
      {!listo && !error ? <span className="mapa-cargando" role="status">Abriendo Santiago…</span> : null}
      {error ? <div className="mapa-error" role="status">
        <span>El mapa no cargó completo. La lista sigue disponible.</span>
        <button onClick={() => { setListo(false); setError(false); setIntento((n) => n + 1); }}>Reintentar mapa</button>
      </div> : null}
      <span className="mapa-leyenda"><i />{parques.length} {parques.length === 1 ? "punto" : "puntos"} · toca para explorar</span>
    </div>
  );
}
