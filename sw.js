importScripts("vClassic.js"); // As long as both files are in the same directory, the relative path will work correctly

const { LIB_V, FFMPEG_BASE, FFMPEG_V, FFMPEG_C_V, MEDIAINFO_BASE, MEDIAINFO_V } = AppVersions;
console.log(LIB_V, FFMPEG_BASE, FFMPEG_V, FFMPEG_C_V, MEDIAINFO_BASE, MEDIAINFO_V);
const CACHE_NAME = `SUI-${LIB_V}`; // Increment version when ASSETS change at each deployment
const ASSETS = [
  // Core files
  `/index.html`,
  // CSS
  `css/style.min.css`,
  `css/fonts.css`,
  // JavaScript (including dependencies)
  `/vClassic.js`,
  `/versions.js`,
  `js/vgp.js`,
  `${FFMPEG_BASE}/814.ffmpeg.js?v=${FFMPEG_V}`,
  `${FFMPEG_BASE}/ffmpeg.min.js?v=${FFMPEG_V}`,
  `${FFMPEG_BASE}/ffmpeg-core.js?v=${FFMPEG_C_V}`,
  `${FFMPEG_BASE}/ffmpeg-core.wasm?v=${FFMPEG_C_V}`,
  `${MEDIAINFO_BASE}/mediainfo.js?v=${MEDIAINFO_V}`,
  `${MEDIAINFO_BASE}/MediaInfoModule.wasm?v=${MEDIAINFO_V}`,
  `js/particles/particles.min.js`,
  `js/particles/prtx.js`,
  `js/app.min.js`,
  `js/constants.min.js`,
  `js/database.min.js`,
  `js/elements.min.js`,
  `js/events.min.js`,
  `js/hammer.min.js`,
  `js/playback.min.js`,
  `js/playlist.min.js`,
  `js/sorting.min.js`,
  `js/state.min.js`,
  `js/ui.min.js`,
  // Assets
  `assets/fonts/Chango/Chango-Regular.woff2`,
  `assets/icons/arrow.png`,
  `assets/icons/dlm/sun.png`,
  `assets/icons/dlm/moon.png`,
  `assets/main/better_day.mp3`,
  `assets/main/care.mp3`
];

// ==============================================
// Service Worker Lifecycle Events
// ==============================================

// Install: Cache critical assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.error('Cache addAll failed:', err))
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    )
  );
});

// Fetch: Serve cached assets or fetch with network-first fallback
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      // Always serve cached assets first
      if (cachedResponse) return cachedResponse;

      // Fetch from network and cache
      return fetch(e.request).then(networkResponse => {
        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
        return networkResponse;
      }).catch(() => {
        // Keep users within the app
        // Fallback to index.html for ALL navigation failures
        // Since its an SPA users never truly "navigate" to new pages
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html'); // Serve the app shell
        }
        // For non-HTML (e.g., audio), return empty response
        return new Response(null, { status: 408 });
      });
    })
  );
});