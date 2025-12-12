# Phase 7: PWA Integration for QuizMaster

**Goal**: Adapt the PWA knowledge from Epic 01 to QuizMaster's SPA architecture.

---

## 📚 Prerequisites

**Before starting this phase:**
- ✅ You already completed Epic 01 Phase 4 (PWA fundamentals)
- ✅ You understand service workers, manifests, and caching
- ✅ You've built PWAs before

**This phase focuses on:**
- 🎯 SPA-specific PWA challenges
- 🎯 Adapting existing PWA knowledge to QuizMaster
- 🎯 Quick implementation and testing

**If you need a refresher on PWA basics**, review:
- `docs/epic01_infrastructure/PHASE2_LEARNING_NOTES.md` (Service workers)
- `docs/epic01_infrastructure/PHASE3_LEARNING_NOTES.md` (Advanced PWA)

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Adapt manifest.json for QuizMaster
- ✅ Configure service worker for SPA architecture
- ✅ Handle offline state in QuizMaster views
- ✅ Test PWA features work with routing
- ⏱️ **Estimated time: 1 session** (vs 2-3 if learning from scratch)

---

## 7.1 SPA PWA Challenges

### The Key Difference

**Traditional PWA (Epic 01):**
- Multiple HTML files
- Each route = different file
- Service worker caches each page

**SPA PWA (QuizMaster):**
- Single HTML file (`index.html`)
- All routes in JavaScript (`#/quiz`, `#/results`)
- Service worker must serve same HTML for all routes

### QuizMaster PWA Features

**What works offline:**
- ✅ View history (stored in IndexedDB)
- ✅ Browse past sessions
- ✅ View settings
- ✅ Navigate between views

**What needs network:**
- ❌ Generate new questions (requires API)
- ❌ Get explanations for wrong answers

---

## 7.2 Quick Manifest Update

### Changes Needed

You already have a working manifest from Epic 01. Just update these fields:

### Updated Manifest for QuizMaster

```json
{
  "name": "QuizMaster - AI-Powered Quiz App",
  "short_name": "QuizMaster",
  "description": "Test your knowledge on any topic with AI-generated questions",
  "start_url": "/app/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait-primary",
  "categories": ["education", "learning", "quiz"],
  "icons": [
    {
      "src": "/app/public/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/app/public/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/app/public/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png"
    },
    {
      "src": "/app/public/screenshots/quiz.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ]
}
```

**Key changes:**
- Updated name and description
- Added `orientation` for better mobile experience
- Added `categories` for app stores
- Added `purpose: "any maskable"` for better icon display
- Added `screenshots` (optional, but nice for PWA)

---

## 7.3 SPA Service Worker Pattern

### The Challenge

You already know service workers from Epic 01. The SPA challenge is:

**Problem:**
- All routes (`/`, `#/quiz`, `#/results`) use the same `index.html`
- Browser navigation requests need to return `index.html`
- Router handles the actual view once HTML loads

**Solution:**
```javascript
// For navigation requests → serve index.html
if (request.mode === 'navigate') {
  return caches.match('/app/index.html');
}
```

---

## 7.4 Service Worker Implementation

### Update sw.js

```javascript
// public/sw.js

const CACHE_NAME = 'quizmaster-v1';
const RUNTIME_CACHE = 'quizmaster-runtime-v1';

// Files to cache on install
const FILES_TO_CACHE = [
  '/app/',
  '/app/index.html',
  '/app/styles.css',
  '/app/src/main.js',
  '/app/src/router/router.js',
  '/app/src/state.js',
  '/app/src/views/BaseView.js',
  '/app/src/views/HomeView.js',
  '/app/src/views/QuizView.js',
  '/app/src/views/ResultsView.js',
  '/app/src/views/HistoryView.js',
  '/app/src/views/SettingsView.js',
  '/app/src/api/api.mock.js',
  '/app/src/api/prompts.js',
  '/app/src/db/db.js',
  '/app/public/icons/icon-192x192.png',
  '/app/public/icons/icon-512x512.png',
  '/app/public/manifest.json'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            console.log('[SW] Deleting old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests (for Phase 11)
  if (url.pathname.includes('/.netlify/functions/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle navigation requests (all HTML requests)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/app/index.html')
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }

  // Handle all other requests (cache first)
  event.respondWith(cacheFirst(request));
});

// Cache first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  console.log('[SW] Cache miss, fetching:', request.url);
  try {
    const response = await fetch(request);
    // Cache the response for next time
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    // Could return a custom offline page here
    throw error;
  }
}

// Network first strategy (for API calls)
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    // Update cache with fresh response
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
```

### Register Service Worker

```javascript
// src/main.js (add at the end)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/app/public/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
```

---

## 7.5 Handling Offline State

### Detect Online/Offline

```javascript
// src/utils/network.js

export function isOnline() {
  return navigator.onLine;
}

export function onOnline(callback) {
  window.addEventListener('online', callback);
}

export function onOffline(callback) {
  window.addEventListener('offline', callback);
}

// Check if network request will work
export async function checkConnectivity() {
  try {
    const response = await fetch('/app/public/manifest.json', {
      method: 'HEAD',
      cache: 'no-store'
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

### Show Offline Indicator

```javascript
// src/components/OfflineIndicator.js

export default class OfflineIndicator {
  constructor() {
    this.indicator = null;
    this.init();
  }

  init() {
    // Create indicator element
    this.indicator = document.createElement('div');
    this.indicator.className = 'offline-indicator';
    this.indicator.innerHTML = `
      <span class="offline-icon">📡</span>
      <span class="offline-text">You're offline</span>
    `;
    this.indicator.style.display = 'none';
    document.body.appendChild(this.indicator);

    // Listen for online/offline events
    window.addEventListener('online', () => this.hide());
    window.addEventListener('offline', () => this.show());

    // Check initial state
    if (!navigator.onLine) {
      this.show();
    }
  }

  show() {
    this.indicator.style.display = 'flex';
  }

  hide() {
    this.indicator.style.display = 'none';
  }
}

// Initialize in main.js
// new OfflineIndicator();
```

### Disable Features When Offline

```javascript
// src/views/HomeView.js

import { isOnline } from '../utils/network.js';

export default class HomeView extends BaseView {
  render() {
    const offline = !isOnline();

    this.setHTML(`
      <div class="home-view">
        <h1>QuizMaster</h1>

        ${offline ? `
          <div class="warning-banner">
            ⚠️ You're offline. New quizzes require an internet connection.
            You can still view your quiz history!
          </div>
        ` : ''}

        <input
          type="text"
          id="topicInput"
          placeholder="Enter topic..."
          ${offline ? 'disabled' : ''}
        >

        <button
          id="startBtn"
          ${offline ? 'disabled' : ''}
        >
          Start Quiz
        </button>

        <a href="#/history">View History (works offline)</a>
      </div>
    `);

    this.attachListeners();
  }
}
```

---

## 7.6 Install Prompt

### Detect Install Availability

```javascript
// src/utils/install.js

let deferredPrompt = null;

// Capture install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('Install prompt available');

  // Show install button
  showInstallButton();
});

function showInstallButton() {
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.style.display = 'block';
  }
}

export async function promptInstall() {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    console.log('User accepted install');
  } else {
    console.log('User dismissed install');
  }

  deferredPrompt = null;
  return outcome === 'accepted';
}

// Detect if already installed
export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}
```

### Add Install Button

```javascript
// src/views/HomeView.js

import { promptInstall, isInstalled } from '../utils/install.js';

export default class HomeView extends BaseView {
  render() {
    const installed = isInstalled();

    this.setHTML(`
      <div class="home-view">
        <h1>QuizMaster</h1>

        ${!installed ? `
          <button id="installBtn" class="install-btn" style="display: none;">
            📱 Install App
          </button>
        ` : ''}

        <!-- Rest of home view -->
      </div>
    `);

    this.attachListeners();
  }

  attachListeners() {
    const installBtn = this.querySelector('#installBtn');

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        const accepted = await promptInstall();
        if (accepted) {
          installBtn.style.display = 'none';
        }
      });
    }

    // Other listeners...
  }
}
```

---

## 7.7 Testing PWA Features

### Test Checklist

**Manifest:**
- [ ] Open DevTools → Application → Manifest
- [ ] Verify all fields are correct
- [ ] Icons display properly

**Service Worker:**
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker is registered
- [ ] Check "Update on reload" during development
- [ ] Verify cache storage has files

**Offline:**
- [ ] Open DevTools → Network → Throttling
- [ ] Select "Offline"
- [ ] Refresh page - should still load
- [ ] Navigate to History - should work
- [ ] Try creating quiz - should show error

**Install:**
- [ ] Desktop: Look for install icon in address bar
- [ ] Mobile: Look for "Add to Home Screen" prompt
- [ ] Install app
- [ ] Open installed app
- [ ] Verify standalone mode

### Lighthouse Audit

**Run Lighthouse:**
1. Open DevTools → Lighthouse
2. Select "Progressive Web App"
3. Click "Generate report"

**Target scores:**
- PWA: 100/100
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 80+

---

## 7.8 Debugging Service Worker

### Common Issues

**1. Service Worker Not Updating**
```javascript
// In DevTools → Application → Service Workers
// Click "Update" or enable "Update on reload"
```

**2. Cache Not Clearing**
```javascript
// In DevTools → Application → Storage
// Click "Clear site data"
```

**3. Files Not Cached**
```javascript
// Check sw.js FILES_TO_CACHE array
// Verify paths are correct (include /app/ prefix)
```

**4. Offline Not Working**
```javascript
// Check console for fetch errors
// Verify cache-first strategy is working
// Test with real offline (not just DevTools throttling)
```

---

## 7.9 Update Strategy

### When to Update Cache

**Increment CACHE_NAME when:**
- HTML changes
- CSS changes
- JavaScript changes
- Icons change

```javascript
// sw.js
const CACHE_NAME = 'quizmaster-v2';  // Increment version
```

### Update Flow

1. User visits site
2. New service worker detected
3. New service worker installs in background
4. Once installed, waits to activate
5. User closes all tabs
6. Next visit: new service worker activates
7. Old cache deleted

### Skip Waiting (Immediate Update)

```javascript
// sw.js

self.addEventListener('install', (event) => {
  // Force immediate activation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control immediately
  self.clients.claim();
});
```

---

## Checkpoint Questions

**Q1**: Why do we cache `index.html` for all navigation requests in an SPA?

<details>
<summary>Answer</summary>

In an SPA:
- All routes (`/`, `#/quiz`, `#/results`) use the same `index.html`
- The JavaScript (router) handles which view to show
- Service worker serves cached `index.html` for any navigation
- This makes the app work offline - HTML loads, router handles the rest
</details>

**Q2**: What's the difference between app shell and runtime caching?

<details>
<summary>Answer</summary>

**App Shell** (static assets):
- Cached on service worker install
- Never changes without version bump
- HTML, CSS, JavaScript, icons
- Cache-first strategy

**Runtime** (dynamic content):
- Cached as user uses app
- Changes frequently
- API responses, user-generated content
- Network-first strategy
</details>

**Q3**: Why does QuizMaster work offline for history but not new quizzes?

<details>
<summary>Answer</summary>

**History works offline:**
- Data stored in IndexedDB (local database)
- No network required
- Views and assets cached by service worker

**New quizzes don't work offline:**
- Requires API call to generate questions
- API needs internet connection
- Can't generate questions without network
</details>

---

## Hands-On Exercise

### Make QuizMaster a PWA

**Task**: Implement all PWA features for QuizMaster.

**Steps**:

1. **Update manifest.json** with QuizMaster details

2. **Create sw.js** with:
   - App shell caching
   - Cache-first strategy
   - Network-first for API

3. **Register service worker** in main.js

4. **Create offline indicator** component

5. **Add install button** to HomeView

6. **Handle offline state** in views

7. **Test everything**:
   - Install works
   - Offline works
   - Cache updates properly

**Success Criteria**:
- ✅ Lighthouse PWA score: 100/100
- ✅ App installable
- ✅ Works offline (history/settings)
- ✅ Offline indicator shows
- ✅ Service worker caches correctly

---

## Next Steps

Once your PWA is working:

**"I'm ready for Phase 8"** → We'll polish and test thoroughly

**Need help?** → Ask Claude about service workers or PWA features

---

## Learning Notes

**Date Started**: ___________

**Key Concepts Understood**:
- [ ] Service worker lifecycle
- [ ] Caching strategies
- [ ] Offline detection
- [ ] Install prompts

**Code I Wrote**:
- [ ] Updated manifest.json
- [ ] Created sw.js
- [ ] Registered service worker
- [ ] Offline handling
- [ ] Install prompt

**Lighthouse Score**: _____/100

**Date Completed**: ___________
