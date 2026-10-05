import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  DATOS_ESTRUCTURADOS,
  GUIAS,
  LUGARES,
  datosEstructuradosGuia,
  datosEstructuradosLugar,
  descripcionLugar,
  tituloLugar,
  serializarJsonLd,
} from "../lib/seo.ts";

test("los datos estructurados describen el sitio y la aplicación sin inventar reseñas", () => {
  assert.equal(DATOS_ESTRUCTURADOS["@context"], "https://schema.org");
  assert.equal(DATOS_ESTRUCTURADOS["@graph"].length, 2);
  assert.deepEqual(
    DATOS_ESTRUCTURADOS["@graph"].map((item) => item["@type"]),
    ["WebSite", "WebApplication"],
  );
  assert.ok(
    DATOS_ESTRUCTURADOS["@graph"].every(
      (item) => !("aggregateRating" in item) && !("review" in item),
    ),
  );
});

test("la serialización JSON-LD neutraliza cierres de script", () => {
  assert.equal(
    serializarJsonLd({ texto: "</script><script>alert(1)</script>" }),
    '{"texto":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}',
  );
});

test("el catálogo editorial cubre intenciones distintas con metadatos únicos", () => {
  assert.deepEqual(
    GUIAS.map(({ slug }) => slug),
    [
      "viento-para-volantines",
      "donde-encumbrar-volantines-santiago",
      "seguridad-al-encumbrar-volantines",
    ],
  );
  assert.equal(new Set(GUIAS.map(({ title }) => title)).size, GUIAS.length);
  assert.equal(
    new Set(GUIAS.map(({ description }) => description)).size,
    GUIAS.length,
  );
  assert.ok(GUIAS.every(({ description }) => description.length <= 160));
});

test("cada guía declara Article y breadcrumbs que coinciden con su URL", () => {
  for (const guia of GUIAS) {
    const datos = datosEstructuradosGuia(guia);
    assert.deepEqual(
      datos["@graph"].map((item) => item["@type"]),
      ["Article", "BreadcrumbList"],
    );
    assert.equal(datos["@graph"][0].url, `https://encumbra.nvrkth.com/guia/${guia.slug}`);
    assert.equal(datos["@graph"][0].headline, guia.title);
    assert.equal(datos["@graph"][0].dateModified, guia.reviewedAt);
    assert.ok(!JSON.stringify(datos).includes("aggregateRating"));
  }
});

test("Cloudflare conserva la extensión de los archivos HTML de verificación", () => {
  const configuracion = JSON.parse(
    readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")
      .replace(/^\s*\/\/.*$/gm, ""),
  );

  assert.equal(configuracion.assets.html_handling, "none");
});

test("cada recinto tiene una sola página, con slug, título y descripción únicos", () => {
  const recintos = new Set(LUGARES.flatMap(({ puntos }) => puntos.map((p) => p.recintoId)));
  assert.equal(LUGARES.length, recintos.size);
  assert.equal(new Set(LUGARES.map(({ slug }) => slug)).size, LUGARES.length);
  assert.equal(new Set(LUGARES.map(tituloLugar)).size, LUGARES.length);
  assert.ok(LUGARES.every((lugar) => descripcionLugar(lugar).length <= 160));
  assert.ok(LUGARES.every(({ slug }) => /^[a-z0-9-]+$/.test(slug)));
  const mapocho = LUGARES.find(({ slug }) => slug === "mapocho-rio");
  assert.equal(mapocho?.puntos.length, 6);
  assert.equal(mapocho?.nombre, "Parque Mapocho Río");
});

test("un lugar sin permiso confirmado no se describe como autorizado", () => {
  const sinPermiso = LUGARES.filter(({ base }) => base.permiso !== "autorizado");
  assert.ok(sinPermiso.length > 0);
  for (const lugar of sinPermiso) {
    assert.match(descripcionLugar(lugar), /no ha confirmado/);
  }
});

test("los datos estructurados de un parque ubican el lugar y su miga", () => {
  for (const lugar of LUGARES) {
    const datos = datosEstructuradosLugar(lugar);
    assert.deepEqual(
      datos["@graph"].map((item) => item["@type"]),
      ["WebPage", lugar.slug === "cerro-san-cristobal" ? "Mountain" : "Park", "BreadcrumbList"],
    );
    assert.equal(datos["@graph"][0].url, `https://encumbra.nvrkth.com/parques/${lugar.slug}`);
    assert.equal(datos["@graph"][1].geo.latitude, lugar.base.lat);
  }
});
