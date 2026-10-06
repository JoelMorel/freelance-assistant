const CACHE_NAME = "freelance-assistant-pwa-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass through all API requests directly to network
  if (event.request.url.includes("/jobs") || event.request.url.includes("/generate")) {
    return;
  }
});
