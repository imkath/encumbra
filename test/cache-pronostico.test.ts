import assert from "node:assert/strict";
import { test } from "node:test";

import fixture from "./fixtures/openmeteo.json" with { type: "json" };
import { crearPronostico } from "../lib/openmeteo.ts";
import {
  combinarPronosticoObservado,
  CLAVE_PRONOSTICO,
  empaquetarPronostico,
  leerPronosticoCache,
} from "../lib/cache-pronostico.ts";
import * as cache from "../lib/cache-pronostico.ts";

test("la caché usa una sola clave estable", () => {
  assert.equal(CLAVE_PRONOSTICO, "pronostico:santiago:v1");
});

test("lee fresco como actual y conserva un dato viejo como desactualizado", () => {
  const pronostico = crearPronostico(fixture, "2026-09-20T12:00:00.000Z");
  const valor = empaquetarPronostico(pronostico);

  assert.equal(
    leerPronosticoCache(valor, new Date("2026-09-20T12:19:59.000Z")).estado,
    "actual",
  );
  assert.equal(
    leerPronosticoCache(valor, new Date("2026-09-20T12:20:01.000Z")).estado,
    "desactualizado",
  );
});

test("rechaza valores truncados o incompatibles sin lanzar", () => {
  assert.deepEqual(leerPronosticoCache("{", new Date()), {
    estado: "sin-datos",
    actualizadoEn: null,
    zonas: [],
  });
  assert.deepEqual(
    leerPronosticoCache(JSON.stringify({ version: 99 }), new Date()),
    { estado: "sin-datos", actualizadoEn: null, zonas: [] },
  );
});

test("conserva observaciones DMC opcionales dentro de la misma clave", () => {
  const pronostico = crearPronostico(fixture, "2026-09-20T12:00:00.000Z");
  assert.notEqual(pronostico.estado, "sin-datos");
  if (pronostico.estado === "sin-datos") return;

  const conObservacion = {
    ...pronostico,
    observaciones: [
      {
        fuente: "DMC" as const,
        codigoEstacion: "330020",
        nombreEstacion: "Quinta Normal, Santiago",
        lat: -33.445,
        lon: -70.68278,
        observadoEn: "2026-09-20T11:58:00.000Z",
        viento: 12.4,
        racha: 18.5,
        direccion: 260,
      },
    ],
  };

  const leido = leerPronosticoCache(
    empaquetarPronostico(conObservacion),
    new Date("2026-09-20T12:05:00.000Z"),
  );

  assert.notEqual(leido.estado, "sin-datos");
  if (leido.estado !== "sin-datos") {
    assert.deepEqual(leido.observaciones, conObservacion.observaciones);
  }
});

test("rechaza observaciones adulteradas dentro de la caché", () => {
  const pronostico = crearPronostico(fixture, "2026-09-20T12:00:00.000Z");
  const adulterado = JSON.parse(empaquetarPronostico(pronostico));
  adulterado.pronostico.observaciones = [{ fuente: "cualquier-cosa" }];

  assert.deepEqual(
    leerPronosticoCache(
      JSON.stringify(adulterado),
      new Date("2026-09-20T12:05:00.000Z"),
    ),
    { estado: "sin-datos", actualizadoEn: null, zonas: [] },
  );

  adulterado.pronostico.observaciones = [
    {
      fuente: "DMC",
      codigoEstacion: "330020",
      nombreEstacion: "Quinta Normal, Santiago",
      lat: -33.445,
      lon: -70.68278,
      observadoEn: "2026-09-20T11:58:00.000Z",
      viento: -1,
      racha: 18.5,
      direccion: 500,
    },
  ];
  assert.equal(
    leerPronosticoCache(
      JSON.stringify(adulterado),
      new Date("2026-09-20T12:05:00.000Z"),
    ).estado,
    "sin-datos",
  );
});

test("renueva la observación al llegar y conserva la anterior ante un fallo DMC", () => {
  const actual = crearPronostico(fixture, "2026-09-20T12:00:00.000Z");
  const observacion = {
    fuente: "DMC" as const,
    codigoEstacion: "330020",
    nombreEstacion: "Quinta Normal, Santiago",
    lat: -33.445,
    lon: -70.68278,
    observadoEn: "2026-09-20T11:58:00.000Z",
    viento: 12.4,
    racha: 18.5,
    direccion: 260,
  };
  const anterior = combinarPronosticoObservado(actual, [observacion], actual);

  const conservado = combinarPronosticoObservado(actual, null, anterior);
  assert.notEqual(conservado.estado, "sin-datos");
  if (conservado.estado !== "sin-datos") {
    assert.deepEqual(conservado.observaciones, [observacion]);
  }

  const nueva = {
    ...observacion,
    codigoEstacion: "330019",
    nombreEstacion: "Eulogio Sánchez, Tobalaba Ad.",
  };
  const parcial = combinarPronosticoObservado(actual, [nueva], anterior);
  assert.notEqual(parcial.estado, "sin-datos");
  if (parcial.estado !== "sin-datos") {
    assert.deepEqual(
      parcial.observaciones?.map(({ codigoEstacion }) => codigoEstacion).sort(),
      ["330019", "330020"],
    );
  }
});

test("guarda muestras horarias por día y las vence después de cinco semanas", () => {
  assert.equal(typeof cache.claveHistorialModelos, "function");
  assert.equal(typeof cache.actualizarHistorialModelos, "function");
  assert.equal(cache.HISTORIAL_TTL_SEGUNDOS, 35 * 24 * 60 * 60);
  assert.equal(
    cache.claveHistorialModelos("2026-09-22T12:03:00.000Z"),
    "modelos:santiago:2026-09-22:v1",
  );

  const muestra = {
    registradoEn: "2026-09-22T12:03:00.000Z",
    estaciones: [
      {
        codigoEstacion: "330019",
        nombreEstacion: "Tobalaba",
        observadoEn: "2026-09-22T11:58:00.000Z",
        observado: { viento: 12, racha: 18, direccion: 240 },
        comparaciones: [
          {
            fecha: "2026-09-22T12:00:00-03:00",
            icon: { viento: 10, racha: 16 },
            ecmwf: { viento: 13, racha: 19 },
          },
        ],
      },
    ],
  };
  const inicial = cache.actualizarHistorialModelos(null, muestra);
  const reemplazado = cache.actualizarHistorialModelos(
    JSON.stringify(inicial),
    { ...muestra, registradoEn: "2026-09-22T12:53:00.000Z" },
  );
  const siguiente = cache.actualizarHistorialModelos(
    JSON.stringify(reemplazado),
    { ...muestra, registradoEn: "2026-09-22T13:03:00.000Z" },
  );

  assert.equal(inicial.muestras.length, 1);
  assert.equal(reemplazado.muestras.length, 1);
  assert.equal(reemplazado.muestras[0]?.registradoEn, "2026-09-22T12:53:00.000Z");
  assert.equal(siguiente.muestras.length, 2);
});

test("descarta un historial de modelos adulterado sin interrumpir el cron", () => {
  const muestra = {
    registradoEn: "2026-09-22T14:03:00.000Z",
    estaciones: [],
  };
  const actualizado = cache.actualizarHistorialModelos(
    JSON.stringify({ version: 1, dia: "2026-09-22", muestras: [{}] }),
    muestra,
  );

  assert.deepEqual(actualizado.muestras, [muestra]);
});
