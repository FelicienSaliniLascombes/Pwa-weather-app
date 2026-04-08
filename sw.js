// Dans ton écouteur 'fetch' du Service Worker
if (url.origin === 'https://api.openweathermap.org') {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                const clonedResponse = networkResponse.clone();
                caches.open('weather-data-v1').then(cache => {
                    cache.put(event.request, clonedResponse);
                });
                return networkResponse;
            })
            .catch(() => caches.match(event.request)) // Fallback sur le cache si réseau HS
    );
}