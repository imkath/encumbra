import assert from "node:assert/strict";
import { test } from "node:test";

import fixture from "./fixtures/openmeteo.json" with { type: "json" };
import { crearPronostico } from "../lib/openmeteo.ts";
import {
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
