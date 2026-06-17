const CACHE = 'misfinanzas-v7'
const BASE = new URL('./', self.location).href
const FILES = [
  BASE,
  BASE + 'app.html',
  BASE + 'manifest.json',
  BASE + 'lib/preact.js',
  BASE + 'lib/preact-hooks.js',
  BASE + 'lib/htm.js',
  BASE + 'lib/chart-umd.js',
  BASE + 'lib/xlsx.min.js'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchFresh = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      }).catch(() => cached || new Response('Offline', {status: 503}))
      // network-first para HTML, cache-first para assets
      if (e.request.destination === 'document') return fetchFresh
      return cached || fetchFresh
    })
  )
})
