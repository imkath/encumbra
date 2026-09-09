import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  formatearDesdeAhora,
  formatearHora,
  formatearVelocidad,
  formatearVentana,
  minutosLegibles,
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

  test("dice cuánto falta sin decir nunca cero minutos", () => {
    assert.equal(minutosLegibles(30_000), "1 min");
    assert.equal(minutosLegibles(25 * 60_000), "25 min");
    assert.equal(minutosLegibles(60 * 60_000), "1 h");
    assert.equal(minutosLegibles(142 * 60_000), "2 h 22 min");
  });

  test("envejece el dato en relativo, que es lo que se juzga en terreno", () => {
    const ahora = new Date("2026-08-31T16:00:00-04:00");
    assert.equal(
      formatearDesdeAhora("2026-08-31T15:56:00-04:00", ahora),
      "hace 4 min",
    );
    assert.equal(
      formatearDesdeAhora("2026-08-31T14:00:00-04:00", ahora),
      "hace 2 h",
    );
    // Recién traído no debe leerse como "hace 1 min".
    assert.equal(formatearDesdeAhora("2026-08-31T15:59:40-04:00", ahora), "recién");
    assert.equal(formatearDesdeAhora("no es una fecha", ahora), "sin dato");
  });
});
