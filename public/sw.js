const CACHE = 'nexcampus-shell-v2'
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/favicon.svg', '/icon-192.svg']
const STATIC_FILE = /\.(?:css|js|mjs|svg|png|jpg|jpeg|webp|woff2?)$/i

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('nexcampus-') && key !== CACHE)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then(cache => cache.put('/index.html', copy))
          }
          return response
        })
        .catch(async () => (await caches.match('/index.html')) || Response.error())
    )
    return
  }

  if (!STATIC_FILE.test(url.pathname)) return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(request)
    if (cached) return cached

    try {
      const response = await fetch(request)
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone())
      }
      return response
    } catch {
      return Response.error()
    }
  })())
})
