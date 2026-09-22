import assert from "node:assert/strict";
import { test } from "node:test";

import { DATOS_ESTRUCTURADOS, serializarJsonLd } from "../lib/seo.ts";

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
