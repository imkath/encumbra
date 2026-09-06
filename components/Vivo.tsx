"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { VEREDICTOS, type BandaId, type Perfil } from "@/lib/bandas.ts";
import { formatearHora, formatearVelocidad } from "@/lib/formato.ts";
import type { Pronostico, ZonaPronostico } from "@/lib/openmeteo.ts";
import { adaptarZonaAlPerfil, horaVigente } from "@/lib/planear.ts";
import {
  crearCalendario,
  estadoLuz,
  estadoVentana,
  leerPronosticoGuardado,
  serializarPronostico,
  tendencia60,
} from "@/lib/vivo.ts";
import { lecturasParques } from "@/lib/salida.ts";
import { Volantin } from "@/components/Volantin.tsx";

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
      <main className="vivo vivo--midiendo" data-banda="plancha">
        <section className="vivo__midiendo" aria-live="polite">
          <h1>MIDIENDO…</h1>
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

  return (
    <main className="vivo" data-banda={hora.banda}>
      <header className="vivo__cabecera">
        <p className="vivo__zona">
          {zona.nombre} · <span>volantín {NOMBRES_PERFIL[perfilInicial]}</span>
        </p>
        <p className="vivo__medicion" aria-live="polite">
          {estadoDesactualizado
            ? "sin señal · último dato de las "
            : "pronóstico actualizado a las "}
          <time dateTime={pronostico.actualizadoEn}>
            {formatearHora(pronostico.actualizadoEn)}
          </time>
        </p>
      </header>

      <section className="vivo__datos" aria-labelledby="estado-viento">
        <div className="vivo__ahora">
          <h1 id="estado-viento" className="vivo__banda">
            {VEREDICTOS[hora.banda]}
          </h1>
          <p className="vivo__viento">
            <strong>{Math.round(hora.viento)}</strong>
            <span>km/h</span>
            <small>rachas {formatearVelocidad(hora.racha)}</small>
          </p>
        </div>

        <Volantin
          className="vivo__volantin"
          banda={hora.banda}
          deNoche={luz.tipo === "terminada"}
        />

        {/* Standing in the park, the one thing you need is how long you have. */}
        <p className="vivo__ventana">{ventana.texto}</p>

        <dl className="vivo__contexto">
          <div>
            <dt>en 60 min</dt>
            <dd>{tendencia}</dd>
          </div>
          <div>
            <dt>luz</dt>
            <dd>
              {luz.tipo === "sin-dato" ? (
                "sin dato"
              ) : (
                <>
                  {luz.tipo === "vigente" ? "hasta las " : "terminó a las "}
                  <time dateTime={luz.fecha}>{formatearHora(luz.fecha)}</time>
                </>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <button className="vivo__listo" type="button" onClick={volverAPlanear}>
        Volver a planear
      </button>
    </main>
  );
}
