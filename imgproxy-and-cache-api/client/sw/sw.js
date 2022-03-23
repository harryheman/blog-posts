const CACHE_NAME = 'my-app_images-v1'

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.includes('my-app_images') && key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { url } = event.request
  const { pathname } = new URL(url)

  if (pathname.includes('imgproxy')) {
    // console.log(pathname)

    event.respondWith(
      caches
        .match(pathname)
        .then(async (response) => {
          if (response) {
            console.log('Image from cache')
            return response
          }
          return fetch(event.request, {
            mode: 'cors',
            credentials: 'omit'
          }).then((response) =>
            caches.open(CACHE_NAME).then((cache) => {
              // console.log(response)
              if (response.ok) {
                cache.put(pathname, response.clone())
              }
              return response
            })
          )
        })
        .catch(console.error)
    )
  }
})
