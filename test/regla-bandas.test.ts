import assert from "node:assert/strict";
import { test } from "node:test";
import { banda, tramosDeBanda } from "../lib/score.ts";

test("la regla cubre de 0 a 45 km/h sin huecos ni saltos", () => {
  const tramos = tramosDeBanda();
  assert.equal(tramos[0]!.desde, 0);
  assert.equal(tramos.at(-1)!.hasta, 45);
  for (let i = 1; i < tramos.length; i++) {
    assert.ok(tramos[i]!.desde > tramos[i - 1]!.hasta - 1, "tramos contiguos");
    assert.notEqual(tramos[i]!.id, tramos[i - 1]!.id, "sin tramos repetidos");
  }
});

test("cada tramo dice la misma banda que el modelo", () => {
  for (const tramo of tramosDeBanda()) {
    const medio = (tramo.desde + tramo.hasta) / 2;
    assert.equal(banda(medio, medio, "estandar"), tramo.id);
  }
});

test("sin viento no anda y con 45 es peligro", () => {
  const tramos = tramosDeBanda();
  assert.equal(tramos[0]!.id, "plancha");
  assert.equal(tramos.at(-1)!.id, "peligro");
});
