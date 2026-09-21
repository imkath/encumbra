import assert from "node:assert/strict";
import { test } from "node:test";
import {
  distanciaKm,
  ordenarParques,
  buscarParques,
  PARQUES,
  parquesProponibles,
  contarRecintos,
} from "../lib/parques.ts";

test("catálogo completo con coordenadas para cada parque", () => {
  assert.equal(PARQUES.length, 24);
  assert.equal(new Set(PARQUES.map((p) => p.id)).size, 24);
  assert.ok(
    PARQUES.every((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon)),
  );
  assert.ok(PARQUES.every((p) => p.tipoLugar === "parque"));
  assert.ok(PARQUES.every((p) => p.precision === "recinto"));
});
test("solo propone parques con autorización respaldada", () => {
  const proponibles = parquesProponibles(PARQUES);

  assert.equal(proponibles.length, 20);
  assert.equal(contarRecintos(proponibles), 15);
  assert.ok(proponibles.every((parque) => parque.permiso === "autorizado"));
  assert.ok(
    proponibles
      .filter(({ id }) => id !== "parque-bicentenario")
      .every(
        (parque) =>
          parque.evidenciaPermiso?.autoridad === "Parquemet" &&
          parque.evidenciaPermiso.fuente?.startsWith("https://") === true &&
          parque.evidenciaPermiso.verificadoEn === "2026-09-20" &&
          parque.evidenciaPermiso.vigencia === "pendiente-de-confirmar",
      ),
  );
  const bicentenario = proponibles.find(
    ({ id }) => id === "parque-bicentenario",
  );
  assert.ok(bicentenario?.evidenciaPermiso);
  assert.equal(
    bicentenario.evidenciaPermiso.autoridad,
    "Administración Parque Bicentenario de Vitacura",
  );
  assert.equal(bicentenario.evidenciaPermiso.fuente, null);
  assert.equal(bicentenario.evidenciaPermiso.verificadoEn, "2026-09-21");
  assert.equal(
    bicentenario.evidenciaPermiso.vigencia,
    "confirmado-directamente",
  );
  assert.ok(!proponibles.some((parque) => parque.nombre === "San Cristóbal"));
  assert.ok(proponibles.some((parque) => parque.nombre === "Pierre Dubois"));
  assert.equal(
    proponibles.filter((parque) => parque.recintoId === "parque-mapocho-rio")
      .length,
    6,
  );
  assert.ok(
    buscarParques(PARQUES, "san cristobal").some(
      (parque) => parque.permiso === "sin-confirmar",
    ),
  );
});

test("la etiqueta visible atribuye Parquemet solo a su propio listado", () => {
  const etiqueta = (id: string) => {
    const parque = PARQUES.find((item) => item.id === id);
    assert.ok(parque);
    return "etiquetaPermiso" in parque ? parque.etiquetaPermiso : null;
  };

  assert.equal(etiqueta("parque-penalolen"), "Listado de Parquemet");
  assert.equal(
    etiqueta("parque-bicentenario"),
    "Confirmado por su administración",
  );
  assert.equal(etiqueta("parque-araucano"), "Permiso no confirmado");
});

test("el riesgo vial conserva fuente, fecha y alcance", () => {
  const bandera = PARQUES.find((parque) => parque.id === "parque-la-bandera");
  assert.ok(bandera && "riesgoVial" in bandera);
  assert.equal(bandera.riesgoVial.autoridad, "Gobierno de Chile / MOP");
  assert.equal(bandera.riesgoVial.publicadoEn, "2024-09-08");
  assert.match(bandera.riesgoVial.fuente, /^https:\/\/www\.gob\.cl\//);
});
test("distancia cero y búsqueda sin acentos por comuna", () => {
  assert.equal(distanciaKm({ lat: -33, lon: -70 }, { lat: -33, lon: -70 }), 0);
  assert.ok(
    buscarParques(PARQUES, "penalolen").some((p) => p.nombre === "Peñalolén"),
  );
  assert.ok(buscarParques(PARQUES, "vitacura").length);
  assert.ok(
    buscarParques(PARQUES, "bicentenario cerrillos").some(
      (parque) => parque.id === "parque-cerrillos",
    ),
  );
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
