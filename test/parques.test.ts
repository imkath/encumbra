import assert from "node:assert/strict";
import { test } from "node:test";
import {
  distanciaKm,
  ordenarParques,
  buscarParques,
  PARQUES,
} from "../lib/parques.ts";

test("catálogo completo con coordenadas para cada parque", () => {
  assert.equal(PARQUES.length, 17);
  assert.equal(new Set(PARQUES.map((p) => p.id)).size, 17);
  assert.ok(
    PARQUES.every((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon)),
  );
});
test("distancia cero y búsqueda sin acentos por comuna", () => {
  assert.equal(distanciaKm({ lat: -33, lon: -70 }, { lat: -33, lon: -70 }), 0);
  assert.ok(
    buscarParques(PARQUES, "penalolen").some((p) => p.nombre === "Peñalolén"),
  );
  assert.ok(buscarParques(PARQUES, "vitacura").length);
});
test("recomienda entre cinco cercanos, sin privilegiar un ideal lejano", () => {
  const items = Array.from({ length: 6 }, (_, i) => ({
    id: String(i),
    distancia: i + 1,
    banda:
      i === 5
        ? ("ideal" as const)
        : i === 2
          ? ("liviano" as const)
          : ("plancha" as const),
  }));
  assert.equal(ordenarParques(items, "adecuado")[0]?.id, "2");
  assert.equal(ordenarParques(items, "cerca")[0]?.id, "0");
  assert.equal(ordenarParques(items, "adecuado").length, 6);
});
test("misma banda ordena por distancia, nunca inventa diferencias de viento", () => {
  const items = [
    { id: "a", distancia: 8, banda: "ideal" as const },
    { id: "b", distancia: 1, banda: "ideal" as const },
  ];
  assert.equal(ordenarParques(items, "adecuado")[0]?.id, "b");
});
