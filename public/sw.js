/**
 * Service worker de Encumbra.
 *
 * La app ya guarda el último pronóstico en localStorage y escucha "offline"
 * para mostrar "sin señal · último dato de las…". Lo que le faltaba era llegar
 * a ejecutarse: sin service worker, abrir /volar sin señal muestra el error del
 * navegador y ese respaldo nunca corre. Esto cachea el HTML ya renderizado de
 * la última visita para que la pantalla de terreno abra en el parque.
 *
 * No se cachean las teselas del mapa (son de otro origen y pesan de más para
 * meterlas al cache de la app). Sin señal el mapa queda en blanco; la lista de
 * parques y el veredicto, que es lo que se mira en el pasto, siguen ahí.
 */
const VERSION = "v1";
const SHELL = `encumbra-shell-${VERSION}`;
const DATOS = `encumbra-datos-${VERSION}`;

// Rutas que valen la pena tener antes de que se corte la señal.
const SEMILLA = ["/app", "/volar"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SEMILLA))
      // Una semilla que falla no debe dejar el worker sin instalar.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres
            .filter((nombre) => nombre !== SHELL && nombre !== DATOS)
            .map((viejo) => caches.delete(viejo)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Guarda una copia sin bloquear la respuesta que ya va camino a la página. */
function guardar(nombre, peticion, respuesta) {
  if (!respuesta || !respuesta.ok || respuesta.type === "opaque") return respuesta;
  const copia = respuesta.clone();
  caches.open(nombre).then((cache) => cache.put(peticion, copia));
  return respuesta;
}

/** Red primero, cache como respaldo. Para lo que cambia: HTML y pronóstico. */
async function redPrimero(peticion, nombre, respaldo) {
  try {
    return guardar(nombre, peticion, await fetch(peticion));
  } catch {
    const guardada = await caches.match(peticion);
    if (guardada) return guardada;
    if (respaldo) {
      const alternativa = await caches.match(respaldo);
      if (alternativa) return alternativa;
    }
    throw new Error("sin red y sin copia");
  }
}

/** Cache primero y refresco en segundo plano. Para lo que casi nunca cambia. */
async function cachePrimero(peticion, nombre) {
  const guardada = await caches.match(peticion);
  if (guardada) {
    fetch(peticion)
      .then((respuesta) => guardar(nombre, peticion, respuesta))
      .catch(() => undefined);
    return guardada;
  }
  return guardar(nombre, peticion, await fetch(peticion));
}

const ESTATICOS = ["/_next/static/", "/icons/", "/textures/", "/vendor/", "/maps/"];

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  const url = new URL(request.url);

  // Solo lecturas de este origen. El .ics de /api/calendario es una descarga:
  // cachearlo serviría un archivo viejo con horarios que ya pasaron.
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/calendario")) return;

  if (ESTATICOS.some((prefijo) => url.pathname.startsWith(prefijo))) {
    evento.respondWith(cachePrimero(request, SHELL));
    return;
  }

  if (url.pathname === "/api/pronostico") {
    evento.respondWith(redPrimero(request, DATOS));
    return;
  }

  if (request.mode === "navigate") {
    evento.respondWith(redPrimero(request, SHELL, "/volar"));
  }
});
