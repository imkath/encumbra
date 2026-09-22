const ORIGIN = "https://encumbra.nvrkth.com";
const KEY = "ddeaa7962f9ca9b9fea969355d3937e4";
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;

const sitemapResponse = await fetch(`${ORIGIN}/sitemap.xml`, {
  headers: { "user-agent": "Encumbra release script" },
  signal: AbortSignal.timeout(10_000),
});

if (!sitemapResponse.ok) {
  throw new Error(`No se pudo leer el sitemap publicado (${sitemapResponse.status})`);
}

const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(https:\/\/encumbra\.nvrkth\.com[^<]+)<\/loc>/g)]
  .map((match) => match[1]);

if (urls.length === 0) {
  throw new Error("El sitemap publicado no contiene URLs de Encumbra");
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: "encumbra.nvrkth.com",
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  }),
  signal: AbortSignal.timeout(10_000),
});

if (!response.ok) {
  throw new Error(`IndexNow rechazó la publicación (${response.status})`);
}

console.log(`IndexNow recibió ${urls.length} URLs (${response.status}).`);
