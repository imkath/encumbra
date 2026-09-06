import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  formatearHora,
  formatearVelocidad,
  formatearVentana,
} from "../lib/formato.ts";

describe("formato", () => {
  test("muestra las horas en Santiago con reloj de 24 horas", () => {
    assert.equal(formatearHora("2026-08-31T16:00:00-04:00"), "16:00");
    assert.equal(formatearHora("2026-08-31T00:05:00-04:00"), "00:05");
  });

  test("redondea la velocidad sin falsa precisión", () => {
    assert.equal(formatearVelocidad(14.4), "14 km/h");
    assert.equal(formatearVelocidad(14.6), "15 km/h");
  });

  test("describe una ventana horaria sin librería de fechas", () => {
    assert.equal(
      formatearVentana(
        "2026-08-31T16:00:00-04:00",
        "2026-08-31T18:00:00-04:00",
      ),
      "16:00–18:00",
    );
  });
});
