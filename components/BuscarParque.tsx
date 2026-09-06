"use client";

import { useState } from "react";
import Link from "next/link";
import { SelectorVolantin } from "@/components/SelectorVolantin.tsx";
import type { Perfil } from "@/lib/bandas.ts";
import { VEREDICTOS, CONSEJOS } from "@/lib/bandas.ts";
import type { Pronostico } from "@/lib/openmeteo.ts";
import { adaptarHorasAlPerfil, horaVigente } from "@/lib/planear.ts";
import { formatearHora } from "@/lib/formato.ts";
import { proximaVentana, ventanas } from "@/lib/ventanas.ts";
import {
  PARQUES,
  buscarParques,
  distanciaKm,
  ordenarParques,
  type Coordenadas,
} from "@/lib/parques.ts";

type Props = {
  readonly pronostico: Pronostico;
  readonly perfilInicial: Perfil;
  readonly servidoEn: string;
  readonly zonaActual?: string;
};

export function BuscarParque({
  pronostico,
  perfilInicial,
  servidoEn,
  zonaActual = "araucano-san-cristobal",
}: Props) {
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [estado, setEstado] = useState("");
  const [ubicando, setUbicando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<"cerca" | "adecuado">("adecuado");
  const [todos, setTodos] = useState(false);
  const [perfil, setPerfil] = useState(perfilInicial);
  function ubicar() {
    if (!navigator.geolocation) {
      setEstado("Tu navegador no permite ubicación. Busca un parque o comuna.");
      return;
    }
    setUbicando(true);
    setEstado("Buscando tu ubicación…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUbicacion({ lat: coords.latitude, lon: coords.longitude });
        setUbicando(false);
        setEstado("Ubicación lista. Distancias aproximadas en línea recta.");
      },
      (error) => {
        setUbicando(false);
        setEstado(
          error.code === 1
            ? "No diste acceso a tu ubicación. Puedes buscar por parque o comuna."
            : "No pudimos ubicarte. Reintenta o busca por parque o comuna.",
        );
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }
  const ahora = new Date(servidoEn);
  const lecturas = PARQUES.map((parque) => {
    const zona = pronostico.zonas.find((z) => z.id === parque.zonaId);
    const horas = zona ? adaptarHorasAlPerfil(zona.horas, perfil) : [];
    const lectura = horaVigente(horas, ahora);
    return {
      ...parque,
      banda: lectura?.banda ?? null,
      lectura,
      proxima: proximaVentana(ventanas(horas, perfil), ahora),
      distancia: ubicacion ? distanciaKm(ubicacion, parque) : null,
    };
  });
  const ordenados = ordenarParques(lecturas, orden);
  const resultados = buscarParques(ordenados, busqueda);
  const visibles =
    todos || busqueda.trim() ? resultados : resultados.slice(0, 3);
  const sugerido =
    !busqueda.trim() &&
    orden === "adecuado" &&
    ordenados[0]?.banda === "ideal" &&
    pronostico.estado === "actual"
      ? ordenados[0].id
      : null;
  return (
    <section className="buscar-parque" aria-labelledby="titulo-parques">
      <div className="salida-preparar">
        <div className="buscar-parque__cabecera">
          <div>
            <h1 id="titulo-parques">
              Suelta hilo.
              <br />
              <span>Encuentra tu cielo.</span>
            </h1>
            <svg
              className="salida-volantin"
              viewBox="0 0 160 220"
              aria-hidden="true"
            >
              <path
                d="M80 111C18 140 125 161 46 216"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <g className="salida-volantin__papel">
                <path d="m80 8 56 56-56 56-56-56Z" fill="#e56543" />
                <path d="M80 8v56H24Z" fill="#f4bc4f" />
                <path d="M80 64h56l-56 56Z" fill="#285c64" />
                <path
                  d="M80 8v112M24 64h112"
                  stroke="#faf5e9"
                  strokeWidth="1"
                />
              </g>
            </svg>
            <p>Un lugar cerca. El viento a favor. Y un rato afuera.</p>
          </div>
          <button
            className="buscar-parque__ubicacion"
            type="button"
            disabled={ubicando}
            onClick={ubicar}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
            </svg>
            {ubicando
              ? "Buscando…"
              : ubicacion
                ? "Actualizar mi ubicación"
                : "Usar mi ubicación"}
          </button>
        </div>
        <p role="status" className="buscar-parque__estado">
          {estado}
        </p>
        <div className="buscar-parque__controles">
          <label>
            <span className="solo-lectura">Parque o comuna</span>
            <input
              type="search"
              placeholder="Ej. Araucano o Las Condes"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>
        </div>
        <SelectorVolantin
          perfilInicial={perfilInicial}
          zonaActual={zonaActual}
          onPerfilChange={setPerfil}
        />
      </div>
      <div className="salida-resultados">
        <div className="salida-resultados__cabecera">
          <h2>
            {busqueda.trim()
              ? `${resultados.length} resultados`
              : ubicacion
                ? "Cerca de ti"
                : "Parques para tu salida"}
          </h2>
          <label>
            <span className="solo-lectura">Ordenar por</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as "cerca" | "adecuado")}
            >
              <option value="adecuado">
                {ubicacion
                  ? "Mejor viento entre 5 cercanos"
                  : "Condiciones de viento"}
              </option>
              <option value="cerca" disabled={!ubicacion}>
                Más cerca de mí
              </option>
            </select>
          </label>
        </div>
        {pronostico.estado !== "actual" ? (
          <p className="buscar-parque__criterio" role="status">
            {pronostico.estado === "sin-datos"
              ? "Sin datos de viento por ahora. Puedes explorar parques y cómo llegar."
              : "Pronóstico guardado: las condiciones pueden haber cambiado."}
          </p>
        ) : null}
        {visibles.length ? (
          <ul className="buscar-parque__lista">
            {visibles.map((parque) => (
              <li key={parque.id} data-sugerido={parque.id === sugerido}>
                <details>
                  <summary>
                    <span>
                      <strong>{parque.nombre}</strong>
                      <small>
                        {parque.comuna}
                        {parque.distancia !== null
                          ? ` · ${parque.distancia.toLocaleString("es-CL", { maximumFractionDigits: 1 })} km`
                          : ""}
                      </small>
                      {parque.lectura ? (
                        <span className="parque-viento">
                          {Math.round(parque.lectura.viento)} km/h{" "}
                          <span>
                            · rachas {Math.round(parque.lectura.racha)}
                          </span>
                        </span>
                      ) : null}
                      {parque.id === sugerido ? (
                        <em>
                          {ubicacion
                            ? "Buen viento entre tus cercanos"
                            : "Buen viento en su zona"}
                        </em>
                      ) : null}
                    </span>
                    <span
                      className="buscar-parque__banda"
                      data-banda={parque.banda ?? "plancha"}
                    >
                      {parque.banda ? VEREDICTOS[parque.banda] : "SIN DATO"}
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="m4 6 4 4 4-4" />
                      </svg>
                    </span>
                  </summary>
                  <div className="buscar-parque__detalle">
                    <p>
                      {parque.banda
                        ? CONSEJOS[parque.banda]
                        : "Aún no podemos evaluar el viento de este parque."}
                    </p>
                    {parque.lectura ? (
                      <p>
                        Viento {Math.round(parque.lectura.viento)} km/h · rachas{" "}
                        {Math.round(parque.lectura.racha)} km/h · lluvia{" "}
                        {parque.lectura.probabilidadPrecipitacion}%
                      </p>
                    ) : null}
                    {parque.proxima ? (
                      <p>
                        Próxima ventana: {formatearHora(parque.proxima.inicio)}.
                      </p>
                    ) : null}
                    <p>
                      Pronóstico de la zona {parque.zonaNombre}. Revisa que el
                      sector esté despejado y permitido para encumbrar.
                    </p>
                    <div>
                      <Link
                        href={`/?zona=${parque.zonaId}&perfil=${perfil}#veredicto`}
                      >
                        Ver pronóstico completo
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${parque.lat},${parque.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Cómo llegar
                        <span className="solo-lectura">
                          {" "}
                          (abre Google Maps en otra pestaña)
                        </span>
                      </a>
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="buscar-parque__vacio">
            No encontramos ese parque o comuna. Prueba otro nombre.
          </p>
        )}
        {!busqueda.trim() && resultados.length > 3 ? (
          <button
            className="buscar-parque__todos"
            type="button"
            aria-expanded={todos}
            onClick={() => setTodos(!todos)}
          >
            {todos
              ? "Mostrar menos"
              : `Explorar los ${resultados.length} parques`}
          </button>
        ) : null}
        <details className="salida-criterio">
          <summary>Cómo elegimos los parques</summary>
          <p className="buscar-parque__criterio">
            {pronostico.estado === "sin-datos"
              ? "Sin pronóstico disponible. Puedes encontrar parques y abrir cómo llegar."
              : pronostico.estado === "desactualizado"
                ? "Último pronóstico guardado. Confirma las condiciones antes de salir."
                : ubicacion && orden === "cerca"
                  ? "Primero el parque más cercano. Las distancias son en línea recta."
                  : ubicacion
                    ? "Comparamos el viento entre tus 5 parques más cercanos. A igual condición, primero el más próximo."
                    : "Ordenados por viento para tu volantín. Activa tu ubicación para considerar cercanía."}
          </p>
          <p className="buscar-parque__nota">
            El viento se estima por zona, no por parque. La sugerencia compara
            viento y cercanía; no confirma acceso ni seguridad del lugar.
          </p>
        </details>
      </div>
    </section>
  );
}
