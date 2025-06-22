// Service Worker to enable SharedArrayBuffer on GitHub Pages
// Based on: https://github.com/gzuidhof/coi-serviceworker
// Improved version to handle issues mentioned in GitHub discussion

const coiHeaders = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin'
};

// Track if we've already attempted to enable COI
let coiAttempted = false;

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Skip if it's a request for the service worker itself
  if (event.request.url.includes('sw.js') || event.request.url.includes('enable-threads.js')) {
    return;
  }

  // Skip if it's a no-cors request
  if (event.request.mode === 'no-cors') {
    return;
  }

  // Skip if it's a cache-only request
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Only add headers for HTML documents
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
          return response;
        }

        // Create a new response with the COI headers
        const newHeaders = new Headers(response.headers);
        
        // Add COI headers
        Object.entries(coiHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      })
      .catch(function(error) {
        console.error('Service Worker fetch error:', error);
        return fetch(event.request);
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 