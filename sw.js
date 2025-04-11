importScripts("vClassic.js"); // As long as both files are in the same directory, the relative path will work correctly

const { LIB_V, FFMPEG_BASE, FFMPEG_V, FFMPEG_C_V } = AppVersions;
// console.log(LIB_V, FFMPEG_BASE, FFMPEG_V, FFMPEG_C_V);
const CACHE_NAME = `SUI-${LIB_V}`; // Increment version when ASSETS change at each deployment
// Long TTL headers minimize (304 Not Modified) checks
// Critical updates can be pushed within the cash period by
// Manipulating file names and SW version (LIB_V) triggering fresh Install
const CACHE_TTL = 86400 * 90; // Quarterly checks 3 months in seconds
const ASSETS = [
  // Core files
  `index.html`,
  // CSS
  `css/style.min.css`,
  `css/fonts.css`,
  // JavaScript (including dependencies)
  `vClassic.js`,
  `versions.js`,
  `js/particles/particles.min.js`,
  `js/particles/prtx.js`,
  `js/app.min.js`,
  `js/constants.min.js`,
  `js/database.min.js`,
  `js/elements.min.js`,
  `js/events.min.js`,
  `js/gc.min.js`,
  `js/hammer.min.js`,
  `js/playback.min.js`,
  `js/playlist.min.js`,
  `js/sorting.min.js`,
  `js/state.min.js`,
  `js/ui.min.js`,
  `js/vgp.js`,
  // FFmpeg
  `${FFMPEG_BASE}/814.ffmpeg.js`,
  `${FFMPEG_BASE}/ffmpeg.min.js?v=${FFMPEG_V}`,
  `${FFMPEG_BASE}/ffmpeg-core.js?v=${FFMPEG_C_V}`,
  `${FFMPEG_BASE}/ffmpeg-core.wasm?v=${FFMPEG_C_V}`,
  // Static Assets
  `assets/fonts/Chango/Chango-Regular.woff2`,
  `assets/icons/arrow.png`,
  `assets/icons/dlm/sun.png`,
  `assets/icons/dlm/moon.png`,
  `assets/main/better_day.mp3`,
  `assets/main/care.mp3`
];

// ==============================================
// Utility Functions
// ==============================================
function createCacheBustRequest(url) {
  return new Request(url, {
    headers: new Headers({
      'Cache-Control': `max-age=${CACHE_TTL}`
    })
  });
}

// ==============================================
// Service Worker Lifecycle Events
// ==============================================
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = [];
    
    for (const asset of ASSETS) {
      try {
        const request = createCacheBustRequest(asset);
        const response = await fetch(request);
        
        if (response.status === 206) {
          console.warn(`Partial response for ${asset}, retrying...`);
          response = await fetch(request.url, { headers: { 'Range': 'bytes=0-' } });
          // throw new Error('Partial response not allowed');
        }
        
        if (response.ok) { // Only valid, non-opaque responses are cached
          await cache.put(asset, response.clone());
          results.push({ asset, status: 'cached' });
        } else {
          results.push({ asset, status: 'failed', reason: `HTTP ${response.status}` });
        }
      } catch (err) {
        results.push({ asset, status: 'failed', reason: err.message });
      }
    }
    
    console.table(results);
    return self.skipWaiting(); // Force immediate activation
  })());
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)));
    await self.clients.claim(); // Control all clients immediately
    console.log(`Service Worker ${CACHE_NAME} activated`);
  })());
});

// Fetch Handling
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  
  e.respondWith((async () => {
    // Cache-first strategy with network fallback
    const cached = await caches.match(url);
    if (cached) return cached;
    
    try {
      const response = await fetch(createCacheBustRequest(e.request));
      
      if (response.status === 206) {
        console.warn(`Partial response for ${url}, retrying...`);
        response = await fetch(e.request.url, { headers: { 'Range': 'bytes=0-' } });
        // throw new Error('Partial response not supported');
      }
      
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(url, response.clone());
      }
      
      return response;
    } catch (err) { // Ensures Single-Page App (SPA) usability during network outages.
      if (e.request.mode === 'navigate') {
        return caches.match('index.html'); // Serve app shell
      }
      // Gracefully handles failures with user-friendly retry logic
      return new Response(null, { 
        status: 503, 
        headers: { 'Retry-After': '10', 'Content-Type': 'text/plain' } // Instruct clients to retry after 10s
      });
    }
  })());
});