import assert from "node:assert/strict";
import { test } from "node:test";
import { componerEscena, leerTiempo } from "../lib/escena.ts";

const amanecer = "2026-09-06T07:00:00-03:00";
const puesta = "2026-09-06T19:00:00-03:00";
const enPunto = (hora: string) => new Date(`2026-09-06T${hora}-03:00`);

test("la luz sigue el amanecer y la puesta reales", () => {
  assert.equal(
    componerEscena({ ahora: enPunto("07:30:00"), amanecer, puesta, banda: "ideal" }).momento,
    "amanecer",
  );
  assert.equal(
    componerEscena({ ahora: enPunto("13:00:00"), amanecer, puesta, banda: "ideal" }).momento,
    "dia",
  );
  assert.equal(
    componerEscena({ ahora: enPunto("18:40:00"), amanecer, puesta, banda: "ideal" }).momento,
    "atardecer",
  );
  assert.equal(
    componerEscena({ ahora: enPunto("22:00:00"), amanecer, puesta, banda: "ideal" }).momento,
    "noche",
  );
});

test("el sol sube hasta el mediodía y se apaga de noche", () => {
  const manana = componerEscena({ ahora: enPunto("08:00:00"), amanecer, puesta, banda: "ideal" });
  const mediodia = componerEscena({ ahora: enPunto("13:00:00"), amanecer, puesta, banda: "ideal" });
  assert.ok(mediodia.altoSol > manana.altoSol);
  assert.ok(mediodia.altoSol > 0.95);
  assert.equal(
    componerEscena({ ahora: enPunto("23:00:00"), amanecer, puesta, banda: "ideal" }).altoSol,
    0,
  );
});

test("el volantín sube con el viento que sirve y cae con el que no", () => {
  const alto = (banda: "plancha" | "liviano" | "ideal" | "bravo" | "peligro") =>
    componerEscena({ ahora: enPunto("13:00:00"), amanecer, puesta, banda }).altoVolantin;
  assert.ok(alto("ideal") > alto("bravo"), "el ideal vuela más alto que el bravo");
  assert.ok(alto("bravo") > alto("liviano"));
  assert.ok(alto("liviano") > alto("plancha"));
  assert.ok(alto("plancha") < 0.1, "sin viento queda en el suelo");
});

test("de noche nadie encumbra, aunque el viento sea perfecto", () => {
  const nocturna = componerEscena({ ahora: enPunto("23:00:00"), amanecer, puesta, banda: "ideal" });
  assert.equal(nocturna.vuela, false);
  assert.ok(nocturna.altoVolantin < 0.1);
});

test("las nubes salen de la nubosidad, con la probabilidad de respaldo", () => {
  const base = { ahora: enPunto("13:00:00"), amanecer, puesta, banda: "ideal" as const };
  assert.equal(componerEscena({ ...base, nubosidad: 0 }).nubes, 0);
  assert.equal(componerEscena({ ...base, nubosidad: 90 }).nubes, 0.9);
  // Sin nubosidad medida, la probabilidad de lluvia sirve de aproximación.
  assert.ok(componerEscena({ ...base, probabilidadPrecipitacion: 80 }).nubes > 0.7);
  assert.equal(componerEscena({ ...base, probabilidadPrecipitacion: 0 }).nubes, 0);
});

test("sin horarios de sol no se inventa la noche", () => {
  const sinDatos = componerEscena({ ahora: enPunto("13:00:00"), banda: "ideal" });
  assert.equal(sinDatos.momento, "dia");
});

test("el estado del cielo sale del código WMO y cae a la nubosidad", () => {
  assert.equal(leerTiempo(0, null), "despejado");
  assert.equal(leerTiempo(2, null), "nubes");
  assert.equal(leerTiempo(3, null), "cubierto");
  assert.equal(leerTiempo(61, null), "lluvia");
  assert.equal(leerTiempo(95, null), "tormenta");
  // Sin código, la nubosidad decide.
  assert.equal(leerTiempo(null, 5), "despejado");
  assert.equal(leerTiempo(null, 50), "nubes");
  assert.equal(leerTiempo(null, 95), "cubierto");
  assert.equal(leerTiempo(null, null), "despejado");
});

test("llueve solo cuando el cielo lo dice, no cuando podría", () => {
  const base = { ahora: enPunto("13:00:00"), amanecer, puesta, banda: "ideal" as const };
  assert.equal(componerEscena({ ...base, codigoTiempo: 61 }).lluvia, true);
  assert.equal(componerEscena({ ...base, codigoTiempo: 95 }).tiempo, "tormenta");
  assert.equal(
    componerEscena({ ...base, codigoTiempo: 0, probabilidadPrecipitacion: 80 }).lluvia,
    false,
    "una probabilidad alta con cielo despejado no es lluvia",
  );
});
