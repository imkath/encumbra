import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  nombreCortoEstacionDmc,
  normalizarObservacionesDmc,
  observacionMasCercana,
} from "../lib/dmc.ts";

const payload = {
  organismo: "Dirección Meteorológica de Chile",
  timezone: "UTC",
  status: "Información recuperada",
  datosEstaciones: [
    {
      estacion: {
        codigoNacional: "330020",
        nombreEstacion: "Quinta Normal, Santiago",
        latitud: "-33.44500",
        longitud: "-70.68278",
        status: "Estación con datos disponibles recientemente",
      },
      datos: [
        {
          momento: "2026-09-20 18:50:00",
          direccionDelVientoPromedio10Minutos: "260 °",
          fuerzaDelVientoPromedio10Minutos: "8.0 kt",
          fuerzaDelViento10MinutosMax: "12.0 kt",
        },
        {
          momento: "2026-09-20 19:00:00",
          direccionDelVientoPromedio10Minutos: "270 °",
          fuerzaDelVientoPromedio10Minutos: "10.0 kt",
          fuerzaDelViento10MinutosMax: "15.0 kt",
        },
      ],
    },
    {
      estacion: {
        codigoNacional: "330019",
        nombreEstacion: "Eulogio Sánchez, Tobalaba Ad.",
        latitud: "-33.45528",
        longitud: "-70.54861",
        status: "Estación con datos disponibles recientemente",
      },
      datos: [
        {
          momento: "2026-09-20 19:04:00",
          direccionDelVientoPromedio2Minutos: "245 °",
          fuerzaDelVientoPromedio2Minutos: "7.0 kt",
          fuerzaDelViento02MinutosMax: "11.0 kt",
        },
      ],
    },
    {
      estacion: {
        codigoNacional: "180005",
        nombreEstacion: "Chacalluta, Arica Ap.",
        latitud: "-18.35555",
        longitud: "-70.34028",
      },
      datos: [
        {
          momento: "2026-09-20 19:05:00",
          direccionDelVientoPromedio10Minutos: "250 °",
          fuerzaDelVientoPromedio10Minutos: "20.0 kt",
          fuerzaDelViento10MinutosMax: "25.0 kt",
        },
      ],
    },
  ],
};

describe("observaciones DMC", () => {
  test("normaliza la última medición válida de Santiago y convierte nudos", () => {
    const observaciones = normalizarObservacionesDmc(payload);

    assert.deepEqual(observaciones, [
      {
        fuente: "DMC",
        codigoEstacion: "330020",
        nombreEstacion: "Quinta Normal, Santiago",
        lat: -33.445,
        lon: -70.68278,
        observadoEn: "2026-09-20T19:00:00.000Z",
        viento: 18.5,
        racha: 27.8,
        direccion: 270,
      },
      {
        fuente: "DMC",
        codigoEstacion: "330019",
        nombreEstacion: "Eulogio Sánchez, Tobalaba Ad.",
        lat: -33.45528,
        lon: -70.54861,
        observadoEn: "2026-09-20T19:04:00.000Z",
        viento: 13,
        racha: 20.4,
        direccion: 245,
      },
    ]);
  });

  test("rechaza respuestas bloqueadas en vez de publicarlas como datos", () => {
    assert.throws(
      () =>
        normalizarObservacionesDmc({
          momento: "2026-09-20 19:05:00",
          mensaje: "Este servicio ha sido bloqueado",
        }),
      /DMC/i,
    );
  });

  test("acepta la respuesta liviana de una sola estación", () => {
    const individual = {
      ...payload,
      datosEstaciones: payload.datosEstaciones[0],
    };

    assert.deepEqual(
      normalizarObservacionesDmc(individual),
      normalizarObservacionesDmc(payload).slice(0, 1),
    );
  });

  test("elige solo una estación cercana con medición fresca", () => {
    const observaciones = normalizarObservacionesDmc(payload);
    const cercana = observacionMasCercana(
      observaciones,
      { lat: -33.402778, lon: -70.575556 },
      new Date("2026-09-20T19:12:00.000Z"),
    );

    assert.equal(cercana?.observacion.codigoEstacion, "330019");
    assert.ok(cercana && cercana.distanciaKm > 6 && cercana.distanciaKm < 7);

    assert.equal(
      observacionMasCercana(
        observaciones,
        { lat: -33.402778, lon: -70.575556 },
        new Date("2026-09-20T19:25:00.001Z"),
      ),
      null,
    );
  });

  test("usa nombres breves y reconocibles en terreno", () => {
    assert.equal(nombreCortoEstacionDmc("330019"), "Tobalaba");
    assert.equal(nombreCortoEstacionDmc("330020"), "Quinta Normal");
    assert.equal(nombreCortoEstacionDmc("330021"), "Pudahuel");
  });
});
