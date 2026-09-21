import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  cargarObservacionesDmc,
  crearUrlDmc,
} from "../server/dmc.ts";

describe("cliente DMC del servidor", () => {
  test("codifica las credenciales solo en la URL del servidor", () => {
    const url = new URL(
      crearUrlDmc({ usuario: "correo+encumbra@example.com", token: "a&b" }),
    );

    assert.equal(
      url.origin + url.pathname,
      "https://climatologia.meteochile.gob.cl/application/servicios/getDatosRecientesRedEma",
    );
    assert.equal(url.searchParams.get("usuario"), "correo+encumbra@example.com");
    assert.equal(url.searchParams.get("token"), "a&b");
  });

  test("sin credenciales no consulta ni inventa observaciones", async () => {
    let llamadas = 0;
    const resultado = await cargarObservacionesDmc(
      async () => {
        llamadas += 1;
        return new Response("{}");
      },
      null,
      () => undefined,
    );

    assert.equal(llamadas, 0);
    assert.equal(resultado, null);
  });

  test("un fallo se reporta y conserva la caché anterior", async () => {
    const errores: unknown[] = [];
    const resultado = await cargarObservacionesDmc(
      async () => new Response("no disponible", { status: 503 }),
      { usuario: "correo@example.com", token: "secreto" },
      (error) => errores.push(error),
    );

    assert.equal(resultado, null);
    assert.equal(errores.length, 1);
  });
});
