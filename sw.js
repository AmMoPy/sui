const CACHE_NAME = 'simple-ui-v1';
const ASSETS = [
  '/',
  '/index.html',
  'css/styles.css',
  'css/fonts.css',
  'js/app.js',
  'js/hammer.min.js',
  'assets/fonts/Chango-Regular.woff2',
  'assets/main/better_day.mp3',
  'assets/main/care.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});