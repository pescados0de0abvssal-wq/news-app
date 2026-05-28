const CACHE_NAME = 'newsreader-v1';

// オフライン時に返すアセットをキャッシュ
const PRECACHE_ASSETS = [
  '/news-app/',
  '/news-app/index.html',
  '/news-app/style.css',
  '/news-app/app.js',
  '/news-app/icon.svg',
  '/news-app/manifest.json',
];

// インストール時にアセットをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// フェッチ: Network first、失敗時はキャッシュ返却
self.addEventListener('fetch', event => {
  // APIリクエストはキャッシュしない
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功したレスポンスをキャッシュ更新
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
