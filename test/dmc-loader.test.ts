import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  cargarObservacionesDmc,
  crearUrlDmc,
} from "../server/dmc.ts";

describe("cliente DMC del servidor", () => {
  test("codifica las credenciales solo en la URL del servidor", () => {
    const url = new URL(
      crearUrlDmc("330020", {
        usuario: "correo+encumbra@example.com",
        token: "a&b",
      }),
    );

    assert.equal(
      url.origin + url.pathname,
      "https://climatologia.meteochile.gob.cl/application/servicios/getDatosRecientesEma/330020",
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
    assert.equal(errores.length, 3);
  });

  test("un error de red nunca expone credenciales en los registros", async () => {
    const errores: unknown[] = [];
    const token = "token-que-no-debe-aparecer";
    await cargarObservacionesDmc(
      async (entrada) => {
        throw new Error(`falló ${entrada}`);
      },
      { usuario: "correo+privado@example.com", token },
      (error) => errores.push(error),
    );

    const registro = errores.map(String).join("\n");
    assert.doesNotMatch(registro, /correo\+privado/);
    assert.doesNotMatch(registro, new RegExp(token));
    assert.match(registro, /DMC/);
  });

  test("consulta solo las tres estaciones de Santiago y conserva éxitos parciales", async () => {
    const solicitadas: string[] = [];
    const resultado = await cargarObservacionesDmc(
      async (entrada) => {
        const codigo = new URL(entrada).pathname.split("/").at(-1) ?? "";
        solicitadas.push(codigo);
        if (codigo === "330021") {
          return new Response("no disponible", { status: 503 });
        }
        return new Response(
          JSON.stringify({
            timezone: "UTC",
            datosEstaciones: {
              estacion: {
                codigoNacional: codigo,
                nombreEstacion: `Estación ${codigo}`,
                latitud: "-33.45",
                longitud: "-70.60",
              },
              datos: [
                {
                  momento: "2026-09-20 19:00:00",
                  direccionDelVientoPromedio10Minutos: "270 °",
                  fuerzaDelVientoPromedio10Minutos: "10.0 kt",
                  fuerzaDelViento10MinutosMax: "15.0 kt",
                },
              ],
            },
          }),
        );
      },
      { usuario: "correo@example.com", token: "secreto" },
      () => undefined,
    );

    assert.deepEqual(solicitadas.sort(), ["330019", "330020", "330021"]);
    assert.deepEqual(
      resultado?.map(({ codigoEstacion }) => codigoEstacion).sort(),
      ["330019", "330020"],
    );
  });
});
