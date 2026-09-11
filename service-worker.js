
const CACHE = "chess-tutor-bb3609057f6bff53";
const ASSETS = ["./asset-manifest.json","./favicon.ico","./index.html","./logo192.png","./logo512.png","./manifest.json","./robots.txt","./static/css/main.96b40cbd.css","./static/js/123.d79d2eb7.chunk.js","./static/js/314.c1f16077.chunk.js","./static/js/314.c1f16077.chunk.js.LICENSE.txt","./static/js/453.c3edd9d2.chunk.js","./static/js/main.e729c038.js","./static/js/main.e729c038.js.LICENSE.txt"];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('chess-tutor-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    if (event.request.mode === 'navigate') return cache.match('./index.html');
    return (await cache.match(event.request)) || fetch(event.request);
  }));
});
