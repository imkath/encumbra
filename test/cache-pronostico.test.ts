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
});
