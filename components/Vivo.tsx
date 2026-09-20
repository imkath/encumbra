"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  COLETILLAS,
  VEREDICTOS,
  type BandaId,
  type Perfil,
} from "@/lib/bandas.ts";
import {
  formatearDesdeAhora,
  formatearHora,
  formatearVelocidad,
} from "@/lib/formato.ts";
import type { Pronostico, ZonaPronostico } from "@/lib/openmeteo.ts";
import { adaptarZonaAlPerfil, horaVigente } from "@/lib/planear.ts";
import {
  estadoLuz,
  estadoVentana,
  leerPronosticoGuardado,
  serializarPronostico,
  tendencia60,
} from "@/lib/vivo.ts";
import { Marca } from "@/components/Marca.tsx";
import { VolantinCampo } from "@/components/VolantinCampo.tsx";
import { Icono } from "@/components/Icono.tsx";
import {
  guiaDespegue,
  rumboDispositivo,
  suavizarRumbo,
  trayectoriaViento,
} from "@/lib/viento.ts";

const CLAVE_MODO = "encumbra:modo";
const CLAVE_PRONOSTICO = "encumbra:pronostico:v1";
const CLAVE_ZONA = "encumbra:zona";
const INTERVALO_RELOJ_MS = 60_000;
const INTERVALO_REFRESCO_MS = 10 * 60_000;
const INTERVALO_BRUJULA_MS = 160;

type EstadoBrujula =
  | "inactiva"
  | "pidiendo"
  | "buscando"
  | "calibrando"
  | "activa"
  | "denegada"
  | "sin-sensor";

type EventoOrientacion = DeviceOrientationEvent & {
  readonly webkitCompassHeading?: number;
  readonly webkitCompassAccuracy?: number;
};

type ConstructorOrientacion = typeof DeviceOrientationEvent & {
  requestPermission?: (absolute?: boolean) => Promise<"granted" | "denied">;
};

const PUNTOS_CARDINALES = [
  ["N", 0],
  ["E", 90],
  ["S", 180],
  ["O", 270],
] as const;

type VivoProps = {
  readonly inicial: Pronostico;
  readonly perfilInicial: Perfil;
  readonly zonaInicial: string;
  readonly parqueInicial?: string;
  readonly desdeUbicacion?: boolean;
  readonly servidoEn: string;
};

const NOMBRES_PERFIL: Record<Perfil, string> = {
  liviano: "de papel liviano",
  estandar: "con cola",
  acrobatico: "acrobático",
};

function tieneDatos(
  pronostico: Pronostico,
): pronostico is Exclude<Pronostico, { readonly estado: "sin-datos" }> {
  return pronostico.estado !== "sin-datos";
}

function buscarZona(
  pronostico: Pronostico,
  zonaId: string,
): ZonaPronostico | null {
  if (!tieneDatos(pronostico)) {
    return null;
  }

  return (
    pronostico.zonas.find(({ id }) => id === zonaId) ??
    pronostico.zonas[0] ??
    null
  );
}

function bandaVigente(
  pronostico: Pronostico,
  zonaId: string,
  ahora: Date,
  perfil: Perfil,
): BandaId | null {
  const zona = buscarZona(pronostico, zonaId);
  const adaptada = zona ? adaptarZonaAlPerfil(zona, perfil) : null;
  return adaptada ? (horaVigente(adaptada.horas, ahora)?.banda ?? null) : null;
}

function BrujulaViento({
  direccion,
  perfil,
  estado,
  rumboTelefono,
  activar,
  desactivar,
}: {
  readonly direccion: number;
  readonly perfil: Perfil;
  readonly estado: EstadoBrujula;
  readonly rumboTelefono: number | null;
  readonly activar: () => void;
  readonly desactivar: () => void;
}) {
  const orientada = estado === "activa" && rumboTelefono !== null;
  const rumbo = orientada ? rumboTelefono : 0;
  const trayectoria = trayectoriaViento(direccion, rumbo);
  const guia = orientada ? guiaDespegue(direccion, rumboTelefono) : null;
  const estabaAlineado = useRef(false);

  useEffect(() => {
    const alineado = guia?.estado === "alineado";
    if (
      alineado &&
      !estabaAlineado.current &&
      "vibrate" in navigator
    ) {
      navigator.vibrate(60);
    }
    estabaAlineado.current = alineado;
  }, [guia?.estado]);

  if (!trayectoria) return null;

  const estadoTexto =
    estado === "activa"
      ? "Déjalo plano, con la pantalla hacia arriba."
      : estado === "pidiendo"
        ? "Esperando tu permiso…"
        : estado === "buscando"
          ? "Buscando el norte… deja el celular plano."
          : estado === "calibrando"
            ? "La brújula pide calibración: mueve el celular en forma de ocho."
          : estado === "denegada"
            ? "Sin permiso, dejamos el norte arriba."
            : estado === "sin-sensor"
              ? "Este navegador no entregó el norte; lo dejamos arriba."
              : "Pon el celular plano para usarlo como brújula.";

  const giroIcono =
    guia?.estado === "gira-derecha"
      ? 90
      : guia?.estado === "gira-izquierda"
        ? -90
        : 0;

  return (
    <section className="vivo__brujula" aria-labelledby="direccion-viento">
      <p
        className="vivo__brujula-giro"
        data-estado={guia?.estado ?? "inactivo"}
        aria-live="polite"
      >
        <span
          className="vivo__brujula-giro-icono"
          style={{ transform: `rotate(${giroIcono}deg)` }}
          aria-hidden="true"
        >
          <Icono nombre="direccion" />
        </span>
        <span>
          <small>PARA DESPEGAR</small>
          <strong>
            {guia?.instruccion ??
              "Activa la brújula para saber hacia dónde ponerte"}
          </strong>
        </span>
      </p>

      <div
        className="brujula-viento"
        data-orientada={orientada ? "si" : "no"}
        data-alineada={guia?.estado === "alineado" ? "si" : "no"}
        role="img"
        aria-label={`${trayectoria.vieneDe}. ${trayectoria.vaHacia}. ${orientada ? "Orientada con el norte del celular." : "Con el norte hacia arriba."}`}
      >
        <span className="brujula-viento__objetivo" aria-hidden="true" />
        <span className="brujula-viento__aro" aria-hidden="true" />
        {PUNTOS_CARDINALES.map(([punto, grados]) => {
          const angulo = ((grados - rumbo + 360) % 360);
          return (
            <span
              className={`brujula-viento__punto brujula-viento__punto--${punto.toLowerCase()}`}
              style={{
                transform: `translate(-50%, -50%) rotate(${angulo}deg) translateY(-39px) rotate(${-angulo}deg)`,
              }}
              aria-hidden="true"
              key={punto}
            >
              {punto}
            </span>
          );
        })}
        <span
          className="brujula-viento__origen"
          style={{
            transform: `translate(-50%, -50%) rotate(${trayectoria.anguloOrigen}deg) translateY(-39px)`,
          }}
          aria-hidden="true"
        />
        <span
          className="brujula-viento__flecha"
          style={{
            transform: `translate(-50%, -50%) rotate(${trayectoria.anguloDestino}deg)`,
          }}
          aria-hidden="true"
        >
          <Icono nombre="direccion" />
        </span>
        <span className="brujula-viento__centro" aria-hidden="true" />
      </div>

      <div className="vivo__brujula-lectura">
        <p id="direccion-viento">
          <strong>{trayectoria.vieneDe}</strong>
          <span>{trayectoria.vaHacia}</span>
        </p>
        <p className="vivo__brujula-consejo">
          La parte superior del celular apunta hacia quien sostiene el volantín.
        </p>
        <p className="vivo__brujula-estado" aria-live="polite">
          {estadoTexto}
        </p>
        {orientada || estado === "calibrando" ? (
          <button type="button" onClick={desactivar}>
            Seguir sin brújula
          </button>
        ) : (
          <button
            type="button"
            onClick={activar}
            disabled={estado === "pidiendo" || estado === "buscando"}
          >
            {estado === "pidiendo" || estado === "buscando"
              ? "Orientando…"
              : estado === "denegada"
                ? "Intentar de nuevo"
                : "Orientarme para despegar"}
          </button>
        )}
      </div>

      <div className="vivo__posiciones">
        <p>
          <strong>Tú + hilo</strong>
          <span>Espalda al viento.</span>
        </p>
        <span className="vivo__posiciones-linea" aria-hidden="true" />
        <p>
          <strong>Ayudante + volantín</strong>
          <span>Delante de ti, hacia donde apunta el celular.</span>
        </p>
        <small>
          {perfil === "acrobatico"
            ? "Dejen libre el espacio y despejen las dos líneas. A tu señal, que lo suelte sin lanzarlo; tú tiras ambos mandos."
            : "Dejen libre el espacio. Nariz arriba; a tu señal, que lo suelte sin lanzarlo. Tú recoges hilo mientras sube."}
        </small>
      </div>
      <small className="vivo__brujula-limite">
        La brújula orienta el pronóstico; confirma el viento con pasto o una
        cinta. Imanes y metal pueden mover la lectura.
      </small>
    </section>
  );
}

export function Vivo({
  inicial,
  perfilInicial,
  zonaInicial,
  parqueInicial,
  desdeUbicacion = false,
  servidoEn,
}: VivoProps) {
  const router = useRouter();
  const [pronostico, setPronostico] = useState<Pronostico>(inicial);
  const [ahora, setAhora] = useState(() => new Date(servidoEn));
  const [sinSenal, setSinSenal] = useState(inicial.estado !== "actual");
  const [estadoBrujula, setEstadoBrujula] =
    useState<EstadoBrujula>("inactiva");
  const [rumboTelefono, setRumboTelefono] = useState<number | null>(null);
  const [escucharBrujula, setEscucharBrujula] = useState(false);
  const pronosticoRef = useRef(pronostico);
  const ultimoEventoBrujula = useRef(Number.NEGATIVE_INFINITY);

  useEffect(() => {
    pronosticoRef.current = pronostico;
  }, [pronostico]);

  useEffect(() => {
    const guardado = leerPronosticoGuardado(
      window.localStorage.getItem(CLAVE_PRONOSTICO),
    );

    if (tieneDatos(inicial)) {
      window.localStorage.setItem(
        CLAVE_PRONOSTICO,
        serializarPronostico(inicial),
      );
      return;
    }

    if (guardado) {
      setPronostico(guardado);
      setSinSenal(true);
    }
  }, [inicial]);

  useEffect(() => {
    const intervalo = window.setInterval(
      () => setAhora(new Date()),
      INTERVALO_RELOJ_MS,
    );
    return () => window.clearInterval(intervalo);
  }, []);

  const actualizar = useCallback(async (): Promise<void> => {
    if (document.visibilityState === "hidden") {
      return;
    }

    const bandaAnterior = bandaVigente(
      pronosticoRef.current,
      zonaInicial,
      new Date(),
      perfilInicial,
    );

    try {
      const respuesta = await fetch("/api/pronostico", { cache: "no-store" });
      if (!respuesta.ok) {
        throw new Error("pronóstico no disponible");
      }

      const nuevo: Pronostico = await respuesta.json();
      if (!tieneDatos(nuevo)) {
        throw new Error("pronóstico vacío");
      }

      window.localStorage.setItem(
        CLAVE_PRONOSTICO,
        serializarPronostico(nuevo),
      );
      setPronostico(nuevo);
      setSinSenal(nuevo.estado !== "actual");
      setAhora(new Date());

      const bandaNueva = bandaVigente(
        nuevo,
        zonaInicial,
        new Date(),
        perfilInicial,
      );
      if (
        bandaAnterior &&
        bandaNueva &&
        bandaAnterior !== bandaNueva &&
        "vibrate" in navigator
      ) {
        navigator.vibrate(80);
      }
    } catch {
      setSinSenal(true);
    }
  }, [perfilInicial, zonaInicial]);

  useEffect(() => {
    const intervalo = window.setInterval(actualizar, INTERVALO_REFRESCO_MS);
    const quedarSinSenal = (): void => setSinSenal(true);

    window.addEventListener("online", actualizar);
    window.addEventListener("offline", quedarSinSenal);

    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", quedarSinSenal);
    };
  }, [actualizar]);

  useEffect(() => {
    if (!escucharBrujula) return;

    let recibioRumbo = false;
    let necesitaCalibrar = false;
    const leerRumbo = (eventoBase: Event): void => {
      const ahoraEvento = performance.now();
      if (ahoraEvento - ultimoEventoBrujula.current < INTERVALO_BRUJULA_MS) {
        return;
      }

      const evento = eventoBase as EventoOrientacion;
      const anguloPantalla =
        window.screen.orientation?.angle ??
        (window as Window & { readonly orientation?: number }).orientation ??
        0;
      if (
        evento.webkitCompassHeading !== undefined &&
        (evento.webkitCompassHeading < 0 ||
          evento.webkitCompassAccuracy === -1)
      ) {
        necesitaCalibrar = true;
        setEstadoBrujula("calibrando");
        return;
      }
      const rumbo = rumboDispositivo(
        {
          alpha: evento.alpha,
          absolute: evento.absolute,
          webkitCompassHeading: evento.webkitCompassHeading,
          webkitCompassAccuracy: evento.webkitCompassAccuracy,
        },
        evento.type === "deviceorientationabsolute",
        anguloPantalla,
      );
      if (rumbo === null) return;

      recibioRumbo = true;
      ultimoEventoBrujula.current = ahoraEvento;
      setRumboTelefono((anterior) => suavizarRumbo(anterior, rumbo));
      setEstadoBrujula("activa");
    };

    window.addEventListener("deviceorientationabsolute", leerRumbo);
    window.addEventListener("deviceorientation", leerRumbo);
    const espera = window.setTimeout(() => {
      if (!recibioRumbo) {
        if (necesitaCalibrar) {
          setEstadoBrujula("calibrando");
        } else {
          setEstadoBrujula("sin-sensor");
          setEscucharBrujula(false);
        }
      }
    }, 3_500);

    return () => {
      window.clearTimeout(espera);
      window.removeEventListener("deviceorientationabsolute", leerRumbo);
      window.removeEventListener("deviceorientation", leerRumbo);
    };
  }, [escucharBrujula]);

  const activarBrujula = useCallback(async (): Promise<void> => {
    if (!("DeviceOrientationEvent" in window)) {
      setEstadoBrujula("sin-sensor");
      return;
    }

    setEstadoBrujula("pidiendo");
    const Orientacion = window.DeviceOrientationEvent as ConstructorOrientacion;
    try {
      if (Orientacion.requestPermission) {
        const usaRumboWebKit =
          "webkitCompassHeading" in Orientacion.prototype;
        const permiso = usaRumboWebKit
          ? await Orientacion.requestPermission.call(Orientacion)
          : await Orientacion.requestPermission.call(Orientacion, true);
        if (permiso !== "granted") {
          setEstadoBrujula("denegada");
          return;
        }
      }

      ultimoEventoBrujula.current = Number.NEGATIVE_INFINITY;
      setEstadoBrujula("buscando");
      setEscucharBrujula(true);
    } catch {
      setEstadoBrujula("denegada");
    }
  }, []);

  const desactivarBrujula = useCallback((): void => {
    setEscucharBrujula(false);
    setRumboTelefono(null);
    setEstadoBrujula("inactiva");
  }, []);

  function volverAPlanear(): void {
    window.localStorage.setItem(CLAVE_MODO, "planear");
    window.localStorage.setItem(CLAVE_ZONA, zonaInicial);
    router.push(
      `/app?zona=${encodeURIComponent(zonaInicial)}&perfil=${perfilInicial}&vista=salida${desdeUbicacion ? "&destino=ubicacion" : parqueInicial ? `&parque=${encodeURIComponent(parqueInicial)}` : ""}`,
    );
  }

  const zonaBase = buscarZona(pronostico, zonaInicial);
  const zona = zonaBase ? adaptarZonaAlPerfil(zonaBase, perfilInicial) : null;
  const hora = zona ? horaVigente(zona.horas, ahora) : null;

  if (!zona || !hora || !tieneDatos(pronostico)) {
    return (
      <main
        className="vivo vivo--midiendo superficie-mate"
        data-banda="sin-datos"
        data-paleta="sin-datos"
      >
        <VolantinCampo banda={null} perfil={perfilInicial} />
        <section className="vivo__midiendo" aria-live="polite">
          <h1 className="vivo__frase">
            <span className="vivo__grito">SIN DATOS</span>
            <span className="vivo__hueco">por ahora.</span>
          </h1>
          <p>
            No llegó el pronóstico. Si ya abriste Encumbra antes, recuperaremos
            el último dato guardado.
          </p>
        </section>
        <button className="vivo__listo" type="button" onClick={volverAPlanear}>
          Volver a planear
        </button>
      </main>
    );
  }

  const ventana = estadoVentana(zona.ventanas, ahora);
  const luz = estadoLuz(zona.puestaSol, ahora);
  const tendencia = tendencia60(zona.horas, ahora);
  const estadoDesactualizado =
    sinSenal || pronostico.estado === "desactualizado";
  // With no window running, or with the sun already down, the wind is the limit
  // that matters; otherwise whichever of the two runs out first wins the dot.
  const mandaElViento =
    ventana.tipo !== "activa" ||
    luz.tipo !== "vigente" ||
    ventana.hasta === null ||
    Date.parse(ventana.hasta) <= Date.parse(luz.fecha);

  return (
    <main className="vivo superficie-mate" data-banda={hora.banda} data-paleta={luz.tipo === "terminada" ? "noche" : hora.banda}>
      <VolantinCampo
        banda={hora.banda}
        perfil={perfilInicial}
        deNoche={luz.tipo === "terminada"}
      />

      <header className="vivo__cabecera">
        <div>
        <Link href="/" className="vivo__marca" aria-label="Encumbra, inicio"><Marca /></Link>
        <p className="vivo__zona">
          {desdeUbicacion ? "Donde estoy" : zona.nombre}
          <span>volantín {NOMBRES_PERFIL[perfilInicial]}</span>
        </p>
        </div>
        {/* How old the reading is, not what time it is: the phone already shows the clock. */}
        <p
          className={
            estadoDesactualizado
              ? "vivo__frescura vivo__frescura--viejo"
              : "vivo__frescura"
          }
          aria-live="polite"
        >
          {estadoDesactualizado ? "sin señal · " : ""}
          {formatearDesdeAhora(pronostico.actualizadoEn, ahora)}
        </p>
      </header>

      <section className="vivo__datos" aria-labelledby="estado-viento">
        <h1 id="estado-viento" className="vivo__frase">
          <span className="vivo__grito">{VEREDICTOS[hora.banda]}</span>
          <span className="vivo__hueco">{COLETILLAS[hora.banda]}</span>
        </h1>

        {luz.tipo === "terminada" ? (
          <p className="vivo__noche">
            <Icono nombre="luna" />
            Es de noche. Si vas a encumbrar, quédate en un lugar conocido,
            iluminado y lejos de cables y calles.
          </p>
        ) : null}

        <dl className="vivo__pastillas">
          <div className="vivo__pastilla vivo__pastilla--llena">
            <dt>viento</dt>
            <dd>{formatearVelocidad(hora.viento)}</dd>
          </div>
          <div className="vivo__pastilla">
            <dt>rachas</dt>
            <dd>{Math.round(hora.racha)}</dd>
          </div>
          <div className="vivo__pastilla">
            <dt>en 60 min</dt>
            <dd>{tendencia}</dd>
          </div>
        </dl>
        {hora.direccion !== null ? (
          <BrujulaViento
            direccion={hora.direccion}
            perfil={perfilInicial}
            estado={estadoBrujula}
            rumboTelefono={rumboTelefono}
            activar={activarBrujula}
            desactivar={desactivarBrujula}
          />
        ) : null}
      </section>

      {/* Two different clocks run against you. The one that ends first is your limit. */}
      <footer className="vivo__limites">
        <div className="vivo__limite" data-manda={mandaElViento ? "si" : "no"}>
          <p className="vivo__limite-que">viento</p>
          <p className="vivo__limite-glosa">{ventana.glosa}</p>
          <p className="vivo__limite-valor">{ventana.valor}</p>
        </div>
        <div className="vivo__limite" data-manda={mandaElViento ? "no" : "si"}>
          <p className="vivo__limite-que">luz</p>
          <p className="vivo__limite-glosa">
            {luz.tipo === "sin-dato"
              ? "sin dato"
              : luz.tipo === "vigente"
                ? "hasta las"
                : "terminó"}
          </p>
          <p className="vivo__limite-valor">
            {luz.tipo === "sin-dato" ? (
              "—"
            ) : (
              <time dateTime={luz.fecha}>{formatearHora(luz.fecha)}</time>
            )}
          </p>
        </div>
      </footer>

      <button className="vivo__listo" type="button" onClick={volverAPlanear}>
        Volver a planear
      </button>
    </main>
  );
}
