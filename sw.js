const CACHE = 'misfinanzas-v4'
const FILES = ['/', '/index.html', '/app.html', '/sw.js', '/manifest.json', '/lib/preact.js', '/lib/preact-hooks.js', '/lib/htm.js', '/lib/chart-umd.js', '/lib/xlsx.min.js']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
    const clone = res.clone()
    caches.open(CACHE).then(c => c.put(e.request, clone))
    return res
  })))
})
