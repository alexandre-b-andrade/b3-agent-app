// Service Worker — B3 Agent PWA
// Cache somente o app shell (HTML/JS/CSS). Dados são sempre buscados ao vivo.
const CACHE = "b3agent-v11";
const SHELL = ["./", "./index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Requisições de API (GitHub, Anthropic) sempre vão para a rede
  const url = e.request.url;
  if (url.includes("api.github.com") || url.includes("api.anthropic.com") ||
      url.includes("raw.githubusercontent.com")) {
    return; // deixa o browser tratar normalmente
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
