import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { cardinal, fraseDireccion } from "../lib/viento.ts";

describe("dirección del viento", () => {
  test("usa dieciséis rumbos chilenos y normaliza una vuelta completa", () => {
    assert.equal(cardinal(0), "N");
    assert.equal(cardinal(360), "N");
    assert.equal(cardinal(348.75), "N");
    assert.equal(cardinal(11.25), "NNE");
    assert.equal(cardinal(270), "O");
  });

  test("explica de dónde viene y tolera el dato ausente", () => {
    assert.equal(fraseDireccion(270), "viene del poniente");
    assert.equal(fraseDireccion(180), "viene del sur");
    assert.equal(cardinal(null), null);
    assert.equal(fraseDireccion(null), null);
  });
});
