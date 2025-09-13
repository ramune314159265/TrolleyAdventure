const CACHE_NAME = 'my-cache-v1'

const urlsToCache = [
	'/game/videos/ssh_goal.webm',
	'/game/videos/ssh_goal_static.mp4',
	'/game/videos/stars_left.webm',
	'/game/videos/stars_right.webm',
	'/game/videos/stars.webm',
	'/game/videos/start_static.mp4',
	'/game/videos/start.mp4',
]

self.addEventListener('install', e => {
	e.waitUntil(
		caches.open(CACHE_NAME)
			.then(cache => cache.addAll(urlsToCache))
	)
})

self.addEventListener('activate', e => {
	e.waitUntil(
		caches.keys().then(keys =>
			Promise.all(
				keys.filter(key => key !== CACHE_NAME)
					.map(key => caches.delete(key))
			)
		)
	)
})

const shouldCacheExtension = url => {
	return /\.(png|mp3|webp)$/.test(url)
}

self.addEventListener('fetch', e => {
	const req = e.request

	e.respondWith(
		caches.match(req).then(cachedResponse => {
			if (cachedResponse) return cachedResponse

			return fetch(req).then(networkResponse => {
				if (networkResponse.ok && shouldCacheExtension(req.url)) {
					const responseClone = networkResponse.clone()
					caches.open(CACHE_NAME).then(cache => cache.put(req, responseClone))
				}
				return networkResponse
			}).catch(() => {
			})
		})
	)
})
