"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Perfil } from "@/lib/bandas.ts";
import { zonaMasCercana } from "@/lib/vivo.ts";

type OpcionZona = {
  readonly id: string;
  readonly nombre: string;
  readonly lat: number;
  readonly lon: number;
  readonly ventanaActiva: boolean;
};

type InterruptorModoProps = {
  readonly perfilInicial: Perfil;
  readonly zonaActual: string;
  readonly zonaFuePedida: boolean;
  readonly zonas: readonly OpcionZona[];
};

const CLAVE_ZONA = "encumbra:zona";
const CLAVE_MODO = "encumbra:modo";

function rutaPlanear(zona: string, perfil: Perfil): string {
  return `/?zona=${encodeURIComponent(zona)}&perfil=${perfil}`;
}

function rutaVolar(zona: string, perfil: Perfil): string {
  return `/volar?zona=${encodeURIComponent(zona)}&perfil=${perfil}`;
}

export function InterruptorModo({
  perfilInicial,
  zonaActual,
  zonaFuePedida,
  zonas,
}: InterruptorModoProps) {
  const router = useRouter();
  const [cambiandoZona, iniciarCambio] = useTransition();
  const [sugerencia, setSugerencia] = useState<OpcionZona | null>(null);

  function leerPerfilElegido(): Perfil {
    const formulario = document.getElementById("selector-volantin");
    if (!(formulario instanceof HTMLFormElement)) {
      return perfilInicial;
    }

    const valor = new FormData(formulario).get("perfil");
    return valor === "liviano" || valor === "acrobatico" ? valor : "estandar";
  }

  useEffect(() => {
    if (zonaFuePedida) {
      window.localStorage.setItem(CLAVE_ZONA, zonaActual);
      return;
    }

    const guardada = window.localStorage.getItem(CLAVE_ZONA);
    const existe = zonas.some(({ id }) => id === guardada);

    if (guardada && existe && guardada !== zonaActual) {
      router.replace(rutaPlanear(guardada, perfilInicial));
    }
  }, [perfilInicial, router, zonaActual, zonaFuePedida, zonas]);

  useEffect(() => {
    let vigente = true;

    async function detectarZona(): Promise<void> {
      if (!("permissions" in navigator) || !("geolocation" in navigator)) {
        return;
      }

      try {
        const permiso = await navigator.permissions.query({
          name: "geolocation",
        });
        if (permiso.state !== "granted" || !vigente) {
          return;
        }

        navigator.geolocation.getCurrentPosition(({ coords }) => {
          if (!vigente) {
            return;
          }

          const cercana = zonaMasCercana(
            { lat: coords.latitude, lon: coords.longitude },
            zonas,
          );
          setSugerencia(cercana?.ventanaActiva ? cercana : null);
        });
      } catch {
        setSugerencia(null);
      }
    }

    void detectarZona();
    return () => {
      vigente = false;
    };
  }, [zonas]);

  function cambiarZona(id: string): void {
    window.localStorage.setItem(CLAVE_ZONA, id);
    iniciarCambio(() => {
      router.push(rutaPlanear(id, leerPerfilElegido()));
    });
  }

  function entrarModoVolar(): void {
    window.localStorage.setItem(CLAVE_MODO, "volar");
    router.push(rutaVolar(zonaActual, leerPerfilElegido()));
  }

  function aceptarSugerencia(): void {
    if (!sugerencia) {
      return;
    }

    window.localStorage.setItem(CLAVE_ZONA, sugerencia.id);
    window.localStorage.setItem(CLAVE_MODO, "volar");
    router.push(rutaVolar(sugerencia.id, leerPerfilElegido()));
  }

  return (
    <>
      <form
        className="selector-zona"
        onSubmit={(evento) => evento.preventDefault()}
      >
        <div className="selector-zona__cabecera">
          <p className="encumbra-marca">
            <svg aria-hidden="true" viewBox="0 0 40 20" width="40" height="20">
              <path d="M3 17 35 3M23 8l6 8M29 5l6 8" />
            </svg>
            <span>Encumbra</span>
          </p>
          <label htmlFor="zona">¿Dónde vas a encumbrar?</label>
        </div>
        <select
          id="zona"
          name="zona"
          value={zonaActual}
          disabled={cambiandoZona}
          onChange={(evento) => cambiarZona(evento.currentTarget.value)}
        >
          {zonas.map(({ id, nombre }) => (
            <option key={id} value={id}>
              {nombre}
            </option>
          ))}
        </select>
      </form>

      {sugerencia ? (
        <button
          className="sugerencia-volar"
          type="button"
          onClick={aceptarSugerencia}
        >
          La zona más cercana es {sugerencia.nombre} · ver ahora
        </button>
      ) : null}

      <button className="accion-voy" type="button" onClick={entrarModoVolar}>
        Ya estoy afuera <span aria-hidden="true">↗</span>
      </button>
    </>
  );
}

export function Cabecera() {
  return (
    <header className="sitio-cabecera">
      <Link className="sitio-logo" href="/" aria-label="Encumbra, inicio">
        <svg viewBox="0 0 36 44" aria-hidden="true">
          <path fill="currentColor" d="M18 1 34 17 18 33 2 17Z" />
          <path
            d="m18 33-4 5 7 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M18 1v32M2 17h32"
            stroke="var(--color-surface)"
            strokeWidth="1.5"
          />
        </svg>
        encumbra<span>El día está allá afuera.</span>
      </Link>
      <nav aria-label="Navegación principal">
        <a href="#titulo-cola">El viento</a>
        <a href="#titulo-parques">Dónde ir</a>
      </nav>
    </header>
  );
}
