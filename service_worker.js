/**
 * 5Bpage Service Worker (5B Byte Engine)
 * Offline Shell Cache (No 404 External Image Failures)
 */
const CACHE_NAME = '5bpage-v5.0.0';

const PRECACHE_RESOURCES = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './images/icon/favicon-32x32.png',
  './images/icon/icon-main.png',
  './js/soundCtrl.js',
  './js/hero.js',
  './js/slide.js',
  './js/puzzle.js',
  './js/menu.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[5B Byte SW] Caching offline shell...');
      const promises = PRECACHE_RESOURCES.map(resource =>
        fetch(resource).then(res => {
          if (res.ok) return cache.put(resource, res);
          console.warn('[SW] Pre-cache skipped:', resource);
        }).catch(err => console.warn('[SW] Fetch failed:', resource, err))
      );
      await Promise.allSettled(promises);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[5B Byte SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(networkRes => {
        if (!networkRes || networkRes.status !== 200 || networkRes.type !== 'basic') {
          return networkRes;
        }
        const clone = networkRes.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return networkRes;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
