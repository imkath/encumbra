import assert from "node:assert/strict";
import { test } from "node:test";

import {
  crearCsp,
  limitarConsultaUbicacion,
} from "../lib/http.ts";

test("la CSP usa nonce y permite solo los recursos que necesita la aplicación", () => {
  const csp = crearCsp("nonce-de-prueba", false);

  assert.match(csp, /script-src 'self' 'nonce-nonce-de-prueba' 'strict-dynamic'/);
  assert.match(csp, /connect-src 'self' https:\/\/tiles\.openfreemap\.org/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.doesNotMatch(csp, /unsafe-eval/);
});

test("la CSP permite eval solo durante el desarrollo", () => {
  assert.match(crearCsp("nonce", true), /'unsafe-eval'/);
});

test("el límite de ubicación responde 429 sin cachear ni filtrar identidad", async () => {
  let clave = "";
  const respuesta = await limitarConsultaUbicacion(
    new Request("https://encumbra.test/api/ubicacion?lat=-33.49&lon=-70.6", {
      headers: { "cf-connecting-ip": "203.0.113.10" },
    }),
    {
      async limit(entrada) {
        clave = entrada.key;
        return { success: false };
      },
    },
  );

  assert.equal(clave, "ubicacion:203.0.113.10");
  assert.equal(respuesta?.status, 429);
  assert.equal(respuesta?.headers.get("cache-control"), "private, no-store");
  assert.equal(respuesta?.headers.get("retry-after"), "60");
  assert.deepEqual(await respuesta?.json(), {
    error: "Demasiadas consultas de ubicación. Reintenta en un minuto.",
  });
});

test("el límite deja continuar una consulta permitida", async () => {
  const respuesta = await limitarConsultaUbicacion(
    new Request("https://encumbra.test/api/ubicacion"),
    { async limit() { return { success: true }; } },
  );

  assert.equal(respuesta, null);
});
