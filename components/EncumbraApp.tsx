"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Perfil } from "@/lib/bandas.ts";
import { CONSEJOS, ETIQUETAS } from "@/lib/bandas.ts";
import type { Pronostico } from "@/lib/openmeteo.ts";
import {
  buscarParques,
  ordenarParques,
  type Coordenadas,
} from "@/lib/parques.ts";
import {
  contextoSalida,
  luzEnHorario,
  elegirParqueInicial,
  lecturasParques,
  type LecturaParque,
} from "@/lib/salida.ts";
import { formatearHora } from "@/lib/formato.ts";
import {
  crearCalendario,
  leerPronosticoGuardado,
  serializarPronostico,
} from "@/lib/vivo.ts";
import { Icono, MarcaVolantin, Volantin } from "./Icono.tsx";

const Mapa = dynamic(() => import("./MapaParques.tsx"), {
  ssr: false,
  loading: () => <div className="mapa-espera">Abriendo mapa…</div>,
});
type Vista = "parques" | "salida" | "guia";
type Props = {
  inicial: Pronostico;
  perfilInicial: Perfil;
  parqueInicial?: string;
  zonaInicial?: string;
  vistaInicial: Vista;
  servidoEn: string;
};
const PERFILES = [
  { id: "liviano", nombre: "Papel liviano", detalle: "Papel ligero, un hilo." },
  {
    id: "estandar",
    nombre: "Con cola",
    detalle: "El tradicional de toda la vida.",
  },
  {
    id: "acrobatico",
    nombre: "Acrobático",
    detalle: "Dos hilos, más control.",
  },
] as const;
const STORAGE = "encumbra:pronostico:v1";
const esVista = (s: string | null): s is Vista =>
  s === "parques" || s === "salida" || s === "guia";
const esPerfil = (s: string | null): s is Perfil =>
  s === "liviano" || s === "estandar" || s === "acrobatico";
function distancia(valor: number | null) {
  return valor === null
    ? ""
    : `${valor.toLocaleString("es-CL", { maximumFractionDigits: 1 })} km`;
}
function IconoPerfil({ perfil }: { perfil: Perfil }) {
  return <Volantin perfil={perfil} />;
}

export function EncumbraApp({
  inicial,
  perfilInicial,
  parqueInicial,
  zonaInicial,
  vistaInicial,
  servidoEn,
}: Props) {
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const [perfil, setPerfil] = useState<Perfil>(perfilInicial);
  const [seleccionado, setSeleccionado] = useState<string>(
    () => elegirParqueInicial(parqueInicial, zonaInicial).id,
  );
  const [pronostico, setPronostico] = useState(inicial);
  const [ahora, setAhora] = useState(() => new Date(servidoEn));
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [refrescando, setRefrescando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<"adecuado" | "cerca" | "guardados">(
    "adecuado",
  );
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [horaElegida, setHoraElegida] = useState<string | null>(null);
  const [listaCompleta, setListaCompleta] = useState(false);
  const [checks, setChecks] = useState<string[]>([]);
  const contenido = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const [vistaMapa, setVistaMapa] = useState(true);

  useEffect(() => {
    const cargar = window.setTimeout(() => {
      try {
        const guardados: unknown = JSON.parse(
          localStorage.getItem("encumbra:parques") ?? "[]",
        );
        if (Array.isArray(guardados))
          setFavoritos(
            guardados.filter((v): v is string => typeof v === "string"),
          );
        if (inicial.estado === "sin-datos") {
          const ultimo = leerPronosticoGuardado(localStorage.getItem(STORAGE));
          if (ultimo) setPronostico({ ...ultimo, estado: "desactualizado" });
        } else localStorage.setItem(STORAGE, serializarPronostico(inicial));
      } catch {
        /* La app sigue disponible sin almacenamiento local. */
      }
    }, 0);
    const reloj = window.setInterval(() => setAhora(new Date()), 60000);
    return () => {
      clearTimeout(cargar);
      clearInterval(reloj);
    };
  }, [inicial]);
  useEffect(() => {
    const restaurar = () => {
      const params = new URLSearchParams(location.search),
        v = params.get("vista"),
        p = params.get("perfil");
      setVista(esVista(v) ? v : "parques");
      if (esPerfil(p)) setPerfil(p);
      setSeleccionado(
        elegirParqueInicial(
          params.get("parque") ?? undefined,
          params.get("zona") ?? undefined,
        ).id,
      );
      setHoraElegida(null);
    };
    addEventListener("popstate", restaurar);
    return () => removeEventListener("popstate", restaurar);
  }, []);
  const actualizar = useCallback(async () => {
    setRefrescando(true);
    try {
      const response = await fetch("/api/pronostico", { cache: "no-store" });
      if (!response.ok) throw new Error("sin datos");
      const raw: unknown = await response.json();
      const data = leerPronosticoGuardado(
        JSON.stringify({ version: 1, pronostico: raw }),
      );
      if (!data) throw new Error("sin datos");
      setPronostico(data);
      setAhora(new Date());
      setMensaje("Pronóstico actualizado.");
      try {
        localStorage.setItem(STORAGE, serializarPronostico(data));
      } catch {
        /* Almacenamiento opcional. */
      }
    } catch {
      setPronostico((prev) =>
        prev.estado === "actual" ? { ...prev, estado: "desactualizado" } : prev,
      );
      setMensaje(
        "No pudimos actualizar el viento. Los parques siguen disponibles.",
      );
    } finally {
      setRefrescando(false);
    }
  }, []);
  useEffect(() => {
    const refrescarVisible = () => {
      if (document.visibilityState === "visible") void actualizar();
    };
    const intervalo = setInterval(refrescarVisible, 600000);
    addEventListener("online", refrescarVisible);
    return () => {
      clearInterval(intervalo);
      removeEventListener("online", refrescarVisible);
    };
  }, [actualizar]);
  const parques = useMemo(
    () => lecturasParques(pronostico, perfil, ahora, ubicacion),
    [pronostico, perfil, ahora, ubicacion],
  );
  const parque = parques.find((p) => p.id === seleccionado) ?? parques[0]!;
  const ordenados = ordenarParques(
    parques,
    orden === "cerca" ? "cerca" : "adecuado",
  );
  const resultados = buscarParques(
    orden === "guardados"
      ? ordenados.filter((p) => favoritos.includes(p.id))
      : ordenados,
    busqueda,
  );
  const visibles =
    listaCompleta || busqueda || orden === "guardados"
      ? resultados
      : resultados.slice(0, 5);
  const hora = parque.horas.find((h) => h.fecha === horaElegida) ?? parque.hora;
  const actualizado = pronostico.estado === "actual";
  const zonaElegida = pronostico.zonas.find((z) => z.id === parque.zonaId);
  const luzDeHora = (fecha: string) => luzEnHorario(fecha, zonaElegida?.salidaSol ?? [], zonaElegida?.puestaSol ?? []);
  const contexto = contextoSalida(hora, hora ? luzDeHora(hora.fecha) : null, actualizado);
  const propuesto =
    orden === "adecuado" && actualizado && !busqueda
      ? ordenados.find((p, i) => i === 0 && p.banda === "ideal" && p.esDeDia)
          ?.id
      : undefined;

  function navegar(v: Vista, id = seleccionado) {
    setVista(v);
    setSeleccionado(id);
    setHoraElegida(null);
    setMensaje("");
    const p = elegirParqueInicial(id);
    const params = new URLSearchParams({
      parque: id,
      zona: p.zonaId,
      perfil,
      vista: v,
    });
    history.pushState(null, "", `/?${params}`);
    requestAnimationFrame(() => {
      contenido.current?.scrollTo(0, 0);
      titulo.current?.focus({ preventScroll: true });
    });
  }
  function cambiarPerfil(p: Perfil) {
    setPerfil(p);
    setHoraElegida(null);
    const params = new URLSearchParams(location.search);
    params.set("perfil", p);
    history.replaceState(null, "", `/?${params}`);
  }
  function guardar(id: string) {
    const nuevo = favoritos.includes(id)
      ? favoritos.filter((x) => x !== id)
      : [...favoritos, id];
    setFavoritos(nuevo);
    try {
      localStorage.setItem("encumbra:parques", JSON.stringify(nuevo));
    } catch {
      setMensaje(
        "Guardado durante esta sesión. El almacenamiento del navegador no está disponible.",
      );
    }
  }
  function localizar() {
    if (!navigator.geolocation) {
      setMensaje(
        "Tu navegador no permite ubicación. Busca por parque o comuna.",
      );
      return;
    }
    setLocalizando(true);
    setMensaje("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUbicacion({ lat: coords.latitude, lon: coords.longitude });
        setLocalizando(false);
        setMensaje("Ubicación lista. Distancias en línea recta.");
      },
      (err) => {
        setLocalizando(false);
        setMensaje(
          err.code === 1
            ? "Ubicación no autorizada. Puedes buscar por nombre o comuna."
            : "No pudimos ubicarte. Reintenta o busca un parque.",
        );
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }
  const elegirDesdeMapa = (id: string) => navegar("salida", id);
  const calendario =
    parque.ventanaDiurna && actualizado
      ? crearCalendario(parque.ventanaDiurna, parque.nombre, ahora)
      : null;
  const activoNav = (v: Vista) => (vista === v ? ("page" as const) : undefined);

  function fila(p: LecturaParque, indice: number) {
    return (
      <li
        key={p.id}
        className={
          p.id === propuesto
            ? "parque-fila parque-fila--sugerido"
            : "parque-fila"
        }
      >
        <button
          className="parque-abrir"
          onClick={() => navegar("salida", p.id)}
        >
          <span className="parque-simbolo">
            {indice + 1}
          </span>
          <span className="parque-identidad">
            <strong>{p.nombre}</strong>
            <span>
              {p.comuna}
              {p.distancia !== null ? ` · ${distancia(p.distancia)}` : ""}
            </span>
            {p.id === propuesto ? (
              <small>
                Buen viento entre {ubicacion ? "tus cercanos" : "las zonas"}
              </small>
            ) : null}
          </span>
          <span
            className="parque-condicion"
            data-estado={p.banda ?? "sin-datos"}
          >
            <span>
              <i />
              {p.banda ? ETIQUETAS[p.banda] : "Sin dato"}
            </span>
            <small>
              {p.hora ? `${Math.round(p.hora.viento)} km/h` : "Ver parque"}
            </small>
          </span>
        </button>
        <button
          className="icon-button guardar-parque"
          aria-label={`${favoritos.includes(p.id) ? "Quitar" : "Guardar"} ${p.nombre}`}
          aria-pressed={favoritos.includes(p.id)}
          onClick={() => guardar(p.id)}
        >
          <Icono nombre="guardar" />
        </button>
      </li>
    );
  }
  return (
    <div className="encumbra-app">
      <header className="app-topbar">
        <button
          className="app-marca"
          onClick={() => navegar("parques")}
          aria-label="Encumbra, explorar parques"
        >
          <MarcaVolantin />
          <span>encumbra</span>
        </button>
        <span className="app-ciudad">Santiago, Chile</span>
        <label className="perfil-rapido">
          <IconoPerfil perfil={perfil} />
          <span className="sr-only">Tu volantín</span>
          <select
            value={perfil}
            onChange={(e) => cambiarPerfil(e.target.value as Perfil)}
          >
            {PERFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <Icono nombre="abajo" />
        </label>
      </header>
      <nav className="app-nav" aria-label="Secciones de Encumbra">
        <button
          aria-current={activoNav("parques")}
          onClick={() => navegar("parques")}
        >
          <Icono nombre="cerca" />
          <span>Parques</span>
        </button>
        <button
          aria-current={activoNav("salida")}
          onClick={() => navegar("salida")}
        >
          <Icono nombre="viento" />
          <span>Mi salida</span>
        </button>
        <button
          aria-current={activoNav("guia")}
          onClick={() => navegar("guia")}
        >
          <Icono nombre="guia" />
          <span>Prepararme</span>
        </button>
      </nav>
      <main className={`app-main app-main--${vista}`}>
        <div className="app-screen" ref={contenido}>
          {vista === "parques" ? (
            <>
              <div className="explorar-herramientas">
                <div className="app-heading">
                  <div>
                    <h1 ref={titulo} tabIndex={-1}>
                      El cielo es tuyo.
                    </h1>
                    <p>
                      {ubicacion
                        ? "Parques alrededor de ti"
                        : "Encuentra tu parque para encumbrar."}
                    </p>
                  </div>

                </div>
                <div className="buscar-ubicacion">
                <label className="buscador-app">
                  <Icono nombre="buscar" />
                  <span className="sr-only">Buscar parque o comuna</span>
                  <input
                    type="search"
                    placeholder="Parque o comuna"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </label>
                  <button
                    className="icon-button boton-ubicacion"
                    onClick={localizar}
                    disabled={localizando}
                    aria-label={
                      localizando ? "Buscando ubicación" : "Usar mi ubicación"
                    }
                  >
                    <Icono nombre="ubicacion" />
                  </button>
                </div>
                <div className="explorar-filtros">
                  <div className="segmentos" aria-label="Orden de parques">
                    <button
                      aria-pressed={orden === "adecuado"}
                      onClick={() => setOrden("adecuado")}
                    >
                      Para ti
                    </button>
                    <button
                      aria-pressed={orden === "cerca"}
                      onClick={() => {
                        setOrden("cerca");
                        if (!ubicacion) localizar();
                      }}
                    >
                      Cercanos
                    </button>
                    <button
                      aria-pressed={orden === "guardados"}
                      onClick={() => setOrden("guardados")}
                    >
                      Guardados{favoritos.length ? ` ${favoritos.length}` : ""}
                    </button>
                  </div>
                  <button
                    className="icon-button alternar-mapa"
                    aria-label={
                      vistaMapa ? "Mostrar solo lista" : "Mostrar mapa"
                    }
                    aria-pressed={vistaMapa}
                    onClick={() => setVistaMapa(!vistaMapa)}
                  >
                    <Icono nombre="mapa" />
                    <span>{vistaMapa ? "Lista" : "Mapa"}</span>
                  </button>
                </div>
              </div>
              <div
                className={`explorar-cuerpo${vistaMapa ? "" : " explorar-cuerpo--lista"}`}
              >
                {vistaMapa ? (
                  <div className="explorar-mapa">
                    <Mapa
                      parques={resultados}
                      seleccionado={seleccionado}
                      ubicacion={ubicacion}
                      elegir={elegirDesdeMapa}
                    />
                    <button
                      className="mapa-mi-ubicacion icon-button"
                      onClick={localizar}
                      disabled={localizando}
                      aria-label="Centrar en mi ubicación"
                    >
                      <Icono nombre="ubicacion" />
                    </button>
                  </div>
                ) : null}
                <section
                  className="explorar-lista"
                  aria-label="Resultados de parques"
                >
                  <div className="lista-titulo">
                    <h2>
                      {busqueda
                        ? `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}`
                        : orden === "guardados"
                          ? "Tus lugares"
                          : ubicacion
                            ? "A una escapada de ti"
                            : "Explora los parques"}
                    </h2>
                    <span>
                      {busqueda || orden === "guardados"
                        ? resultados.length
                        : `${visibles.length} de 17`}
                    </span>
                  </div>
                  {pronostico.estado !== "actual" ? (
                    <p className="dato-aviso">
                      <Icono nombre="viento" />
                      {pronostico.estado === "sin-datos"
                        ? "Viento no disponible. Explora los parques."
                        : "Último pronóstico guardado."}
                      <button
                        disabled={refrescando}
                        onClick={() => void actualizar()}
                      >
                        Reintentar
                      </button>
                    </p>
                  ) : null}
                  {resultados.length ? (
                    <ul className="parques-lista">{visibles.map(fila)}</ul>
                  ) : (
                    <div className="app-vacio">
                      <Icono
                        nombre={orden === "guardados" ? "guardar" : "buscar"}
                      />
                      <h2>
                        {orden === "guardados" && !busqueda
                          ? "Tus parques, a mano"
                          : "No encontramos ese lugar"}
                      </h2>
                      <p>
                        {orden === "guardados" && !busqueda
                          ? "Usa el botón Guardar junto al nombre de un parque para encontrarlo aquí."
                          : "Prueba con otra comuna o borra la búsqueda."}
                      </p>
                      <button
                        className="app-text-button"
                        onClick={() => {
                          setBusqueda("");
                          setOrden("adecuado");
                        }}
                      >
                        Ver todos los parques
                      </button>
                    </div>
                  )}
                  {!listaCompleta && !busqueda && orden !== "guardados" ? (
                    <button
                      className="ver-todos-app"
                      onClick={() => setListaCompleta(true)}
                    >
                      Explorar los 17 parques
                      <Icono nombre="flecha" />
                    </button>
                  ) : null}
                  <details className="criterio-app">
                    <summary>¿Por qué estos parques?</summary>
                    <p>
                      {ubicacion
                        ? "Comparamos el viento entre los cinco más cercanos. A igual condición, priorizamos la distancia."
                        : "Ordenamos por el viento de su zona. Usa tu ubicación para considerar la distancia."}{" "}
                      Las distancias son en línea recta. El pronóstico no
                      confirma acceso ni seguridad.
                    </p>
                  </details>
                </section>
              </div>
            </>
          ) : null}
          {vista === "salida" ? (
            <div className="salida-screen">
              <div className="app-heading">
                <div>
                  <button
                    className="volver-parques"
                    onClick={() => navegar("parques")}
                  >
                    <Icono nombre="atras" />
                    Cambiar parque
                  </button>
                  <h1 ref={titulo} tabIndex={-1}>
                    {parque.nombre}
                  </h1>
                  <p>
                    {parque.comuna}
                    {parque.distancia !== null
                      ? ` · ${distancia(parque.distancia)}`
                      : ""}
                  </p>
                </div>
                <button
                  className="icon-button"
                  aria-label={`${favoritos.includes(parque.id) ? "Quitar" : "Guardar"} ${parque.nombre}`}
                  aria-pressed={favoritos.includes(parque.id)}
                  onClick={() => guardar(parque.id)}
                >
                  <Icono nombre="guardar" />
                </button>
              </div>
              <div className="salida-layout">
                <section
                  className="parte-viento"
                  data-estado={contexto?.estado ?? hora?.banda ?? "sin-datos"}
                  aria-label="Condiciones de viento"
                >
                  <div className="parte-viento__hora">
                    <span>
                      <i />
                      {horaElegida && hora
                        ? `A las ${formatearHora(hora.fecha)}`
                        : "Ahora"}
                    </span>
                    <span>{actualizado ? "Pronóstico" : "Último dato"}</span>
                  </div>
                  <h2>{contexto?.titulo ?? (hora ? ETIQUETAS[hora.banda] : "El viento, pendiente")}</h2>
                  <p>
                    {contexto?.detalle ?? (hora
                      ? `Por viento: ${CONSEJOS[hora.banda]}`
                      : "Todavía puedes elegir tu parque. Reintenta para conocer las condiciones.")}
                  </p>
                  {hora?.probabilidadPrecipitacion !== null &&
                  hora?.probabilidadPrecipitacion !== undefined &&
                  hora.probabilidadPrecipitacion >= 50 ? (
                    <p className="lluvia-aviso">
                      <Icono nombre="lluvia" />
                      {hora.probabilidadPrecipitacion}% de probabilidad de
                      lluvia. Revisa antes de salir.
                    </p>
                  ) : null}
                  <dl className="parte-viento__datos">
                    <div>
                      <dt>Viento</dt>
                      <dd>
                        {hora ? Math.round(hora.viento) : "—"}
                        <small>km/h</small>
                      </dd>
                    </div>
                    <div>
                      <dt>Rachas</dt>
                      <dd>
                        {hora ? Math.round(hora.racha) : "—"}
                        <small>km/h</small>
                      </dd>
                    </div>
                    <div>
                      <dt>Lluvia</dt>
                      <dd>
                        {hora?.probabilidadPrecipitacion ?? "—"}
                        <small>%</small>
                      </dd>
                    </div>
                  </dl>
                </section>
                <div className="salida-plan">
                  <div className="ventana-salida">
                    <Icono nombre={parque.ventanaDiurna ? "sol" : "reloj"} />
                    <div>
                      <strong>
                        {parque.ventanaDiurna
                          ? "Viento y luz coinciden"
                          : parque.luzConfirmada
                            ? "Sin ventana de viento con luz"
                            : "Horario con luz pendiente"}
                      </strong>
                      <p>
                        {parque.ventanaDiurna
                          ? `${new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", weekday: "short", day: "numeric" }).format(new Date(parque.ventanaDiurna.inicio))} · ${formatearHora(parque.ventanaDiurna.inicio)}–${formatearHora(parque.ventanaDiurna.fin)}. Revisa la lluvia.`
                          : parque.luzConfirmada
                            ? "Puedes revisar el viento hora a hora."
                            : "No recomendamos un horario sin amanecer confirmado."}
                      </p>
                    </div>
                    {calendario ? (
                      <a
                        aria-label="Agregar ventana diurna al calendario"
                        download={`encumbra-${parque.id}.ics`}
                        href={`data:text/calendar;charset=utf-8,${encodeURIComponent(calendario)}`}
                      >
                        <Icono nombre="calendario" />
                        <span>Agregar al calendario</span>
                      </a>
                    ) : null}
                  </div>
                  {parque.horas.length ? (
                    <section
                      className="horas-app"
                      aria-label="Pronóstico por hora"
                    >
                      <div className="lista-titulo">
                        <h2>Elige tu momento</h2>
                        <span>Desliza las horas</span>
                      </div>
                      <div className="horas-cinta">
                        {parque.horas.map((h, i) => (
                          <button
                            key={h.fecha}
                            data-estado={h.banda}
                            data-luz={luzDeHora(h.fecha) === false ? "noche" : "dia"}
                            aria-pressed={h.fecha === hora?.fecha}
                            aria-label={`${formatearHora(h.fecha)}, ${ETIQUETAS[h.banda]}, viento ${Math.round(h.viento)} kilómetros por hora, rachas ${Math.round(h.racha)}, ${luzDeHora(h.fecha) === false ? "de noche" : luzDeHora(h.fecha) ? "con luz" : "luz sin confirmar"}`}
                            onClick={() => setHoraElegida(h.fecha)}
                          >
                            <time dateTime={h.fecha}>
                              {i === 0 ? "Ahora" : formatearHora(h.fecha)}
                            </time>
                            <Icono nombre={luzDeHora(h.fecha) === false ? "luna" : "viento"} />
                            <strong>{Math.round(h.viento)}<small> km/h</small></strong>
                            <span className="hora-racha">Racha {Math.round(h.racha)}</span>
                            <small>{luzDeHora(h.fecha) === false ? "Noche" : luzDeHora(h.fecha) ? "Con luz" : "Luz sin dato"}</small>
                          </button>
                        ))}
                      </div>
                      <div className="horas-leyenda">
                        <span>
                          <i />
                          Viento favorable
                        </span>
                        <span>Viento y rachas en km/h</span>
                      </div>
                    </section>
                  ) : null}
                  <div className="puesta-app">
                    <Icono nombre="sol" />
                    <span>Puesta de sol</span>
                    <strong>
                      {parque.luz.fecha
                        ? formatearHora(parque.luz.fecha)
                        : "Sin dato"}
                    </strong>
                  </div>
                  <p className="nota-modelo">
                    Viento estimado para la zona {parque.zonaNombre}. Los
                    parques de esa zona comparten pronóstico.
                  </p>
                </div>
              </div>
              <div className="estado-pronostico">
                <span>
                  {pronostico.actualizadoEn
                    ? `${actualizado ? "Actualizado" : "Último dato"} ${formatearHora(pronostico.actualizadoEn)} · Open-Meteo`
                    : "Sin pronóstico disponible"}
                </span>
                <button
                  className="icon-button"
                  aria-label="Actualizar pronóstico"
                  disabled={refrescando}
                  onClick={() => void actualizar()}
                >
                  <Icono nombre="refrescar" />
                </button>
              </div>
            </div>
          ) : null}
          {vista === "guia" ? (
            <div className="guia-screen">
              <div className="app-heading">
                <div>
                  <h1 ref={titulo} tabIndex={-1}>
                    Antes de soltar hilo
                  </h1>
                </div>
              </div>
              <section className="elegir-volantin">
                <h2>¿Cuál llevas?</h2>
                <div className="perfiles-app">
                  {PERFILES.map((p) => (
                    <label key={p.id}>
                      <input
                        type="radio"
                        name="perfil"
                        value={p.id}
                        checked={perfil === p.id}
                        onChange={() => cambiarPerfil(p.id)}
                      />
                      <IconoPerfil perfil={p.id} />
                      <span>
                        <strong>{p.nombre}</strong>
                        <small>{p.detalle}</small>
                      </span>
                      <span className="radio-visual">
                        <Icono nombre="check" />
                      </span>
                    </label>
                  ))}
                </div>
              </section>
              <section className="checklist-app">
                <div className="lista-titulo">
                  <h2>Una última mirada</h2>
                  <span>{checks.length}/3 completados</span>
                </div>
                {[
                  "Hilo sin curar y carrete en buen estado",
                  "Espacio abierto, lejos de cables y calles",
                  "Agua, protección solar y tiempo para volver",
                ].map((texto) => (
                  <label key={texto}>
                    <input
                      type="checkbox"
                      checked={checks.includes(texto)}
                      onChange={() =>
                        setChecks(
                          checks.includes(texto)
                            ? checks.filter((c) => c !== texto)
                            : [...checks, texto],
                        )
                      }
                    />
                    <span className="check-visual">
                      <Icono nombre="check" />
                    </span>
                    <span>{texto}</span>
                  </label>
                ))}
              </section>
              <details className="seguridad-app">
                <summary>
                  Si se enreda en un cable
                  <Icono nombre="abajo" />
                </summary>
                <p>
                  No intentes recuperarlo ni subas a postes, árboles o techos.
                  Aléjate de la infraestructura eléctrica.
                </p>
                <a
                  href="https://energia.gob.cl/node/25222"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Recomendaciones de Energía
                </a>
              </details>
              <details className="seguridad-app">
                <summary>
                  Sobre el hilo curado
                  <Icono nombre="abajo" />
                </summary>
                <p>
                  El hilo curado está prohibido por la Ley 20.700. Elige hilo
                  sin curar y evita poner en riesgo a otras personas.
                </p>
                <a
                  href="https://www.bcn.cl/leychile/navegar?idNorma=1054358"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Leer la ley en la BCN
                </a>
              </details>
              <button
                className="app-primary guia-listo"
                onClick={() => navegar("salida")}
              >
                Volver a mi salida
                <Icono nombre="flecha" />
              </button>
            </div>
          ) : null}
        </div>
        {vista === "salida" ? (
          <div className="salida-acciones">
            <a
              className="app-primary"
              href={`https://www.google.com/maps/dir/?api=1&destination=${parque.lat},${parque.lon}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icono nombre="salir" />
              Cómo llegar
              <span className="sr-only"> (abre Google Maps)</span>
            </a>
            <a
              className="app-secondary"
              href={`/volar?zona=${parque.zonaId}&perfil=${perfil}&parque=${parque.id}`}
            >
              <Icono nombre="viento" />
              Ya estoy afuera
            </a>
          </div>
        ) : null}
        <div
          className={`app-feedback${mensaje ? " app-feedback--visible" : ""}`}
          role="status"
        >
          {mensaje ? (
            <>
              <span>{mensaje}</span>
              <button aria-label="Cerrar aviso" onClick={() => setMensaje("")}>
                <Icono nombre="cerrar" />
              </button>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
