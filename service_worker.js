const CACHE_NAME = '5bpage-core-v2';

// 상대 경로로 등록하여 저장소 서브디렉터리(/5Bpage/)에 자동 적응
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/soundCtrl.js',
  './js/hero.js',
  './js/slide.js',
  './js/puzzle.js',
  './js/menu.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Caching application shell...');
      // 404 에셋이 있어도 전체 캐싱이 롤백되지 않도록 개별 캐싱
      const promises = PRECACHE_ASSETS.map((asset) =>
        fetch(asset).then((response) => {
          if (response.ok) return cache.put(asset, response);
          console.warn(`[SW] Pre-cache skipped (404/Error): ${asset}`);
        }).catch((err) => console.warn(`[SW] Fetch failed for: ${asset}`, err))
      );
      await Promise.allSettled(promises);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
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
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
        return response;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
