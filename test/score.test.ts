import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { PERFILES, type Perfil } from "../lib/bandas.ts";
import { score } from "../lib/score.ts";

describe("score", () => {
  test("vale 100 en el centro de cada perfil", () => {
    for (const [perfil, { centro }] of Object.entries(PERFILES)) {
      assert.equal(score(centro, 0, perfil as Perfil), 100);
    }
  });

  test("cae de forma simétrica alrededor del centro", () => {
    for (const [perfil, { centro }] of Object.entries(PERFILES)) {
      const id = perfil as Perfil;

      assert.equal(score(centro - 4, 0, id), score(centro + 4, 0, id));
    }
  });

  test("la penalización por racha crece hasta anular el score", () => {
    for (const [perfil, { centro, techoRacha }] of Object.entries(PERFILES)) {
      const id = perfil as Perfil;

      assert.equal(score(centro, techoRacha, id), 100);
      assert.equal(score(centro, techoRacha * 1.5, id), 50);
      assert.equal(score(centro, techoRacha * 2, id), 0);
    }
  });

  test("los centros se ordenan de liviano a acrobático", () => {
    assert.ok(PERFILES.liviano.centro < PERFILES.estandar.centro);
    assert.ok(PERFILES.estandar.centro < PERFILES.acrobatico.centro);
  });
});
