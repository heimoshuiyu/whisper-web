// Enable SharedArrayBuffer and WebAssembly threads on GitHub Pages
// Based on the workaround from: https://github.com/josephrocca/clip-image-sorter/blob/main/enable-threads.js
// Improved version to handle issues mentioned in GitHub discussion

(function() {
  // Check if we've already attempted to enable COI
  if (sessionStorage.getItem('coi_attempted')) {
    console.log('COI already attempted in this session');
    return;
  }

  // Check if SharedArrayBuffer is available
  if (typeof SharedArrayBuffer !== 'undefined') {
    console.log('SharedArrayBuffer is already available');
    return;
  }

  // Check if we're in a cross-origin isolated context
  if (crossOriginIsolated) {
    console.log('Already cross-origin isolated');
    return;
  }

  console.log('Not cross-origin isolated, attempting to enable SharedArrayBuffer...');
  
  // Mark that we've attempted COI
  sessionStorage.setItem('coi_attempted', 'true');
  
  // Register service worker to inject headers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registered successfully:', registration);
        
        // Wait a bit for the service worker to activate
        setTimeout(() => {
          // Check if we need to reload
          if (typeof SharedArrayBuffer === 'undefined' && !crossOriginIsolated) {
            console.log('Reloading page to apply COI headers...');
            window.location.reload();
          }
        }, 2000);
      })
      .catch(function(error) {
        console.log('Service Worker registration failed:', error);
        // Clear the session storage so we can try again
        sessionStorage.removeItem('coi_attempted');
      });
  } else {
    console.log('Service Worker not supported');
    // Clear the session storage so we can try again
    sessionStorage.removeItem('coi_attempted');
  }
})(); 