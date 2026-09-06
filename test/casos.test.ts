import assert from "node:assert/strict";
import { test } from "node:test";

import { VEREDICTOS } from "../lib/bandas.ts";
import { banda, score } from "../lib/score.ts";

test("reproduce los nueve casos de calibración del perfil estándar", () => {
  const casos = [
    [8, 22, 55, "APENAS"],
    [13, 20, 98, "ANDA"],
    [12, 45, 33, "NO SALGAS"],
    [12, 40, 51, "APENAS"],
    [18, 26, 77, "ANDA"],
    [3, 8, 14, "NO ANDA"],
    [25, 40, 0, "BRAVO"],
    [14, 15, 100, "ANDA"],
    [50, 60, 0, "NO SALGAS"],
  ] as const;

  for (const [viento, racha, scoreEsperado, veredictoEsperado] of casos) {
    assert.equal(score(viento, racha, "estandar"), scoreEsperado);
    assert.equal(
      VEREDICTOS[banda(viento, racha, "estandar")],
      veredictoEsperado,
      `${viento}/${racha}`,
    );
  }
});
