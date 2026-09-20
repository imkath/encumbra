import assert from "node:assert/strict";
import { describe, test } from "node:test";

import fixture from "./fixtures/openmeteo.json" with { type: "json" };
import {
  crearCargadorPronostico,
  crearPronostico,
  crearUrlOpenMeteo,
} from "../lib/openmeteo.ts";
import { ZONAS } from "../lib/zonas.ts";

describe("Open-Meteo", () => {
  test("construye una sola consulta para las seis celdas de ICON", () => {
    const url = new URL(crearUrlOpenMeteo());

    assert.equal(
      url.origin + url.pathname,
      "https://api.open-meteo.com/v1/forecast",
    );
    assert.deepEqual(
      url.searchParams.get("latitude")?.split(",").map(Number),
      ZONAS.map(({ lat }) => lat),
    );
    assert.deepEqual(
      url.searchParams.get("longitude")?.split(",").map(Number),
      ZONAS.map(({ lon }) => lon),
    );
    assert.equal(
      url.searchParams.get("hourly"),
      "wind_speed_10m,wind_gusts_10m,wind_direction_10m,cloud_cover,weather_code,precipitation_probability",
    );
    assert.equal(url.searchParams.has("daily"), false);
    assert.equal(url.searchParams.get("forecast_days"), "2");
    assert.equal(url.searchParams.get("timezone"), "America/Santiago");
    assert.equal(url.searchParams.get("models"), "icon_seamless");
    assert.equal(url.toString().includes("gfs"), false);
  });

  test("normaliza el payload real en seis zonas con bandas y ventanas", () => {
    const resultado = crearPronostico(fixture, "2026-08-31T12:00:00.000Z");

    assert.equal(resultado.estado, "actual");
    assert.equal(resultado.actualizadoEn, "2026-08-31T12:00:00.000Z");
    assert.equal(resultado.zonas.length, 6);

    for (const [indice, zona] of resultado.zonas.entries()) {
      const origen = fixture[indice];
      const esperada = ZONAS[indice];

      assert.ok(origen);
      assert.ok(esperada);
      assert.equal(zona.id, esperada.id);
      assert.equal(zona.nombre, esperada.nombre);
      assert.deepEqual(zona.celda, {
        lat: origen.latitude,
        lon: origen.longitude,
      });
      assert.equal(zona.horas.length, 48);
      assert.equal(zona.horas[0]?.fecha, "2026-08-31T00:00:00-04:00");
      assert.match(zona.salidaSol?.[0] ?? "", /^2026-08-31T07:\d{2}:00-04:00$/);
      assert.match(zona.puestaSol[0] ?? "", /^2026-08-31T18:\d{2}:00-04:00$/);
      assert.ok(
        zona.horas.every(({ banda }) =>
          ["plancha", "liviano", "ideal", "bravo", "peligro"].includes(banda),
        ),
      );
      assert.ok(zona.horas.every((hora) => !("score" in hora)));
      assert.ok(Array.isArray(zona.ventanas));
    }
  });

  test("el fixture ICON conserva rachas físicamente consistentes", () => {
    for (const zona of fixture) {
      for (const [indice, viento] of zona.hourly.wind_speed_10m.entries()) {
        const racha = zona.hourly.wind_gusts_10m[indice];

        assert.equal(
          typeof racha === "number" && racha >= viento,
          true,
          `hora ${indice}: racha ${racha} < viento ${viento}`,
        );
      }
    }
  });

  test("rechaza respuestas incompletas o con unidades inesperadas", () => {
    assert.throws(
      () => crearPronostico(fixture.slice(0, 5), "2026-08-31T12:00:00.000Z"),
      /seis zonas/i,
    );

    const unidadesInvalidas = structuredClone(fixture);
    const primera = unidadesInvalidas[0];
    assert.ok(primera);
    primera.hourly_units.wind_speed_10m = "mph";

    assert.throws(
      () => crearPronostico(unidadesInvalidas, "2026-08-31T12:00:00.000Z"),
      /unidades/i,
    );
  });

  test("hace una petición, la transforma y conserva el último éxito", async () => {
    let llamadas = 0;
    const errores: unknown[] = [];
    let urlSolicitada = "";
    let opcionesSolicitadas: RequestInit & {
      readonly next: { readonly revalidate: number };
    } = { next: { revalidate: 0 } };
    const cargar = crearCargadorPronostico(
      async (url, opciones) => {
        llamadas += 1;
        urlSolicitada = url;
        opcionesSolicitadas = opciones;

        if (llamadas === 1) {
          return new Response(JSON.stringify(fixture));
        }

        throw new Error("red caída");
      },
      () => "2026-08-31T12:00:00.000Z",
      (error) => errores.push(error),
    );

    const actual = await cargar();
    const degradado = await cargar();

    assert.equal(llamadas, 2);
    assert.equal(urlSolicitada, crearUrlOpenMeteo());
    assert.deepEqual(opcionesSolicitadas, { next: { revalidate: 600 } });
    assert.equal(actual.estado, "actual");
    assert.equal(degradado.estado, "desactualizado");
    assert.equal(degradado.actualizadoEn, actual.actualizadoEn);
    assert.deepEqual(degradado.zonas, actual.zonas);
    assert.equal(errores.length, 1);
  });

  test("un primer fallo se degrada a sin datos y nunca lanza a la UI", async () => {
    const cargar = crearCargadorPronostico(
      async () => new Response("falló", { status: 503 }),
      () => "2026-08-31T12:00:00.000Z",
      () => undefined,
    );

    assert.deepEqual(await cargar(), {
      estado: "sin-datos",
      actualizadoEn: null,
      zonas: [],
    });
  });
});

test("calcula amanecer y puesta aunque el proveedor omita daily", () => {
  const payload = fixture.map((zona) => {
    const copia: Record<string, unknown> = { ...zona };
    delete copia.daily;
    return copia;
  });
  const resultado = crearPronostico(payload, "2026-08-31T12:00:00.000Z");
  assert.equal(resultado.zonas[0]?.salidaSol?.length, 2);
  assert.equal(resultado.zonas[0]?.puestaSol.length, 2);
});

 test("acepta rachas de la hora anterior inferiores al viento puntual sin perder zonas", async () => {
  const payload = structuredClone(fixture);
  payload[3]!.hourly.wind_speed_10m[2] = 2.6;
  payload[3]!.hourly.wind_gusts_10m[2] = 2.2;
  const errores: unknown[] = [];
  const cargar = crearCargadorPronostico(
    async () => new Response(JSON.stringify(payload)),
    () => "2026-09-05T12:00:00Z",
    (error) => errores.push(error),
  );
  const resultado = await cargar();
  assert.equal(resultado.estado, "actual");
  assert.equal(resultado.zonas.length, 6);
  assert.equal(resultado.zonas[3]?.horas[2]?.viento, 2.6);
  assert.equal(resultado.zonas[3]?.horas[2]?.racha, 2.2);
  assert.deepEqual(errores, []);
});

test("rechaza velocidades negativas aunque las series tengan unidades correctas", () => {
  for (const campo of ["wind_speed_10m", "wind_gusts_10m"] as const) {
    const payload = structuredClone(fixture);
    payload[0]!.hourly[campo][0] = -1;
    assert.throws(() => crearPronostico(payload, "2026-09-05T12:00:00Z"), /negativas/);
  }
});
