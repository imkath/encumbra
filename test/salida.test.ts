import assert from "node:assert/strict";
import { test } from "node:test";
import { lecturasParques, elegirParqueInicial } from "../lib/salida.ts";
import type { Pronostico } from "../lib/openmeteo.ts";

const ahora = new Date("2026-09-05T16:15:00-04:00");
const pronostico: Pronostico = {
  estado: "actual",
  actualizadoEn: ahora.toISOString(),
  zonas: [
    {
      id: "araucano-san-cristobal",
      nombre: "Araucano · San Cristóbal",
      celda: { lat: -33.4, lon: -70.6 },
      puestaSol: ["2026-09-05T19:00:00-04:00"],
      ventanas: [],
      horas: [
        {
          fecha: "2026-09-05T16:00:00-04:00",
          viento: 14,
          racha: 15, direccion: null, nubosidad: null, codigoTiempo: null,
          probabilidadPrecipitacion: null,
          banda: "ideal",
        },
      ],
    },
  ],
};
test("parques sin datos siguen disponibles sin inventar clima", () => {
  const items = lecturasParques(
    { estado: "sin-datos", actualizadoEn: null, zonas: [] },
    "estandar",
    ahora,
    null,
  );
  assert.equal(items.length, 24);
  assert.ok(items.every((p) => p.hora === null && p.distancia === null));
});
test("lectura comparte zona, adapta perfil y calcula distancia al parque", () => {
  const items = lecturasParques(pronostico, "estandar", ahora, {
    lat: -33.402778,
    lon: -70.575556,
  });
  const araucano = items.find((p) => p.nombre === "Araucano");
  assert.equal(araucano?.distancia, 0);
  assert.equal(araucano?.hora?.banda, "ideal");
  assert.equal(araucano?.hora?.probabilidadPrecipitacion, null);
  assert.equal(items.find((p) => p.nombre === "Peñalolén")?.hora, null);
});
test("selección respeta parque explícito, zona y fallback válido", () => {
  assert.equal(
    elegirParqueInicial("parque-penalolen", "araucano-san-cristobal").id,
    "parque-penalolen",
  );
  assert.equal(
    elegirParqueInicial("invalido", "penalolen").id,
    "parque-penalolen",
  );
  assert.equal(elegirParqueInicial(undefined, undefined).permiso, "autorizado");
});

test("no ofrece tramo de madrugada como ventana de salida", () => {
  const zonas = pronostico.zonas.map((z) => ({
    ...z,
    salidaSol: ["2026-09-05T07:00:00-04:00"],
    horas: [
      {
        fecha: "2026-09-05T01:00:00-04:00",
        viento: 14,
        racha: 15, direccion: null, nubosidad: null, codigoTiempo: null,
        probabilidadPrecipitacion: 0,
        banda: "ideal" as const,
      },
    ],
  }));
  const lectura = lecturasParques(
    { ...pronostico, zonas },
    "estandar",
    new Date("2026-09-05T00:00:00-04:00"),
    null,
  )[0];
  assert.equal(lectura?.ventanaDiurna, null);
});
test("recorta la ventana de viento al periodo con luz confirmado", () => {
  const zonas = pronostico.zonas.map((z) => ({
    ...z,
    salidaSol: ["2026-09-05T07:00:00-04:00"],
    puestaSol: ["2026-09-05T16:30:00-04:00"],
  }));
  const lectura = lecturasParques(
    { ...pronostico, zonas },
    "estandar",
    ahora,
    null,
  )[0];
  assert.equal(lectura?.ventanaDiurna?.fin, "2026-09-05T20:30:00.000Z");
});
test("sin amanecer confirmado no recomienda ni agenda una ventana diurna", () => {
  const lectura = lecturasParques(pronostico, "estandar", ahora, null)[0];
  assert.equal(lectura?.ventanaDiurna, null);
});

test("hoy y mañana respetan Santiago durante el cambio de hora y de año", async () => {
  const { diaDeSalida } = await import("../lib/salida.ts");
  assert.equal(diaDeSalida(new Date("2026-09-05T23:30:00-04:00"), 0), "2026-09-05");
  assert.equal(diaDeSalida(new Date("2026-09-05T23:30:00-04:00"), 1), "2026-09-06");
  assert.equal(diaDeSalida(new Date("2026-12-31T23:30:00-03:00"), 1), "2027-01-01");
});

test("el día elegido limita horas, ventana y puesta de sol sin reutilizar datos de otro día", () => {
  const zona = pronostico.zonas[0]!;
  const datos: Pronostico = { ...pronostico, zonas: [{ ...zona,
    salidaSol: ["2026-09-05T07:00:00-04:00", "2026-09-06T08:00:00-03:00"],
    puestaSol: ["2026-09-05T19:00:00-04:00", "2026-09-06T20:00:00-03:00"],
    horas: [5, 6].flatMap((dia) => [16, 17].map((hora) => ({ ...zona.horas[0]!, fecha: `2026-09-0${dia}T${hora}:00:00-0${dia === 5 ? 4 : 3}:00` }))),
  }] };
  const manana = lecturasParques(datos, "estandar", ahora, null, "2026-09-06")[0]!;
  assert.equal(manana.horas.length, 2);
  assert.ok(manana.horas.every((h) => h.fecha.startsWith("2026-09-06")));
  assert.ok(manana.ventanaDiurna?.inicio.startsWith("2026-09-06"));
  assert.equal(manana.luz.fecha, "2026-09-06T20:00:00-03:00");
  const vacio = lecturasParques(datos, "estandar", ahora, null, "2026-09-07")[0]!;
  assert.equal(vacio.horas.length, 0);
  assert.equal(vacio.ventanaDiurna, null);
  assert.equal(vacio.luz.fecha, null);
});
