import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  cardinal,
  fraseDireccion,
  rumboDispositivo,
  trayectoriaViento,
} from "../lib/viento.ts";

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

  test("separa de dónde viene el viento y hacia dónde va", () => {
    assert.deepEqual(trayectoriaViento(270, 0), {
      origen: "O",
      destino: "E",
      vieneDe: "Viene del poniente",
      vaHacia: "Va hacia el oriente",
      anguloOrigen: 270,
      anguloDestino: 90,
    });
  });

  test("orienta la trayectoria respecto de la parte superior del teléfono", () => {
    assert.deepEqual(trayectoriaViento(270, 180), {
      origen: "O",
      destino: "E",
      vieneDe: "Viene del poniente",
      vaHacia: "Va hacia el oriente",
      anguloOrigen: 90,
      anguloDestino: 270,
    });
    assert.equal(trayectoriaViento(null, 180), null);
  });

  test("prefiere el norte magnético que informa Safari", () => {
    assert.equal(
      rumboDispositivo({
        alpha: 90,
        absolute: false,
        webkitCompassHeading: 275,
      }),
      275,
    );
  });

  test("convierte la orientación absoluta estándar en rumbo de brújula", () => {
    assert.equal(rumboDispositivo({ alpha: 90, absolute: true }), 270);
    assert.equal(
      rumboDispositivo({ alpha: 90, absolute: false }, true),
      270,
    );
  });

  test("descarta lecturas relativas o inválidas", () => {
    assert.equal(rumboDispositivo({ alpha: 90, absolute: false }), null);
    assert.equal(rumboDispositivo({ alpha: null, absolute: true }), null);
    assert.equal(
      rumboDispositivo({
        alpha: Number.NaN,
        absolute: true,
        webkitCompassHeading: Number.NaN,
      }),
      null,
    );
  });
});
