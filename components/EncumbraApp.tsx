"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Perfil } from "@/lib/bandas.ts";
import { CONSEJOS, ETIQUETAS } from "@/lib/bandas.ts";
import type { Pronostico } from "@/lib/openmeteo.ts";
import {
  buscarParques,
  ordenarParques,
  parquesProponibles,
  type Coordenadas,
} from "@/lib/parques.ts";
import {
  contextoSalida,
  diaDeSalida,
  luzEnHorario,
  elegirParqueInicial,
  lecturasParques,
  type LecturaParque,
} from "@/lib/salida.ts";
import { formatearHora } from "@/lib/formato.ts";
import { adaptarZonaAlPerfil, horaVigente } from "@/lib/planear.ts";
import {
  leerPronosticoGuardado,
  serializarPronostico,
  zonaMasCercana,
} from "@/lib/vivo.ts";
import { Icono, Volantin } from "./Icono.tsx";
import { AgregarCalendario } from "./AgregarCalendario.tsx";
import { Marca } from "./Marca.tsx";

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
  const [diaElegido, setDiaElegido] = useState<0 | 1>(0);
  const [horaElegida, setHoraElegida] = useState<string | null>(null);
  const [listaCompleta, setListaCompleta] = useState(false);
  const [checks, setChecks] = useState<string[]>([]);
  const contenido = useRef<HTMLDivElement>(null);
  const cintaHoras = useRef<HTMLDivElement>(null);
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
  const zonaAquiBase = ubicacion
    ? zonaMasCercana(
        ubicacion,
        pronostico.zonas.map((zona) => ({
          ...zona,
          lat: zona.celda.lat,
          lon: zona.celda.lon,
        })),
      )
    : null;
  const zonaAqui = zonaAquiBase
    ? adaptarZonaAlPerfil(zonaAquiBase, perfil)
    : null;
  const horaAqui = zonaAqui ? horaVigente(zonaAqui.horas, ahora) : null;
  const parque = parques.find((p) => p.id === seleccionado) ?? parques[0]!;
  const proponibles = parquesProponibles(parques);
  const ordenados = ordenarParques(
    proponibles,
    orden === "cerca" ? "cerca" : "adecuado",
  );
  const universo = busqueda ? parques : ordenados;
  const resultados = buscarParques(
    orden === "guardados"
      ? universo.filter((p) => favoritos.includes(p.id))
      : universo,
    busqueda,
  );
  const visibles =
    listaCompleta || busqueda || orden === "guardados"
      ? resultados
      : resultados.slice(0, 5);
  const fechaPlan = diaDeSalida(ahora, diaElegido);
  const plan = lecturasParques(pronostico, perfil, ahora, ubicacion, fechaPlan).find((p) => p.id === parque.id)!;
  const actualizado = pronostico.estado === "actual";
  const zonaElegida = pronostico.zonas.find((z) => z.id === parque.zonaId);
  const luzDeHora = (fecha: string) => luzEnHorario(fecha, zonaElegida?.salidaSol ?? [], zonaElegida?.puestaSol ?? []);
  const hora = plan.horas.find((h) => h.fecha === horaElegida)
    ?? (diaElegido === 0 ? plan.horas[0] : plan.horas.find((h) => plan.ventanaDiurna && Date.parse(h.fecha) >= Date.parse(plan.ventanaDiurna.inicio)))
    ?? (diaElegido === 1 ? plan.horas.find((h) => luzDeHora(h.fecha)) : null)
    ?? plan.horas[0] ?? null;
  useEffect(() => {
    const cinta = cintaHoras.current;
    const activa = cinta?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (cinta && activa) {
      cinta.scrollTo({ left: cinta.scrollLeft + activa.getBoundingClientRect().left - cinta.getBoundingClientRect().left - 8, behavior: "instant" });
    }
  }, [fechaPlan, hora?.fecha, vista]);
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
        "Guardado solo por ahora. Tu navegador no deja guardarlo para después.",
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
            <small className="parque-permiso" data-permiso={p.permiso}>
              <Icono nombre="arbol" />
              {p.permiso === "autorizado"
                ? "Autorizado para encumbrar"
                : "Permiso no confirmado"}
            </small>
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
          <Marca />
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
                <section className="donde-estoy" aria-label="Viento donde estoy">
                  {ubicacion ? (
                    <div className="donde-estoy__resultado" data-estado={horaAqui?.banda ?? "sin-datos"}>
                      <span className="donde-estoy__icono">
                        <Icono nombre="ubicacion" />
                      </span>
                      <div>
                        <strong>Donde estoy</strong>
                        <span>
                          {horaAqui
                            ? `${ETIQUETAS[horaAqui.banda]} · ${Math.round(horaAqui.viento)} km/h`
                            : "Viento no disponible por ahora"}
                        </span>
                        <small>
                          Pronóstico de la celda más cercana. No necesitas elegir un parque.
                        </small>
                      </div>
                      <button
                        type="button"
                        onClick={localizar}
                        disabled={localizando}
                      >
                        Actualizar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="donde-estoy__accion"
                      onClick={localizar}
                      disabled={localizando}
                    >
                      <span className="donde-estoy__icono">
                        <Icono nombre="ubicacion" />
                      </span>
                      <span>
                        <strong>{localizando ? "Buscando tu ubicación…" : "Ver si anda donde estoy"}</strong>
                        <small>Sin elegir un parque</small>
                      </span>
                      <Icono nombre="flecha" />
                    </button>
                  )}
                  {ubicacion ? (
                    <p>El viento no confirma que el lugar sea abierto, seguro ni autorizado para encumbrar.</p>
                  ) : null}
                </section>
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
                            ? "Cerca tuyo"
                            : "Explora los parques"}
                    </h2>
                    <span>
                      {busqueda || orden === "guardados"
                        ? resultados.length
                        : `${visibles.length} de ${proponibles.length}`}
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
                      Explorar los {proponibles.length} parques autorizados
                      <Icono nombre="flecha" />
                    </button>
                  ) : null}
                  <details className="criterio-app">
                    <summary>¿Por qué estos parques?</summary>
                    <p>
                      {ubicacion
                        ? "Comparamos el viento entre los cinco más cercanos. A igual condición, priorizamos la distancia."
                        : "Ordenamos por el viento de su zona. Usa tu ubicación para considerar la distancia."}{" "}
                      Las distancias son en línea recta. El pronóstico no dice nada
                      del acceso ni de qué tan seguro está el parque.
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
                  <p className="permiso-detalle" data-permiso={parque.permiso}>
                    <Icono nombre="arbol" />
                    {parque.permiso === "autorizado" ? (
                      <>
                        Autorizado para encumbrar según Parquemet. Respeta las
                        reglas y horarios del recinto.
                      </>
                    ) : (
                      <>
                        No tenemos una autorización vigente confirmada para
                        este parque. Revisa con su administración antes de ir.
                      </>
                    )}
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
              <div className="dias-salida" role="group" aria-label="Día de la salida">
                {([0, 1] as const).map((dia) => <button key={dia} type="button" aria-pressed={diaElegido === dia} onClick={() => { setDiaElegido(dia); setHoraElegida(null); }}>{dia === 0 ? "Hoy" : "Mañana"}</button>)}
              </div>
              <div className="salida-layout">
                <section
                  className="parte-viento superficie-mate"
                  data-estado={contexto?.estado ?? hora?.banda ?? "sin-datos"}
                  aria-label="Condiciones de viento"
                >
                  <div className="parte-viento__hora">
                    <span>
                      {hora ? (diaElegido === 1 ? `Mañana · ${formatearHora(hora.fecha)}` : hora.fecha === parque.hora?.fecha ? "Ahora" : `Hoy · ${formatearHora(hora.fecha)}`) : (diaElegido === 1 ? "Mañana · sin datos" : "Hoy · sin datos")}
                    </span>
                    <span>{actualizado ? "Pronóstico" : "Último dato"}</span>
                  </div>
                  <h2>{contexto?.titulo ?? (hora ? ETIQUETAS[hora.banda] : "Todavía sin dato de viento")}</h2>
                  <p>
                    {contexto?.detalle ?? (hora
                      ? `Por viento: ${CONSEJOS[hora.banda]}`
                      : "No hay datos para este día. Prueba el otro día o actualiza el pronóstico.")}
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
                    <Icono nombre={plan.ventanaDiurna ? "sol" : "reloj"} />
                    <div>
                      <strong>
                        {plan.ventanaDiurna
                          ? "Viento y luz coinciden"
                          : plan.luzConfirmada
                            ? "Sin ventana de viento con luz"
                            : "Horario con luz pendiente"}
                      </strong>
                      <p>
                        {plan.ventanaDiurna
                          ? `${new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", weekday: "short", day: "numeric" }).format(new Date(plan.ventanaDiurna.inicio))} · ${formatearHora(plan.ventanaDiurna.inicio)}–${formatearHora(plan.ventanaDiurna.fin)}. Revisa la lluvia.`
                          : plan.luzConfirmada
                            ? "Puedes revisar el viento hora a hora."
                            : "Sin el horario de amanecer no podemos decirte si hay luz."}
                      </p>
                    </div>
                    {plan.ventanaDiurna && actualizado ? (
                      <AgregarCalendario ventana={plan.ventanaDiurna} lugar={parque.nombre} />
                    ) : null}
                  </div>
                  {plan.horas.length ? (
                    <section
                      className="horas-app"
                      aria-label="Pronóstico por hora"
                    >
                      <div className="lista-titulo">
                        <h2>Elige tu momento</h2>
                        <span>Desliza las horas</span>
                      </div>
                      <div className="horas-cinta" ref={cintaHoras}>
                        {plan.horas.map((h) => (
                          <button
                            key={h.fecha}
                            data-estado={h.banda}
                            data-luz={luzDeHora(h.fecha) === false ? "noche" : "dia"}
                            aria-pressed={h.fecha === hora?.fecha}
                            aria-label={`${formatearHora(h.fecha)}, ${ETIQUETAS[h.banda]}, viento ${Math.round(h.viento)} kilómetros por hora, rachas ${Math.round(h.racha)}, ${luzDeHora(h.fecha) === false ? "de noche" : luzDeHora(h.fecha) ? "con luz" : "luz sin confirmar"}`}
                            onClick={() => setHoraElegida(h.fecha)}
                          >
                            <time dateTime={h.fecha}>
                              {diaElegido === 0 && h.fecha === parque.hora?.fecha ? "Ahora" : formatearHora(h.fecha)}
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
                      {plan.luz.fecha
                        ? formatearHora(plan.luz.fecha)
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
              <section className="checklist-app" aria-labelledby="cuidados-titulo">
                <div className="cuidados-intro">
                  <p className="cuidados-etiqueta">Cuidados al encumbrar</p>
                  <h2 id="cuidados-titulo">Para pasarlo bien<br />y volver bien.</h2>
                                    <span className="cuidados-progreso" role="status">{checks.length} de 3 revisados</span>
                </div>
                {[
                  { id: "lugar", titulo: "Dónde encumbrar", detalle: "Elige un espacio abierto, lejos de cables y calles. Deja espacio con otras personas." },
                  { id: "equipo", titulo: "Qué llevar", detalle: "Hilo sin curar, carrete en buen estado, agua y protección solar." },
                  { id: "regreso", titulo: "Cuándo parar", detalle: "Si las rachas te hacen perder el control o empieza a faltar luz, es momento de recoger." },
                ].map((cuidado) => (
                  <label key={cuidado.id}>
                    <input
                      type="checkbox"
                      checked={checks.includes(cuidado.id)}
                      onChange={() =>
                        setChecks(
                          checks.includes(cuidado.id)
                            ? checks.filter((c) => c !== cuidado.id)
                            : [...checks, cuidado.id],
                        )
                      }
                    />
                    <span className="check-visual">
                      <Icono nombre="check" />
                    </span>
                    <span className="cuidado-texto"><strong>{cuidado.titulo}</strong><small>{cuidado.detalle}</small></span>
                  </label>
                ))}
              </section>
              <div className="guia-seguridad">
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
              <details className="seguridad-app">
                <summary>Cómo leemos el viento<Icono nombre="abajo" /></summary>
                <p>El viento indica cuánto sopla en promedio. Las rachas son aumentos breves. Si son fuertes, el volantín puede dar tirones aunque el promedio parezca bueno.</p>
                <p>Uno de papel liviano necesita menos viento que uno acrobático. Al elegir cuál llevas, ajustamos la lectura y los horarios favorables.</p>
                <p>Usamos el pronóstico de Open-Meteo por zona. Varios parques comparten los mismos datos; árboles, edificios y relieve pueden cambiar lo que sientes en el lugar.</p>
                <p>Los horarios propuestos combinan viento favorable y luz de día. Revisa también la lluvia y cómo está al llegar. Es una estimación hecha desde el pronóstico.</p>
              </details>
              </div>
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
