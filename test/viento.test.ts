import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  cardinal,
  fraseDireccion,
  guiaDespegue,
  rumboDispositivo,
  suavizarRumbo,
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
    assert.equal(
      rumboDispositivo({
        alpha: null,
        absolute: false,
        webkitCompassHeading: 275,
        webkitCompassAccuracy: 10,
      }),
      275,
    );
  });

  test("rechaza la brújula de Safari cuando Apple la marca sin calibrar", () => {
    assert.equal(
      rumboDispositivo({
        alpha: null,
        absolute: false,
        webkitCompassHeading: 275,
        webkitCompassAccuracy: -1,
      }),
      null,
    );
    assert.equal(
      rumboDispositivo({
        alpha: null,
        absolute: false,
        webkitCompassHeading: -1,
      }),
      null,
    );
  });

  test("convierte la orientación absoluta estándar en rumbo de brújula", () => {
    assert.equal(rumboDispositivo({ alpha: 90, absolute: true }), 270);
    assert.equal(
      rumboDispositivo({ alpha: 90, absolute: false }, true),
      270,
    );
  });

  test("corrige el rumbo respecto de la parte superior visible en paisaje", () => {
    assert.equal(
      rumboDispositivo(
        {
          alpha: null,
          absolute: false,
          webkitCompassHeading: 90,
          webkitCompassAccuracy: 10,
        },
        false,
        270,
      ),
      0,
    );
    assert.equal(
      rumboDispositivo({ alpha: 270, absolute: true }, true, 270),
      0,
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

  test("guía al piloto para mirar a favor del viento", () => {
    assert.deepEqual(guiaDespegue(270, 0), {
      estado: "gira-derecha",
      diferencia: 90,
      instruccion: "Gira hacia tu derecha",
    });
    assert.deepEqual(guiaDespegue(270, 180), {
      estado: "gira-izquierda",
      diferencia: -90,
      instruccion: "Gira hacia tu izquierda",
    });
  });

  test("confirma cuando el teléfono apunta hacia el lugar del volantín", () => {
    assert.deepEqual(guiaDespegue(270, 82), {
      estado: "alineado",
      diferencia: 8,
      instruccion: "Listo: el volantín va frente a ti",
    });
    assert.equal(guiaDespegue(null, 82), null);
  });

  test("suaviza el rumbo sin dar una vuelta completa al cruzar el norte", () => {
    assert.equal(suavizarRumbo(null, 90), 90);
    assert.equal(suavizarRumbo(359, 1), 359.5);
    assert.equal(suavizarRumbo(1, 359), 0.5);
  });
});
