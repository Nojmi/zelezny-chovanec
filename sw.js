/* Service worker: aplikace se otevře i bez signálu (po prvním načtení). */
const CACHE = "zc-shell-v1";
self.addEventListener("install", e=>{ self.skipWaiting(); });
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  const ok = url.origin === location.origin || url.hostname === "www.gstatic.com";
  if(!ok) return;
  // nejdřív síť (aktuální verze), při výpadku kopie z cache
  e.respondWith(
    fetch(req).then(res=>{
      if(res && res.ok){ const copy = res.clone(); caches.open(CACHE).then(c=>c.put(req, copy)); }
      return res;
    }).catch(()=>caches.match(req).then(r=>r || (req.mode==="navigate" ? caches.match("./") : undefined)))
  );
});
