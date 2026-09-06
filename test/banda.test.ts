import assert from "node:assert/strict";
import { describe, test } from "node:test";

import * as bandas from "../lib/bandas.ts";
import { RACHA_PELIGRO, VIENTO_PELIGRO } from "../lib/bandas.ts";
import { banda, score } from "../lib/score.ts";

describe("banda", () => {
  test("18 km/h con rachas de 40 nunca es ideal", () => {
    assert.notEqual(banda(18, 40, "estandar"), "ideal");
  });

  test("el corte duro de seguridad gana al score", () => {
    assert.equal(banda(VIENTO_PELIGRO, 15, "estandar"), "peligro");
    assert.equal(banda(12, RACHA_PELIGRO, "estandar"), "peligro");
  });

  test("un mismo score bajo distingue plancha de bravo por el lado de la campana", () => {
    assert.equal(score(4, 0, "estandar"), score(24, 0, "estandar"));
    assert.equal(banda(4, 0, "estandar"), "plancha");
    assert.equal(banda(24, 0, "estandar"), "bravo");
  });

  test("cada banda entrega un consejo corto y accionable", () => {
    const modulo = bandas as typeof bandas & {
      readonly CONSEJOS?: Record<string, string>;
    };

    assert.deepEqual(modulo.CONSEJOS, {
      plancha: "Falta viento por ahora.",
      liviano: "Con uno liviano puede andar.",
      ideal: "Buen momento. Elige un lugar despejado.",
      bravo: "Va con tirones. Mejor espera a que baje.",
      peligro: "No encumbres con estas rachas.",
    });
  });
});
