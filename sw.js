// Bloom service worker: keeps the site usable offline.
// Bump VERSION whenever the precached files change, so old caches get cleared.
var VERSION = 'bloom-v1';
var FONTS = 'bloom-fonts-v1';
var PRECACHE = [
  '/', '/index.html', '/styles.css', '/main.js', '/thanks.html', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION && k !== FONTS; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return; // booking POSTs always go to the network

  // Google Fonts: cache first, they never change at a given URL
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) { c.put(req, res.clone()); return res; });
      });
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Site files: network first so timetable changes in main.js show on the next open,
  // falling back to the cached copy when offline
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok) {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) {
      return hit || (req.mode === 'navigate' ? caches.match('/') : Response.error());
    });
  }));
});
