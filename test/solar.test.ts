import assert from "node:assert/strict";
import { test } from "node:test";

import { efemeridesSantiago } from "../lib/solar.ts";

test("calcula amanecer y puesta de sol de Santiago sin red", () => {
  const resultado = efemeridesSantiago(
    "2026-09-20",
    -33.45,
    -70.66,
  );

  assert.match(resultado.salida, /^2026-09-20T07:\d{2}:00-03:00$/);
  assert.match(resultado.puesta, /^2026-09-20T19:\d{2}:00-03:00$/);
  assert.ok(Date.parse(resultado.salida) < Date.parse(resultado.puesta));
});

test("respeta el cambio de hora de Chile", () => {
  const invierno = efemeridesSantiago("2026-06-20", -33.45, -70.66);
  const verano = efemeridesSantiago("2026-12-20", -33.45, -70.66);

  assert.match(invierno.salida, /-04:00$/);
  assert.match(verano.salida, /-03:00$/);
});
