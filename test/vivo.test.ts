import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { Pronostico } from "../lib/openmeteo.ts";
import {
  crearCalendario,
  estadoLuz,
  estadoVentana,
  leerPronosticoGuardado,
  serializarPronostico,
  tendencia60,
  zonaMasCercana,
} from "../lib/vivo.ts";

const horas = [
  {
    fecha: "2026-09-01T15:00:00-04:00",
    viento: 13.6,
    racha: 20, direccion: null, nubosidad: null, codigoTiempo: null,
    probabilidadPrecipitacion: 0,
    banda: "ideal" as const,
  },
  {
    fecha: "2026-09-01T16:00:00-04:00",
    viento: 14.4,
    racha: 21, direccion: null, nubosidad: null, codigoTiempo: null,
    probabilidadPrecipitacion: 0,
    banda: "ideal" as const,
  },
  {
    fecha: "2026-09-01T17:00:00-04:00",
    viento: 12,
    racha: 18, direccion: null, nubosidad: null, codigoTiempo: null,
    probabilidadPrecipitacion: 0,
    banda: "liviano" as const,
  },
];

const pronostico: Pronostico = {
  estado: "actual",
  actualizadoEn: "2026-09-01T19:05:00.000Z",
  zonas: [
    {
      id: "centro",
      nombre: "Centro",
      celda: { lat: -33.45, lon: -70.66 },
      puestaSol: ["2026-09-01T18:23:00-04:00"],
      horas,
      ventanas: [
        {
          inicio: "2026-09-01T15:00:00-04:00",
          fin: "2026-09-01T21:00:00.000Z",
          banda: "ideal",
          vientoMedio: 14,
          rachaMax: 21,
          brecha: 7,
        },
      ],
    },
  ],
};

describe("modo volar", () => {
  test("la tendencia usa el siguiente dato horario y el valor visible", () => {
    assert.equal(
      tendencia60(horas, new Date("2026-09-01T15:20:00-04:00")),
      "parejo",
    );
    assert.equal(
      tendencia60(horas, new Date("2026-09-01T16:20:00-04:00")),
      "baja",
    );
  });

  test("cuenta lo que queda de una ventana activa y anticipa la próxima", () => {
    const ventanas = pronostico.zonas[0]?.ventanas ?? [];

    assert.deepEqual(
      estadoVentana(ventanas, new Date("2026-09-01T16:35:00-04:00")),
      { tipo: "activa", texto: "te quedan 25 min" },
    );
    assert.deepEqual(
      estadoVentana(ventanas, new Date("2026-09-01T14:35:00-04:00")),
      { tipo: "proxima", texto: "en 25 min anda" },
    );
  });

  test("la luz informa la puesta del día incluso después de terminar", () => {
    assert.deepEqual(
      estadoLuz(
        ["2026-09-01T18:23:00-04:00"],
        new Date("2026-09-01T16:00:00-04:00"),
      ),
      { tipo: "vigente", fecha: "2026-09-01T18:23:00-04:00" },
    );
    assert.deepEqual(
      estadoLuz(
        ["2026-09-01T18:23:00-04:00"],
        new Date("2026-09-01T19:00:00-04:00"),
      ),
      { tipo: "terminada", fecha: "2026-09-01T18:23:00-04:00" },
    );
  });

  test("genera un calendario interoperable para la ventana ideal", () => {
    const zona = pronostico.zonas[0];
    assert.ok(zona);
    const contenido = crearCalendario(
      zona.ventanas[0]!,
      zona.nombre,
      new Date("2026-09-01T19:10:00.000Z"),
    );

    assert.match(contenido, /^BEGIN:VCALENDAR\r\nVERSION:2.0\r\n/);
    assert.match(contenido, /DTSTART:20260901T190000Z\r\n/);
    assert.match(contenido, /DTEND:20260901T210000Z\r\n/);
    assert.match(contenido, /SUMMARY:Encumbrar volantín\r\n/);
    assert.match(contenido, /LOCATION:Centro\r\n/);
    assert.match(contenido, /END:VCALENDAR\r\n$/);
  });

  test("versiona y valida el pronóstico completo guardado", () => {
    const guardado = serializarPronostico(pronostico);

    assert.deepEqual(leerPronosticoGuardado(guardado), pronostico);
    assert.equal(leerPronosticoGuardado("{\"version\":2}"), null);
    assert.equal(leerPronosticoGuardado("texto roto"), null);
  });

  test("elige la celda de pronóstico más cercana sin inventar polígonos", () => {
    const zonas = [
      { id: "poniente", lat: -33.43, lon: -70.75 },
      { id: "oriente", lat: -33.46, lon: -70.55 },
    ];

    assert.equal(
      zonaMasCercana({ lat: -33.455, lon: -70.56 }, zonas)?.id,
      "oriente",
    );
    assert.equal(zonaMasCercana({ lat: 0, lon: 0 }, []), null);
  });
});
