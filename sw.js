/* Çevrimdışı çalışma: uygulama dosyalarını önbelleğe alır.
   Dosyalarda değişiklik yaptığınızda VERSION değerini artırın. */
const VERSION = 'v19';
const CACHE = 'makale-atolyesi-' + VERSION;
const FILES = [
  './', './index.html', './styles.css', './rules.js', './examples.js', './app.js', './fisler.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('makale-atolyesi-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Önce ağ (güncel sürüm), ağ yoksa önbellek
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }) // tarayıcı önbelleğindeki eski dosya yerine sunucuya sorar
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
