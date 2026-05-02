const CACHE_NAME = "sistem-rekod-v1";
const urlsToCache = [
  "/",
  "/icon/icon-192.png",
  "/icon/icon-512.png",
  "/offline.html"
];

// Install — cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) return caches.delete(name);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Never intercept auth paths (OIDC callback must hit network)
  try {
    const url = new URL(event.request.url);
    if (url.pathname.startsWith("/auth")) return;
  } catch {
    // URL parse failed, pass through
  }

  // Navigation requests: network first, fallback to offline page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // All other GET: network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
