import assert from "node:assert/strict";
import { test } from "node:test";

import { rutaApp } from "../lib/navegacion.ts";

test("los cambios de estado conservan la ruta de la aplicación", () => {
  const parametros = new URLSearchParams({
    perfil: "acrobatico",
    vista: "salida",
  });

  assert.equal(rutaApp(parametros), "/app?perfil=acrobatico&vista=salida");
});
