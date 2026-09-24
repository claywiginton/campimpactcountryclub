/* Offline cache for the scorecard.
 *
 * Strategy is cache-first with a background refresh: the page opens instantly
 * from local storage and works with no signal at all, while any connection
 * quietly pulls down a newer copy for next time. That means a freshly deployed
 * version appears on the launch after the one that downloaded it — the right
 * trade when the alternative is a spinner in the middle of a field.
 *
 * Bump CACHE when the shell changes and you want old copies purged.
 */
var CACHE = "cicc-2026-09-24a";
var SHELL = [
  "./",
  "./index.html",
  "./icon.svg",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./site.webmanifest"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(SHELL); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  if(new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(caches.open(CACHE).then(function(cache){
    return cache.match(req, { ignoreSearch: true }).then(function(hit){
      var fromNetwork = fetch(req).then(function(res){
        if(res && res.status === 200 && res.type === "basic") cache.put(req, res.clone());
        return res;
      }).catch(function(){
        // offline: fall back to whatever we hold, and for a page load that is the app itself
        return hit || (req.mode === "navigate" ? cache.match("./index.html") : Response.error());
      });
      return hit || fromNetwork;
    });
  }));
});
