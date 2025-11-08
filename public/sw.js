  // Cache name and files to cache
  const CACHE_NAME = 'quizmaster-v8';
  const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
  ];
  
  // Service Worker Install Event
  self.addEventListener('install', (event) => {
      console.log('[SW] QuizMaster: Installing...');

      // Cache files during installation
      event.waitUntil(
          caches.open(CACHE_NAME)
              .then(cache => {
                  console.log('[SW] QuizMaster: Caching app shell');
                  return cache.addAll(FILES_TO_CACHE);
              })
            .then(() => {
            console.log('[SW] QuizMaster: Skip waiting');
            return self.skipWaiting();
            })
      );
  });

  // Service Worker Activate Event
  self.addEventListener('activate', (event) => {
      console.log('[SW] QuizMaster: Activated');

      // Clean up old caches
      event.waitUntil(
          caches.keys().then(cacheNames => {
              return Promise.all(
                  cacheNames.map(cache => {
                      if (cache !== CACHE_NAME) {
                          console.log('[SW] QuizMaster: Clearing old cache:', cache); 
                          return caches.delete(cache);
                      }
                  })
              );
            }).then(() => {
                console.log('[SW] QuizMaster: Claiming clients');
                return self.clients.claim();
            })
      );
  });

// Service Worker Fetch Event - Cache First Strategy
  self.addEventListener('fetch', (event) => {
      console.log('Service Worker: Fetching', event.request.url);

    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests (CDN resources like Tailwind, fonts, icons)
    if (url.origin !== location.origin) {
      return;
    }

    // Handle navigation requests (for SPA routing)
    // This is the KEY difference for SPAs!
    if (request.mode === 'navigate') {
      event.respondWith(
        caches.match('./index.html')
          .then(response => {
            console.log('[SW] QuizMaster: Serving index.html for navigation');
            return response || fetch(request);
          })
      );
      return;
    }

     // Handle all other requests with cache-first strategy
      event.respondWith(
          caches.match(request)
              .then(response => {
                  // If file is in cache, return it
                  if (response) {
                      console.log('[SW] QuizMaster: Serving from cache:', request.url);
                      return response;
                  }

                  // Otherwise, fetch from network
                  console.log('[SW] QuizMaster: Fetching from network:', request.url);
                  return fetch(request);
              })
      );
  });