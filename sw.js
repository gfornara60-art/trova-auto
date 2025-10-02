// sw.js — Service Worker semplice cache-first
const CACHE = "trova-auto-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  // aggiungi qui eventuali altri file statici (icone, css esterni, ecc.)
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Solo GET
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        // Metti in cache le risorse della stessa origine
        const url = new URL(req.url);
        if (url.origin === location.origin) {
          const resClone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
