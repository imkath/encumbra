import assert from "node:assert/strict";
import { test } from "node:test";
import { contextoSalida, luzEnHorario } from "../lib/salida.ts";
const buena = { banda: "ideal", probabilidadPrecipitacion: 0 };
test("la noche se informa como condición sin borrar el dato de viento", () => {
  assert.equal(contextoSalida(buena, false, true)?.estado, "noche");
  assert.equal(contextoSalida(buena, false, true)?.titulo, "Es de noche");
  assert.match(contextoSalida(buena, false, true)?.detalle ?? "", /espacio conocido/i);
  assert.equal(contextoSalida(buena, true, true), null);
  assert.equal(contextoSalida(buena, null, true)?.estado, "sin-datos");
});
test("prioriza datos vigentes y lluvia sin ocultar el peligro por viento", () => {
  assert.equal(contextoSalida(buena, true, false)?.titulo, "Actualiza antes de salir");
  assert.equal(contextoSalida({ ...buena, probabilidadPrecipitacion: 78 }, true, true)?.titulo, "Atento a la lluvia");
  assert.equal(contextoSalida({ ...buena, banda: "peligro" }, false, true), null);
});
test("la luz corresponde al día elegido y excluye la puesta de sol", () => {
  const amaneceres = ["2026-09-07T07:00:00-03:00"];
  const puestas = ["2026-09-07T19:00:00-03:00"];
  assert.equal(luzEnHorario("2026-09-07T06:00:00-03:00", amaneceres, puestas), false);
  assert.equal(luzEnHorario("2026-09-07T07:00:00-03:00", amaneceres, puestas), true);
  assert.equal(luzEnHorario("2026-09-07T19:00:00-03:00", amaneceres, puestas), false);
  assert.equal(luzEnHorario("2026-09-08T12:00:00-03:00", amaneceres, puestas), null);
});
