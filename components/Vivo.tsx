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

const CLAVE_MODO = "encumbra:modo";
const CLAVE_PRONOSTICO = "encumbra:pronostico:v1";
const CLAVE_ZONA = "encumbra:zona";
const INTERVALO_RELOJ_MS = 60_000;
const INTERVALO_REFRESCO_MS = 10 * 60_000;

type VivoProps = {
  readonly inicial: Pronostico;
  readonly perfilInicial: Perfil;
  readonly zonaInicial: string;
  readonly parqueInicial?: string;
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

export function Vivo({
  inicial,
  perfilInicial,
  zonaInicial,
  parqueInicial,
  servidoEn,
}: VivoProps) {
  const router = useRouter();
  const [pronostico, setPronostico] = useState<Pronostico>(inicial);
  const [ahora, setAhora] = useState(() => new Date(servidoEn));
  const [sinSenal, setSinSenal] = useState(inicial.estado !== "actual");
  const pronosticoRef = useRef(pronostico);

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

  function volverAPlanear(): void {
    window.localStorage.setItem(CLAVE_MODO, "planear");
    window.localStorage.setItem(CLAVE_ZONA, zonaInicial);
    router.push(
      `/?zona=${encodeURIComponent(zonaInicial)}&perfil=${perfilInicial}&vista=salida${parqueInicial ? `&parque=${encodeURIComponent(parqueInicial)}` : ""}`,
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
          {zona.nombre}
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
          <span className="vivo__grito">{luz.tipo === "terminada" ? "POR HOY" : VEREDICTOS[hora.banda]}</span>
          <span className="vivo__hueco">{luz.tipo === "terminada" ? "hasta aquí." : COLETILLAS[hora.banda]}</span>
        </h1>

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
