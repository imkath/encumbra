import assert from "node:assert/strict";
import { test } from "node:test";
import { brida, hilo, parametroCatenaria, volantinEnEquilibrio } from "../lib/fisica.ts";

const MANO = { x: 200, y: 600 };
const LARGO = 460;

test("un hilo más corto que la distancia queda recto", () => {
  assert.equal(parametroCatenaria(300, 200, 100), null);
  assert.equal(parametroCatenaria(300, 200, 360), null, "360 < √(300²+200²)");
  assert.ok(parametroCatenaria(300, 200, 500) !== null, "sobra cuerda: se comba");
});

test("más cuerda sobrante da más comba", () => {
  const poco = parametroCatenaria(300, 100, 330)!;
  const mucho = parametroCatenaria(300, 100, 500)!;
  // El parámetro a es grande cuando la curva es tensa y chico cuando cuelga.
  assert.ok(poco > mucho, "la cuerda tensa tiene a mayor");
});

test("la catenaria empieza en el volantín y termina en la mano", () => {
  const vol = { x: 40, y: 200 };
  const d = hilo(MANO, vol, LARGO);
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  assert.equal(nums[0], vol.x);
  assert.equal(nums[1], vol.y);
  assert.ok(Math.abs(nums.at(-2)! - MANO.x) < 1.5, "llega a la mano en x");
  assert.ok(Math.abs(nums.at(-1)! - MANO.y) < 1.5, "llega a la mano en y");
});

test("el hilo cuelga por debajo de la recta cuando hay poca tensión", () => {
  const vol = { x: 40, y: 300 };
  const d = hilo(MANO, vol, 700);
  const ys = d.match(/[ML] -?\d+(\.\d+)? (-?\d+(\.\d+)?)/g)!.map((p) => Number(p.split(" ")[2]));
  const mitad = ys[Math.floor(ys.length / 2)]!;
  const rectaEnMitad = (vol.y + MANO.y) / 2;
  assert.ok(mitad > rectaEnMitad, "el punto medio cae bajo la cuerda tensa");
});

test("el volantín sube con el viento que sirve y se va atrás con el bravo", () => {
  const y = (b: Parameters<typeof volantinEnEquilibrio>[0]) =>
    volantinEnEquilibrio(b, MANO, LARGO).posicion.y;
  assert.ok(y("ideal") < y("liviano"), "el ideal vuela más alto");
  assert.ok(y("liviano") < y("plancha"), "sin viento se queda abajo");
  assert.ok(y("bravo") > y("ideal"), "el viento bravo lo empuja hacia abajo");
});

test("sin viento la cuerda queda floja y con viento se tensa", () => {
  assert.ok(volantinEnEquilibrio("plancha", MANO, LARGO).tension < 0.1);
  assert.ok(volantinEnEquilibrio("ideal", MANO, LARGO).tension > 0.8);
});

test("sin banda se comporta como sin viento", () => {
  const sin = volantinEnEquilibrio(null, MANO, LARGO);
  const plancha = volantinEnEquilibrio("plancha", MANO, LARGO);
  assert.deepEqual(sin.posicion, plancha.posicion);
});

test("la brida cuelga bajo el volantín y gira con él", () => {
  const centro = { x: 100, y: 100 };
  // Sin inclinación, el nudo queda justo debajo del centro.
  const recto = brida(centro, 0, 16);
  assert.ok(Math.abs(recto.x - 100) < 0.01);
  assert.equal(Math.round(recto.y), 116);
  // Inclinado 90°, el nudo se va al costado: acompaña al volantín.
  const tumbado = brida(centro, 90, 16);
  assert.equal(Math.round(tumbado.x), 84);
  assert.ok(Math.abs(tumbado.y - 100) < 0.01);
});

test("el hilo termina en la brida, no en el centro del volantín", () => {
  const centro = { x: 40, y: 200 };
  const inclinacion = 30;
  const nudo = brida(centro, inclinacion);
  const d = hilo(MANO, nudo, LARGO);
  const inicio = d.match(/M (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/)!;
  assert.ok(Math.abs(Number(inicio[1]) - nudo.x) < 0.2, "arranca en el nudo x");
  assert.ok(Math.abs(Number(inicio[2]) - nudo.y) < 0.2, "arranca en el nudo y");
  // Y ese nudo no es el centro: si lo fuera, el cordel se vería suelto.
  assert.ok(Math.hypot(nudo.x - centro.x, nudo.y - centro.y) > 10);
});
