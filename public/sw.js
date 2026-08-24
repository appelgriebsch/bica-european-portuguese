/* Bica offline cache + notification click.
 *
 * Must not intercept module scripts — Safari reports that as
 * "Importing a module script failed" and the page dies.
 * Navigations stay network-first so a new deploy is never hidden
 * behind a cached shell that points at deleted /assets hashes.
 */
const VERSION = "bica-offline-v3";
const PAGES = VERSION + "-pages";
const RUNTIME = VERSION + "-runtime";
const ASSETS = VERSION + "-assets";

const PRECACHE = [
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
      const cache = await caches.open(RUNTIME);
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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = "/";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of all) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target);
            } catch {
              /* older clients */
            }
          }
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(target);
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
    p.startsWith("/__grok/") ||
    p === "/sw.js"
  );
}

function isScriptRequest(req) {
  const d = req.destination;
  return d === "script" || d === "worker" || d === "sharedworker" || d === "audioworklet";
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (isNetworkOnly(url)) return;
  if (isScriptRequest(req)) return;

  if (req.mode === "navigate") {
    event.respondWith(networkFirstPage(req, url));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(networkFirstCache(req, ASSETS));
    return;
  }

  event.respondWith(staleWhileRevalidate(req, RUNTIME));
});

async function networkFirstPage(req, url) {
  const cache = await caches.open(PAGES);
  try {
    const fresh = await fetch(req, { cache: "no-store" });
    if (fresh && fresh.ok && isHtml(fresh)) {
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

async function networkFirstCache(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) await cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const hit = await cache.match(req);
    if (hit) return hit;
    throw new Error("offline");
  }
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

function isHtml(res) {
  return String(res.headers.get("content-type") ?? "").includes("text/html");
}
