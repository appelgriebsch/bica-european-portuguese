/* Bica offline cache.
 * Navigations: network first, then the last copy of that page, then /.
 * Hashed /assets: cache first (immutable).
 * Everything else same-origin GET: stale-while-revalidate.
 * Auth, APIs, and server functions stay on the network.
 */
const VERSION = "bica-offline-v1";
const PAGES = VERSION + "-pages";
const RUNTIME = VERSION + "-runtime";
const ASSETS = VERSION + "-assets";

const PRECACHE = [
  "/",
  "/favicon.svg",
  "/icon-180.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/og.jpg",
  "/scenes/cafe.jpg",
  "/scenes/tram.jpg",
  "/scenes/radio.jpg",
  "/scenes/books.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES);
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch(() => {
            /* missing file must not fail the whole install */
          }),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, RUNTIME, ASSETS]);
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function isNetworkOnly(url) {
  const p = url.pathname;
  return (
    p.startsWith("/api/") ||
    p.startsWith("/auth/") ||
    p.startsWith("/_server") ||
    p.includes("/_serverFn") ||
    p.startsWith("/__grok/")
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (isNetworkOnly(url)) return;

  if (req.mode === "navigate") {
    event.respondWith(networkFirstPage(req, url));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(req, ASSETS));
    return;
  }

  event.respondWith(staleWhileRevalidate(req, RUNTIME));
});

async function networkFirstPage(req, url) {
  const cache = await caches.open(PAGES);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      await cache.put(req, fresh.clone());
      if (url.pathname === "/") await cache.put("/", fresh.clone());
    }
    return fresh;
  } catch {
    return (
      (await cache.match(req)) ||
      (await cache.match("/")) ||
      new Response("Bica is offline.", {
        status: 503,
        headers: { "content-type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const fresh = await fetch(req);
  if (fresh && fresh.ok) await cache.put(req, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fetching = fetch(req)
    .then((fresh) => {
      if (fresh && fresh.ok) void cache.put(req, fresh.clone());
      return fresh;
    })
    .catch(() => hit);
  return hit || fetching;
}
