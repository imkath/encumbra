import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire, Module } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Build-time only: these two components have no runtime local dependencies.
const require = createRequire(import.meta.url);
function loadComponent(relativePath) {
  const filename = resolve(relativePath);
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const compiledModule = new Module(filename);
  compiledModule.filename = filename;
  compiledModule.paths = require.resolve.paths("react");
  compiledModule._compile(compiled, filename);
  return compiledModule.exports;
}
const { Marca } = loadComponent("components/Marca.tsx");
const { VolantinPapel } = loadComponent("components/VolantinPapel.tsx");
const file = "public/sistema-diseno.html";
let html = readFileSync(file, "utf8");
const brand = renderToStaticMarkup(React.createElement(Marca));
const inside = brand.slice(brand.indexOf(">") + 1, brand.lastIndexOf("</span>"));
html = html.replace(/<!--brand:start-->[\s\S]*?<!--brand:end-->/g,
  `<!--brand:start-->${inside}<!--brand:end-->`);
html = html.replace(/(<article class="state" data-paleta="([^"]+)">[\s\S]*?)(<svg[\s\S]*?<\/svg>)/g, (_, prefix, state) => {
  let svg = renderToStaticMarkup(React.createElement(VolantinPapel, {
    banda: state === "sin-datos" ? null : state === "noche" ? "ideal" : state,
    deNoche: state === "noche",
  }));
  // Separate render roots otherwise reuse useId values in the saved document.
  const ids = [...svg.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  for (const id of [...new Set(ids)].sort((a, b) => b.length - a.length)) {
    svg = svg.replaceAll(`"${id}"`, `"${state}-${id}"`).replaceAll(`#${id})`, `#${state}-${id})`);
  }
  return prefix + svg;
});
writeFileSync(file, html);
console.log("Design guide synchronized from Marca and VolantinPapel.");
