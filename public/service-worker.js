let CACHE_VERSION = "site";
const CACHE_DATA = "data";

let itemsToCache = [
  "/",
  "/database.js",
  "/index.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/style.css",
  "/manifest.json",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(itemsToCache);
    })
  );
});

self.addEventListener("fetch", function (event) {
  //get
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(CACHE_DATA)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone()); //it clones and stores the data of response
              }
              return response;
            })
            .catch((error) => {
              return cache.match(event.request);
            });
        })
        .catch((error) => {
          console.log(error);
        })
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
