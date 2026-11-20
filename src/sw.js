// Ink & Spine service worker: offline app shell + cached icons.
// Bump V to force every device to drop old caches.
const V = "ink-v1";
const SHELL = ["./", "manifest.json", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // never touch Supabase, fonts, dictionary, cdnjs

  // Pages: network first so deploys show up immediately; cached copy only when offline.
  if (r.mode === "navigate") {
    e.respondWith(
      fetch(r)
        .then((res) => {
          if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put("./", cp)); }
          return res;
        })
        .catch(() => caches.match("./"))
    );
    return;
  }

  // Icons + manifest: cache first.
  if (/\/icons\/|manifest\.json$/.test(u.pathname)) {
    e.respondWith(
      caches.match(r).then((hit) => hit || fetch(r).then((res) => {
        if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); }
        return res;
      }))
    );
  }
});
