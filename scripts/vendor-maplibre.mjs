// MapLibre 6 locates its worker with import.meta.url and requires an http(s) URL.
// Next's bundlers rewrite that, so getWorkerUrl() returns "" and `new Worker("")`
// asks for the site root, which the browser rejects as text/html. Serving the worker
// from public/ and pointing setWorkerUrl() at it is the supported escape hatch.
// Copying on every dev/build keeps these in sync with the installed version.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// maplibre-gl exposes no "exports" main, so resolve through its package.json.
const raiz = dirname(createRequire(import.meta.url).resolve("maplibre-gl/package.json"));
const dist = join(raiz, "dist");
const destino = join(process.cwd(), "public/vendor/maplibre");
mkdirSync(destino, { recursive: true });
// The worker imports ./maplibre-gl-shared.mjs, so both must sit side by side.
for (const archivo of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(dist, archivo), join(destino, archivo));
}
