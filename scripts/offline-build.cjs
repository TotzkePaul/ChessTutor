const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../build');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(root).filter(file => !file.endsWith('.map') && !file.endsWith('service-worker.js'));
const version = crypto.createHash('sha256');
files.forEach(file => version.update(fs.readFileSync(file)));
const cache = `chess-tutor-${version.digest('hex').slice(0, 16)}`;
const urls = files.map(file => './' + path.relative(root, file).split(path.sep).join('/'));
fs.writeFileSync(path.join(root, 'service-worker.js'), `
const CACHE = ${JSON.stringify(cache)};
const ASSETS = ${JSON.stringify(urls)};
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
`);
console.log(`Offline cache prepared: ${urls.length} local assets, including the AI worker.`);
