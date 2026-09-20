import assert from "node:assert/strict";
import { test } from "node:test";

import { ZONAS } from "../lib/zonas.ts";

test("las seis zonas reproducen las celdas verificadas de icon_seamless", () => {
  assert.equal(ZONAS.length, 6);
  assert.deepEqual(
    ZONAS.map(({ lat, lon, parques }) => ({
      lat,
      lon,
      parques: parques.map(({ nombre }) => nombre),
    })),
    [
      {
        lat: -33.4107,
        lon: -70.6214,
        parques: [
          "Araucano",
          "San Cristóbal",
          "Bicentenario",
          "Parque de la Familia",
          "Mahuidahue",
        ],
      },
      { lat: -33.4261, lon: -70.7545, parques: ["La Hondonada"] },
      {
        lat: -33.4937,
        lon: -70.6502,
        parques: [
          "O'Higgins",
          "Quinta Normal",
          "Parque Brasil",
          "La Castrina",
          "André Jarlán",
          "La Bandera",
        ],
      },
      {
        lat: -33.4809,
        lon: -70.6981,
        parques: ["Bernardo Leighton", "Parque Bicentenario Cerrillos"],
      },
      { lat: -33.4648, lon: -70.5472, parques: ["Peñalolén"] },
      {
        lat: -33.5728,
        lon: -70.6329,
        parques: ["Mapuhue", "La Platina"],
      },
    ],
  );
});

test("los nombres de zona usan parques y no cardinales", () => {
  const cardinales = new Set([
    "centro",
    "poniente",
    "oriente",
    "sur",
    "sur poniente",
    "sur oriente",
  ]);

  for (const zona of ZONAS) {
    assert.ok(!cardinales.has(zona.nombre.toLocaleLowerCase("es-CL")));
    assert.ok(
      zona.parques.some(({ nombre }) => zona.nombre.includes(nombre)),
      zona.nombre,
    );
  }
});

test("los metadatos no documentados quedan marcados como pendientes", () => {
  for (const zona of ZONAS) {
    for (const parque of zona.parques) {
      assert.equal(parque.comuna, null);
      assert.equal(parque.tamano, null);
    }
  }
});
