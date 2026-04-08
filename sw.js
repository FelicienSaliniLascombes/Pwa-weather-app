const CACHE_NAME = "nimbus-v6";
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

// 1. INSTALLATION : Mise en cache de l'App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("SW: Mise en cache de l App Shell");
      return cache.addAll(ASSETS);
    }),
  );
});

// 2. ACTIVATION : Nettoyage des anciens caches (Code du TP)
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

// 3. FETCH : Stratégies de cache
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Stratégie pour l'API OpenWeatherMap (Network First)
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
    // Stratégie pour les fichiers locaux (Cache First)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).catch(() => {
            // Si le fichier HTML demandé n'est pas dans le cache et qu'on est offline
            if (event.request.mode === "navigate") {
              return caches.match("/offline.html");
            }
          })
        );
      }),
    );
  }
});
