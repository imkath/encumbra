import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  proximaVentana,
  ventanaActiva,
  ventanas,
  type Hora,
} from "../lib/ventanas.ts";

const hora = (fecha: string, viento: number, racha: number): Hora => ({
  fecha,
  viento,
  racha,
});

describe("ventanas", () => {
  test("agrupa horas ideales contiguas y resume el tramo", () => {
    const resultado = ventanas(
      [
        hora("2026-09-01T15:00:00.000Z", 14, 15),
        hora("2026-09-01T16:00:00.000Z", 13, 20),
      ],
      "estandar",
    );

    assert.deepEqual(resultado, [
      {
        inicio: "2026-09-01T15:00:00.000Z",
        fin: "2026-09-01T17:00:00.000Z",
        banda: "ideal",
        vientoMedio: 13.5,
        rachaMax: 20,
        brecha: 6.5,
      },
    ]);
  });

  test("una hora mala parte el tramo", () => {
    const resultado = ventanas(
      [
        hora("2026-09-01T15:00:00.000Z", 14, 15),
        hora("2026-09-01T16:00:00.000Z", 3, 8),
        hora("2026-09-01T17:00:00.000Z", 13, 20),
      ],
      "estandar",
    );

    assert.deepEqual(
      resultado.map(({ inicio, fin }) => ({ inicio, fin })),
      [
        {
          inicio: "2026-09-01T15:00:00.000Z",
          fin: "2026-09-01T16:00:00.000Z",
        },
        {
          inicio: "2026-09-01T17:00:00.000Z",
          fin: "2026-09-01T18:00:00.000Z",
        },
      ],
    );
  });

  test("un tramo de una hora sobrevive y cero horas ideales no crea ventanas", () => {
    assert.equal(
      ventanas([hora("2026-09-01T15:00:00.000Z", 14, 15)], "estandar")
        .length,
      1,
    );
    assert.deepEqual(
      ventanas([hora("2026-09-01T15:00:00.000Z", 3, 8)], "estandar"),
      [],
    );
  });

  test("un salto temporal parte dos horas ideales", () => {
    const resultado = ventanas(
      [
        hora("2026-09-01T15:00:00.000Z", 14, 15),
        hora("2026-09-01T17:00:00.000Z", 13, 20),
      ],
      "estandar",
    );

    assert.equal(resultado.length, 2);
  });

  test("la ventana conserva la peor banda del tramo sin una segunda escala", () => {
    const [resultado] = ventanas(
      [
        hora("2026-09-01T15:00:00.000Z", 10, 10),
        hora("2026-09-01T16:00:00.000Z", 18, 29),
      ],
      "estandar",
    );

    assert.equal(resultado?.banda, "ideal");
  });

  test("ordena las ventanas por cercanía temporal", () => {
    const resultado = ventanas(
      [
        hora("2026-09-01T18:00:00.000Z", 14, 15),
        hora("2026-09-01T15:00:00.000Z", 13, 20),
      ],
      "estandar",
    );

    assert.deepEqual(
      resultado.map(({ inicio }) => inicio),
      ["2026-09-01T15:00:00.000Z", "2026-09-01T18:00:00.000Z"],
    );
  });

  test("encuentra la ventana activa y la próxima", () => {
    const resultado = ventanas(
      [
        hora("2026-09-01T15:00:00.000Z", 14, 15),
        hora("2026-09-01T18:00:00.000Z", 13, 20),
      ],
      "estandar",
    );

    assert.equal(
      ventanaActiva(resultado, new Date("2026-09-01T15:30:00.000Z"))?.inicio,
      "2026-09-01T15:00:00.000Z",
    );
    assert.equal(
      proximaVentana(resultado, new Date("2026-09-01T15:30:00.000Z"))?.inicio,
      "2026-09-01T18:00:00.000Z",
    );
    assert.equal(
      proximaVentana(resultado, new Date("2026-09-01T19:00:00.000Z")),
      null,
    );
  });
});
