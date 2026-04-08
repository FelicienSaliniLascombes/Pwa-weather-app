const CACHE_NAME = "nimbus-v7";
const ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/db.js",
  "/js/favorites.js",
  "/manifest.json",
  "/images/icons/logo_weather_app_512.png",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("SW: Mise en cache de l App Shell");
      return cache.addAll(ASSETS);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== "weather-data-v1")
          .map((key) => caches.delete(key)),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin === "https://api.openweathermap.org") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const clonedResponse = networkResponse.clone();
          caches.open("weather-data-v1").then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return networkResponse;
        })
        .catch(() => caches.match(event.request)),
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("/offline.html");
            }
          })
        );
      }),
    );
  }
});
