import assert from "node:assert/strict";
import { describe, test } from "node:test";

import type { HoraPronostico, ZonaPronostico } from "../lib/openmeteo.ts";
import * as planear from "../lib/planear.ts";
import {
  adaptarHorasAlPerfil,
  fraseBrecha,
  horaVigente,
  proximasDoceHoras,
} from "../lib/planear.ts";

const hora = (
  fecha: string,
  viento: number,
  racha: number,
): HoraPronostico => ({
  fecha,
  viento,
  racha,
  direccion: null, nubosidad: null, codigoTiempo: null,
  probabilidadPrecipitacion: null,
  banda: "plancha",
});

describe("modo planear", () => {
  const horas = Array.from({ length: 16 }, (_, indice) =>
    hora(
      `2026-08-31T${String(indice + 8).padStart(2, "0")}:00:00-04:00`,
      14,
      18,
    ),
  );

  test("elige la hora que contiene el instante actual", () => {
    assert.equal(
      horaVigente(horas, new Date("2026-08-31T14:35:00-04:00"))?.fecha,
      "2026-08-31T14:00:00-04:00",
    );
  });

  test("si no hay hora activa usa la próxima y al final conserva la última", () => {
    assert.equal(
      horaVigente(horas, new Date("2026-08-31T05:00:00-04:00"))?.fecha,
      "2026-08-31T08:00:00-04:00",
    );
    assert.equal(
      horaVigente(horas, new Date("2026-09-01T10:00:00-04:00"))?.fecha,
      "2026-08-31T23:00:00-04:00",
    );
  });

  test("entrega doce horas desde la hora vigente", () => {
    const resultado = proximasDoceHoras(
      horas,
      new Date("2026-08-31T10:15:00-04:00"),
    );

    assert.equal(resultado.length, 12);
    assert.equal(resultado[0]?.fecha, "2026-08-31T10:00:00-04:00");
    assert.equal(resultado.at(-1)?.fecha, "2026-08-31T21:00:00-04:00");
  });

  test("recalcula las bandas para cada perfil sin tocar el score", () => {
    const [liviano] = adaptarHorasAlPerfil(
      [hora("2026-08-31T14:00:00-04:00", 20, 30)],
      "liviano",
    );
    const [acrobatico] = adaptarHorasAlPerfil(
      [hora("2026-08-31T14:00:00-04:00", 20, 30)],
      "acrobatico",
    );

    assert.equal(liviano?.banda, "bravo");
    assert.equal(acrobatico?.banda, "ideal");
    assert.equal("score" in (acrobatico ?? {}), false);
  });

  test("traduce la brecha solo con umbrales ya calibrados", () => {
    assert.equal(
      fraseBrecha(hora("2026-08-31T14:00:00-04:00", 14, 15), "estandar"),
      "parejo, el volantín se queda quieto arriba",
    );
    assert.equal(
      fraseBrecha(hora("2026-08-31T14:00:00-04:00", 8, 18), "estandar"),
      "tirones, anda con cola",
    );
    assert.equal(
      fraseBrecha(hora("2026-08-31T14:00:00-04:00", 12, 40), "estandar"),
      "viento rachado, se te va a cortar",
    );
  });

  test("encuentra otras zonas donde sí anda ahora sin comparar parques", () => {
    const crearZona = (
      id: string,
      viento: number,
      racha: number,
    ): ZonaPronostico => ({
      id,
      nombre: id,
      celda: { lat: -33.45, lon: -70.65 },
      puestaSol: [],
      horas: [hora("2026-08-31T14:00:00-04:00", viento, racha)],
      ventanas: [],
    });
    const zonas = [
      crearZona("actual", 14, 18),
      crearZona("estandar", 14, 18),
      crearZona("acrobatico", 20, 30),
      crearZona("sin-viento", 3, 8),
    ];
    const ahora = new Date("2026-08-31T14:35:00-04:00");
    const zonasDondeAnda = (
      planear as typeof planear & {
        zonasDondeAnda?: (
          zonas: readonly ZonaPronostico[],
          zonaActualId: string,
          ahora: Date,
          perfil: "estandar" | "acrobatico",
        ) => ZonaPronostico[];
      }
    ).zonasDondeAnda;

    assert.ok(zonasDondeAnda, "falta implementar zonasDondeAnda");
    assert.deepEqual(
      zonasDondeAnda(zonas, "actual", ahora, "estandar").map(({ id }) => id),
      ["estandar"],
    );
    assert.deepEqual(
      zonasDondeAnda(zonas, "actual", ahora, "acrobatico").map(({ id }) => id),
      ["estandar", "acrobatico"],
    );
  });

  test("adapta también las ventanas de una zona al tipo de volantín", () => {
    const zona: ZonaPronostico = {
      id: "prueba",
      nombre: "Prueba",
      celda: { lat: -33.45, lon: -70.65 },
      puestaSol: [],
      horas: [
        hora("2026-08-31T14:00:00-04:00", 20, 30),
        hora("2026-08-31T15:00:00-04:00", 20, 30),
      ],
      ventanas: [],
    };
    const adaptarZonaAlPerfil = (
      planear as typeof planear & {
        adaptarZonaAlPerfil?: (
          zona: ZonaPronostico,
          perfil: "estandar" | "acrobatico",
        ) => ZonaPronostico;
      }
    ).adaptarZonaAlPerfil;

    assert.ok(adaptarZonaAlPerfil, "falta implementar adaptarZonaAlPerfil");
    const estandar = adaptarZonaAlPerfil(zona, "estandar");
    const acrobatico = adaptarZonaAlPerfil(zona, "acrobatico");

    assert.equal(estandar.horas[0]?.banda, "bravo");
    assert.equal(estandar.ventanas.length, 0);
    assert.equal(acrobatico.horas[0]?.banda, "ideal");
    assert.equal(acrobatico.ventanas.length, 1);
    assert.equal(zona.horas[0]?.banda, "plancha");
  });
});

test("no recomienda encumbrar cuando falta viento", () => {
  assert.equal(
    fraseBrecha({ viento: 5, racha: 9 }, "estandar"),
    "falta viento para sostenerlo arriba",
  );
});
