// SymboSay Service Worker
// Strategy:
//   - App shell (HTML, JS, CSS): cache-first, update in background
//   - Google Fonts: cache-first (they're immutable)
//   - Supabase API: network-first, no cache (live data)
//   - Everything else same-origin: cache-first with network fallback

const CACHE_NAME    = "symbosay-v1";
const SUPABASE_HOST = "fgrfvoazrkutlmiqnmov.supabase.co";

// ── Install — cache the app shell ────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/index.html"])
    )
  );
  self.skipWaiting();
});

// ── Activate — clean up old caches ───────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Supabase — always network, never cache
  if (url.hostname === SUPABASE_HOST) return;

  // Skip cross-origin except Google Fonts
  const isGoogleFont = url.hostname === "fonts.googleapis.com" ||
                       url.hostname === "fonts.gstatic.com";
  if (!isGoogleFont && url.origin !== self.location.origin) return;

  // Navigation requests (page loads) — network first, fall back to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Static assets — cache first, update in background (stale-while-revalidate)
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => null);

      // Return cached immediately if available; otherwise wait for network
      return cached ?? (await networkFetch) ?? new Response("Offline", { status: 503 });
    })
  );
});
