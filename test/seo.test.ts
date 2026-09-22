import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DATOS_ESTRUCTURADOS,
  GUIAS,
  datosEstructuradosGuia,
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
