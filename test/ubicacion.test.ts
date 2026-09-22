import assert from "node:assert/strict";
import { test } from "node:test";

import fixture from "./fixtures/openmeteo.json" with { type: "json" };
import * as coordenadas from "../lib/coordenadas.ts";
import type { Perfil } from "../lib/bandas.ts";

test("solicita al navegador la mayor precisión disponible", () => {
  assert.deepEqual(coordenadas.OPCIONES_GEOLOCALIZACION, {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
  });
});

test("la geocodificación redondea solo lo necesario y reconoce Macul", () => {
  assert.equal(typeof coordenadas.crearUrlGeocodificacion, "function");
  assert.equal(typeof coordenadas.leerLugarGeocodificado, "function");

  const url = new URL(
    coordenadas.crearUrlGeocodificacion({
      lat: -33.4901234,
      lon: -70.6009876,
    }),
  );
  assert.equal(url.hostname, "nominatim.openstreetmap.org");
  assert.equal(url.searchParams.get("lat"), "-33.49");
  assert.equal(url.searchParams.get("lon"), "-70.601");
  assert.equal(url.searchParams.get("zoom"), "14");

  const lugar = coordenadas.leerLugarGeocodificado({
    name: "Macul",
    display_name:
      "Macul, Santiago, Provincia de Santiago, Región Metropolitana, Chile",
    address: {
      suburb: "Macul",
      city: "Santiago",
      state: "Región Metropolitana de Santiago",
      country_code: "cl",
    },
  });
  assert.deepEqual(lugar, {
    nombre: "Macul",
    comuna: "Macul",
    region: "Región Metropolitana de Santiago",
  });
});

test("reduce la coordenada enviada a la API sin alterar la ubicación local", () => {
  assert.equal(typeof coordenadas.redondearCoordenadas, "function");
  assert.deepEqual(
    coordenadas.redondearCoordenadas({
      lat: -33.4901234,
      lon: -70.6009876,
    }),
    { lat: -33.49, lon: -70.601 },
  );
});

test("acepta solo coordenadas válidas dentro del alcance de Santiago", () => {
  assert.equal(typeof coordenadas.leerCoordenadasConsulta, "function");
  assert.deepEqual(
    coordenadas.leerCoordenadasConsulta(
      new URLSearchParams({ lat: "-33.4901", lon: "-70.6009" }),
    ),
    { lat: -33.49, lon: -70.601 },
  );
  assert.equal(
    coordenadas.leerCoordenadasConsulta(
      new URLSearchParams({ lat: "40.7128", lon: "-74.006" }),
    ),
    null,
  );
  assert.equal(
    coordenadas.leerCoordenadasConsulta(
      new URLSearchParams({ lat: "NaN", lon: "-70.6" }),
    ),
    null,
  );
});

test("carga Best Match y contrasta ICON con ECMWF para la ubicación", async () => {
  assert.equal(typeof coordenadas.cargarPronosticoUbicacion, "function");
  const urls: URL[] = [];
  const senales: (AbortSignal | null | undefined)[] = [];
  const fetcher = async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = new URL(String(input));
    urls.push(url);
    senales.push(init?.signal);
    if (url.hostname === "nominatim.openstreetmap.org") {
      return Response.json({
        name: "Macul",
        display_name: "Macul, Santiago, Región Metropolitana, Chile",
        address: {
          suburb: "Macul",
          city: "Santiago",
          state: "Región Metropolitana de Santiago",
          country_code: "cl",
        },
      });
    }
    const respuesta = structuredClone(fixture[0]);
    assert.ok(respuesta);
    const modelo = url.searchParams.get("models");
    if (modelo === "ecmwf_ifs") {
      respuesta.latitude = -33.497364;
      respuesta.longitude = -70.618835;
      respuesta.hourly.wind_speed_10m[0] = 24;
      respuesta.hourly.wind_gusts_10m[0] = 32;
    }
    return Response.json(respuesta);
  };

  const resultado = await coordenadas.cargarPronosticoUbicacion(
    fetcher,
    { lat: -33.49, lon: -70.6 },
    () => "2026-09-22T12:00:00.000Z",
  );

  assert.equal(resultado.lugar.nombre, "Macul");
  assert.equal(resultado.pronostico.zonas.length, 1);
  assert.equal(resultado.pronostico.zonas[0]?.nombre, "Macul");
  assert.ok(resultado.distanciaCeldaKm > 0);
  const meteo = urls.filter((url) => url.hostname === "api.open-meteo.com");
  assert.equal(meteo.length, 3);
  assert.deepEqual(
    meteo.map((url) => url.searchParams.get("models")),
    [null, "icon_seamless", "ecmwf_ifs"],
  );
  assert.ok(
    meteo.every(
      (url) =>
        url.searchParams.get("latitude") === "-33.49" &&
        url.searchParams.get("longitude") === "-70.6",
    ),
  );
  assert.equal(resultado.comparaciones.length, 48);
  assert.equal(resultado.comparaciones[0]?.icon.viento, 7.6);
  assert.equal(resultado.comparaciones[0]?.ecmwf.viento, 24);
  assert.equal(senales.length, 4);
  assert.ok(senales.every((signal) => signal instanceof AbortSignal));
});

test("declara incertidumbre solo cuando los modelos cambian la decisión", () => {
  assert.equal(typeof coordenadas.modelosDiscrepan, "function");
  const comparacion = {
    fecha: "2026-09-22T15:00:00-03:00",
    icon: { viento: 13, racha: 18 },
    ecmwf: { viento: 24, racha: 32 },
  };

  assert.equal(
    coordenadas.modelosDiscrepan(comparacion, "estandar" satisfies Perfil),
    true,
  );
  assert.equal(
    coordenadas.modelosDiscrepan(
      {
        ...comparacion,
        ecmwf: { viento: 14, racha: 19 },
      },
      "estandar",
    ),
    false,
  );
});

test("conserva el pronóstico principal si falla un modelo de contraste", async () => {
  const resultado = await coordenadas.cargarPronosticoUbicacion(
    async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "nominatim.openstreetmap.org") {
        return Response.json({ address: { suburb: "Macul" } });
      }
      if (url.searchParams.get("models") === "icon_seamless") {
        throw new Error("ICON no disponible");
      }
      return Response.json(fixture[0]);
    },
    { lat: -33.49, lon: -70.6 },
    () => "2026-09-22T12:00:00.000Z",
  );

  assert.equal(resultado.pronostico.zonas[0]?.nombre, "Macul");
  assert.deepEqual(resultado.comparaciones, []);
});

test("añade la observación DMC sin convertirla en pronóstico", () => {
  assert.equal(typeof coordenadas.adjuntarObservaciones, "function");
  const base = coordenadas.adjuntarObservaciones(
    {
      lugar: { nombre: "Macul", comuna: "Macul", region: null },
      pronostico: {
        estado: "actual",
        actualizadoEn: "2026-09-22T12:00:00.000Z",
        zonas: [],
      },
      distanciaCeldaKm: 2,
      comparaciones: [],
    },
    [
      {
        fuente: "DMC",
        codigoEstacion: "330019",
        nombreEstacion: "Tobalaba",
        lat: -33.45528,
        lon: -70.54861,
        observadoEn: "2026-09-22T11:55:00.000Z",
        viento: 12,
        racha: 18,
        direccion: 240,
      },
    ],
  );

  assert.equal(base.pronostico.estado, "actual");
  assert.equal(
    base.pronostico.estado === "actual"
      ? base.pronostico.observaciones?.[0]?.nombreEstacion
      : null,
    "Tobalaba",
  );
  assert.deepEqual(base.comparaciones, []);
});

test("rechaza respuestas de ubicación incompletas antes de mostrarlas", () => {
  assert.equal(typeof coordenadas.esPronosticoUbicacion, "function");
  assert.equal(
    coordenadas.esPronosticoUbicacion({
      lugar: { nombre: "Macul", comuna: "Macul", region: null },
      pronostico: {
        estado: "actual",
        actualizadoEn: "2026-09-22T12:00:00.000Z",
        zonas: [
          {
            id: "ubicacion",
            nombre: "Macul",
            celda: { lat: -33.497, lon: -70.619 },
            horas: [],
            ventanas: [],
            puestaSol: [],
          },
        ],
      },
      distanciaCeldaKm: 2,
      comparaciones: [],
    }),
    true,
  );
  assert.equal(
    coordenadas.esPronosticoUbicacion({
      lugar: { nombre: "Macul" },
      distanciaCeldaKm: "cerca",
      comparaciones: [],
    }),
    false,
  );
});
