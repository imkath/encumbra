import assert from "node:assert/strict";
import { test } from "node:test";
import { trazarCielo } from "../lib/cielo.ts";

const horas = [
  { fecha: "2026-09-06T12:00:00-03:00", viento: 0 },
  { fecha: "2026-09-06T13:00:00-03:00", viento: 15 },
  { fecha: "2026-09-06T14:00:00-03:00", viento: 30 },
];

test("más viento dibuja más alto", () => {
  const { puntos } = trazarCielo(horas);
  assert.ok(puntos[0]!.y > puntos[1]!.y, "0 km/h queda al fondo");
  assert.ok(puntos[1]!.y > puntos[2]!.y, "30 km/h queda arriba");
  assert.equal(puntos[2]!.y, 0, "el techo toca el borde superior");
});

test("las horas se reparten de borde a borde", () => {
  const { puntos, ancho } = trazarCielo(horas);
  assert.equal(puntos[0]!.x, 0);
  assert.equal(puntos.at(-1)!.x, ancho);
});

test("la franja que vuela abarca el tramo ideal y nada más", () => {
  const { vuela, alto } = trazarCielo(horas);
  assert.ok(vuela.arriba < vuela.abajo, "arriba es menor en coordenadas SVG");
  assert.ok(vuela.abajo < alto, "no empieza en el suelo: 0 km/h no vuela");
  assert.ok(vuela.arriba > 0, "no llega al techo: el ventarrón no vuela");
});

test("marca la hora vigente y aguanta datos pobres", () => {
  assert.equal(
    trazarCielo(horas, "2026-09-06T13:00:00-03:00")!.ahora!.viento,
    15,
  );
  assert.equal(trazarCielo([]).puntos.length, 0);
  assert.equal(trazarCielo([]).cresta, "");
  assert.equal(trazarCielo([horas[0]!]).puntos.length, 1);
});
