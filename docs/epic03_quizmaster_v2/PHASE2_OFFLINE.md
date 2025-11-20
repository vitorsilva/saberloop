# Phase 2: Production Offline Capabilities

**Epic:** 3 - QuizMaster V2
**Status:** Not Started
**Estimated Time:** 2-3 sessions
**Prerequisites:** Phase 1 (Backend Integration) complete

---

## Overview

Phase 2 transforms QuizMaster's offline capabilities from basic (dev-only) to production-ready using the **Vite PWA Plugin** and **Workbox**. You'll implement advanced caching strategies, runtime caching for API responses, offline fallbacks, and achieve a Lighthouse PWA score of 100/100.

**What you'll build:**
- Production-grade service worker (auto-generated)
- Advanced caching strategies (precache + runtime)
- Offline fallback pages
- Background sync for pending data
- PWA install experience optimized

**Why this matters:**
- Works offline on first load (after initial visit)
- Questions cached for offline review
- Graceful degradation when API unavailable
- Professional PWA experience
- App Store quality

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Understand Vite PWA Plugin architecture
- ✅ Configure Workbox caching strategies
- ✅ Implement runtime caching for APIs
- ✅ Create offline fallback experiences
- ✅ Handle background sync
- ✅ Optimize service worker lifecycle
- ✅ Achieve Lighthouse PWA 100/100
- ✅ Debug production service workers

---

## Current State vs Target State

### Current State (Epic 02 Phase 7)
```
Service Worker: Manual (public/sw.js)
├── ✅ Development mode works
├── ✅ Basic precaching (static files)
├── ⚠️  Production build doesn't work offline
├── ⚠️  No runtime caching for API responses
├── ⚠️  No offline fallback
└── ⚠️  Vite hash filenames not cached

Lighthouse PWA Score: ~60-70/100
```

### Target State (Epic 03 Phase 2)
```
Service Worker: Auto-generated (Vite PWA Plugin)
├── ✅ Production build works offline
├── ✅ Precaching (all static assets)
├── ✅ Runtime caching (API responses, images, fonts)
├── ✅ Offline fallback page
├── ✅ Background sync for pending quizzes
├── ✅ Vite hash filenames handled automatically
└── ✅ Install prompt optimized

Lighthouse PWA Score: 100/100
```

---

## Architecture

### Caching Strategy Overview

```
┌─────────────────────────────────────────────────┐
│           Service Worker (Workbox)              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Precache (Install Time)                        │
│  ┌───────────────────────────────────────────┐  │
│  │ • index.html                              │  │
│  │ • main-[hash].js                          │  │
│  │ • style-[hash].css                        │  │
│  │ • manifest.json                           │  │
│  │ • icons/*.png                             │  │
│  │ • offline-fallback.html                   │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Runtime Cache (On First Request)               │
│  ┌───────────────────────────────────────────┐  │
│  │ API Responses (Network First)             │  │
│  │  • /.netlify/functions/*                  │  │
│  │  • Cache for 5 minutes                    │  │
│  │  • Fallback to cache if offline           │  │
│  ├───────────────────────────────────────────┤  │
│  │ External Resources (Cache First)          │  │
│  │  • CDN fonts (fonts.googleapis.com)       │  │
│  │  • CDN icons (fonts.gstatic.com)          │  │
│  │  • Tailwind CSS                           │  │
│  ├───────────────────────────────────────────┤  │
│  │ Images (Cache First)                      │  │
│  │  • *.png, *.jpg, *.svg                    │  │
│  │  • Max 50 entries, 30 days                │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Caching Strategies Explained

**Precache (Build Time):**
- Files cached when service worker installs
- Guaranteed to be available offline
- Updated when service worker version changes
- Used for: App shell, critical resources

**Network First (Runtime):**
- Try network first, fall back to cache if offline
- Good for: API responses (want fresh data)
- Cache acts as offline fallback

**Cache First (Runtime):**
- Serve from cache if available, update cache in background
- Good for: Static resources (fonts, images, CDN)
- Fast loading, works offline

**Stale While Revalidate (Runtime):**
- Serve from cache immediately, fetch fresh in background
- Good for: Non-critical resources
- Best of both worlds (speed + freshness)

---

## Implementation Steps

### Step 1: Install Vite PWA Plugin

**Command:**
```bash
npm install -D vite-plugin-pwa workbox-window
```

**What these do:**
- `vite-plugin-pwa`: Integrates PWA into Vite build
- `workbox-window`: Client-side service worker library

---

### Step 2: Configure Vite PWA Plugin

**File:** `vite.config.js`

**Current config:**
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/demo-pwa-app/',
  // ... other config
});
```

**Updated config:**
```javascript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/demo-pwa-app/',

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'manifest.json'],

      manifest: {
        name: 'QuizMaster - AI-Powered Quiz App',
        short_name: 'QuizMaster',
        description: 'Test your knowledge on any topic with AI-generated questions',
        theme_color: '#4A90E2',
        background_color: '#F8F9FA',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/demo-pwa-app/',
        start_url: '/demo-pwa-app/',
        icons: [
          {
            src: '/demo-pwa-app/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/demo-pwa-app/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['education', 'learning', 'quiz']
      },

      workbox: {
        // Files to precache
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],

        // Runtime caching strategies
        runtimeCaching: [
          // API calls (Network First)
          {
            urlPattern: /^https:\/\/.*\.netlify\.app\/\.netlify\/functions\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          // Google Fonts (Cache First)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          // Google Fonts Webfonts (Cache First)
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          // Tailwind CDN (Cache First)
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tailwind-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          // Images (Cache First)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],

        // Clean old caches
        cleanupOutdatedCaches: true,

        // Navigation fallback (for SPA)
        navigateFallback: '/demo-pwa-app/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/\.netlify/]
      },

      devOptions: {
        enabled: true, // Enable in dev for testing
        type: 'module'
      }
    })
  ]
});
```

**Key configuration explained:**

**`registerType: 'autoUpdate'`:**
- Automatically updates service worker when new version detected
- User gets updates without manually refreshing

**`includeAssets`:**
- Additional files to precache
- Icons, manifest, etc.

**`manifest`:**
- PWA manifest configuration
- Defines how app appears when installed

**`workbox.globPatterns`:**
- Files to precache during build
- `**/*.{js,css,html}` = all JS, CSS, HTML files

**`workbox.runtimeCaching`:**
- Strategies for different resource types
- Network First for APIs (fresh data)
- Cache First for static resources (speed)

**`navigateFallback`:**
- Serves index.html for SPA routes when offline
- Makes `/#/quiz`, `/#/results` work offline

---

### Step 3: Create Offline Fallback Page

**File:** `public/offline.html`

**Purpose:** Shown when user is offline and page not cached.

**Content:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - QuizMaster</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      text-align: center;
      max-width: 400px;
    }

    .icon {
      font-size: 64px;
      margin-bottom: 24px;
      opacity: 0.9;
    }

    h1 {
      font-size: 32px;
      margin-bottom: 16px;
      font-weight: 700;
    }

    p {
      font-size: 18px;
      opacity: 0.9;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    button {
      background: white;
      color: #667eea;
      border: none;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    button:active {
      transform: translateY(0);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>
      It looks like you've lost your internet connection.
      Some features might be unavailable until you're back online.
    </p>
    <button onclick="window.location.reload()">
      Try Again
    </button>
  </div>
</body>
</html>
```

---

### Step 4: Update Service Worker Registration

**File:** `src/main.js`

**Current registration (Epic 02):**
```javascript
// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}
```

**New registration (Vite PWA Plugin):**
```javascript
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    // New version available
    if (confirm('New version available! Reload to update?')) {
      updateSW(true); // Force reload
    }
  },
  onOfflineReady() {
    console.log('✅ App ready to work offline');
  },
  onRegistered(registration) {
    console.log('✅ Service Worker registered');
  },
  onRegisterError(error) {
    console.error('❌ Service Worker registration failed:', error);
  }
});
```

**What this does:**
- Automatically registers service worker generated by Vite PWA
- Shows update prompt when new version available
- Logs offline ready status
- Handles errors gracefully

---

### Step 5: Remove Manual Service Worker

**Delete file:** `public/sw.js`

**Why?**
- Vite PWA Plugin generates service worker automatically
- Auto-generated SW is more robust and handles Vite hashing
- No need for manual SW anymore

**If you want to keep custom logic:**
- Move to `vite.config.js` → `workbox` options
- Or use `injectManifest` mode (advanced)

---

### Step 6: Update Network Indicator

**File:** `src/utils/network.js`

**Add offline detection:**
```javascript
/**
 * Check if app can reach network (not just navigator.onLine)
 */
export async function checkConnectivity() {
  if (!navigator.onLine) {
    return false; // Definitely offline
  }

  try {
    // Try to reach health-check endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('/.netlify/functions/health-check', {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Network request failed (offline or timeout)
    return false;
  }
}
```

**Usage in views:**
```javascript
import { checkConnectivity } from '../utils/network.js';

// Before calling API
const isConnected = await checkConnectivity();
if (!isConnected) {
  alert('You are offline. Please check your connection.');
  return;
}
```

---

### Step 7: Implement Offline Fallback in Views

**Example: TopicInputView.js**

**Add offline handling:**
```javascript
async generateQuestions() {
  try {
    // Show loading state
    this.showLoading(true);

    // Check connectivity
    const isOnline = await checkConnectivity();
    if (!isOnline) {
      alert('You are offline. Generating questions requires an internet connection.');
      this.showLoading(false);
      return;
    }

    // Generate questions
    const questions = await generateQuestions(this.topic, this.gradeLevel);

    // Save to state and navigate
    // ...

  } catch (error) {
    console.error('Failed to generate questions:', error);

    // Check if error is network-related
    if (!navigator.onLine) {
      alert('Connection lost. Please check your internet and try again.');
    } else {
      alert('Failed to generate questions. Please try again.');
    }
  } finally {
    this.showLoading(false);
  }
}
```

---

### Step 8: Test Offline Capabilities

**Development testing:**
```bash
npm run dev
```

**1. Test service worker registration:**
- Open DevTools → Application → Service Workers
- Should see service worker registered
- Status: "activated and is running"

**2. Test precaching:**
- Open DevTools → Application → Cache Storage
- Should see caches:
  - `workbox-precache-v2-[url]`
  - `api-cache`
  - `google-fonts-cache`
  - `image-cache`

**3. Test offline mode:**
- Open DevTools → Network → "Offline" checkbox
- Refresh page → Should still load
- Navigate between views → Should work
- Try to create quiz → Should show offline message

**4. Test update flow:**
- Make a small change (e.g., update text)
- Run `npm run build && npm run preview`
- Refresh page
- Should see "New version available! Reload to update?"

---

### Step 9: Production Build Testing

**Build for production:**
```bash
npm run build
```

**Check output:**
```
vite v7.1.12 building for production...
✓ 18 modules transformed.
dist/index.html                  3.25 kB
dist/assets/main-ABC123.js      32.00 kB
dist/sw.js                       15.00 kB  ← Generated by Vite PWA!
dist/workbox-*.js               48.00 kB  ← Workbox runtime
✓ built in 1.2s

PWA assets generated
```

**Preview production build:**
```bash
npm run preview
```

**Test offline:**
1. Open http://localhost:4173/demo-pwa-app/
2. Let app fully load
3. DevTools → Network → "Offline"
4. Refresh page → Should work!
5. Navigate between views → Should work!
6. Check cached quiz history → Should work!

---

### Step 10: Lighthouse Audit

**Run Lighthouse:**
1. Open DevTools → Lighthouse tab
2. Select:
   - ✅ Progressive Web App
   - ✅ Performance
   - Device: Mobile
3. Click "Analyze page load"

**Target scores:**
- **PWA:** 100/100 ✅
- **Performance:** 90+ (optional, focus on PWA)

**Common PWA checklist:**
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Has icons (192x192, 512x512)
- ✅ Configures viewport
- ✅ Content sized correctly
- ✅ Has a theme color
- ✅ Provides a valid apple-touch-icon
- ✅ Configured for a custom splash screen
- ✅ Sets an address-bar theme color

**If score < 100:**
- Check specific failures in report
- Most common: Missing icon sizes
- Fix and re-test

---

### Step 11: Deploy and Verify

**Deploy to Netlify:**
```bash
git add .
git commit -m "feat: add production offline capabilities with Vite PWA Plugin

- Configure Vite PWA Plugin with Workbox
- Implement runtime caching strategies
- Add offline fallback page
- Update service worker registration
- Remove manual service worker
- Add connectivity checking
- Achieve Lighthouse PWA 100/100

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

**Wait for deployment...**

**Test production:**
1. Visit https://your-app.netlify.app
2. Open DevTools → Application
3. Check service worker registered
4. Check caches populated
5. Go offline (DevTools Network → Offline)
6. Refresh → App should work!

---

## Key Concepts Learned

### 1. Precache vs Runtime Cache

**Precache (Build Time):**
```javascript
// Vite PWA automatically precaches:
- index.html
- main-[hash].js
- style-[hash].css
- manifest.json
- icons/*.png
```

**Benefits:**
- Guaranteed offline availability
- Updated atomically (all or nothing)
- Fast first load (everything cached)

**Runtime Cache (Request Time):**
```javascript
// Cached on first request:
- API responses
- External fonts
- CDN resources
- Images
```

**Benefits:**
- Flexible (cache any URL pattern)
- Handles dynamic content
- Configurable strategies

### 2. Caching Strategies

**Network First:**
```
Try network → Success? Return and cache
           → Failed? Return from cache (if available)
```
**When to use:** API calls (want fresh data)

**Cache First:**
```
Check cache → Found? Return immediately
           → Not found? Fetch from network and cache
```
**When to use:** Static resources (images, fonts, CSS)

**Stale While Revalidate:**
```
Return from cache immediately
Fetch fresh from network in background
Update cache with fresh response
```
**When to use:** Non-critical resources (balance speed + freshness)

### 3. Service Worker Lifecycle

**Install → Waiting → Activate → Fetch**

**Install:**
- Download and cache precache files
- `workbox.precacheAndRoute()` happens here
- If any file fails, installation fails

**Waiting:**
- New SW installed but waiting for old SW to release control
- `skipWaiting()` bypasses this (auto-update)

**Activate:**
- Clean up old caches
- `cleanupOutdatedCaches: true` does this automatically

**Fetch:**
- Intercept network requests
- Apply caching strategies
- Serve cached responses when offline

### 4. Cache Expiration

**Max Entries:**
```javascript
expiration: {
  maxEntries: 50
}
```
**What it does:** Keeps only 50 most recent entries, deletes oldest

**Max Age:**
```javascript
expiration: {
  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
}
```
**What it does:** Deletes entries older than 30 days

**Why important:**
- Prevents cache from growing indefinitely
- Keeps fresh content
- Respects storage limits

### 5. Navigation Fallback

**Problem:** SPA routes (`/#/quiz`) don't exist as files

**Solution:**
```javascript
navigateFallback: '/demo-pwa-app/index.html'
```

**How it works:**
- User visits `/#/quiz` while offline
- Service worker serves `index.html`
- Router detects `#/quiz` and shows QuizView
- SPA routing works offline!

**Denylist:**
```javascript
navigateFallbackDenylist: [/^\/api/, /^\/\.netlify/]
```
**Why:** Don't serve HTML for API requests (would break fetch)

---

## Troubleshooting

### Service Worker Not Updating
**Symptom:** Old version stuck, new changes not appearing

**Fix:**
1. DevTools → Application → Service Workers → "Update"
2. Check "Update on reload"
3. Hard refresh (Ctrl+Shift+R)
4. Or: Unregister service worker and reload

### Cache Not Clearing
**Symptom:** Old content showing even after update

**Fix:**
1. DevTools → Application → Storage → "Clear site data"
2. Check `cleanupOutdatedCaches: true` in config
3. Verify cache version changed (Workbox does automatically)

### Offline Not Working in Production
**Symptom:** Works in dev but not after `npm run build`

**Fix:**
1. Check `dist/sw.js` exists
2. Check service worker registered (DevTools → Application)
3. Verify precache includes all needed files
4. Check `base` path matches deployment URL

### API Calls Failing Offline
**Symptom:** No cached fallback for API calls

**Fix:**
1. Make at least one online request first (populates cache)
2. Check `runtimeCaching` includes API pattern
3. Verify `NetworkFirst` strategy configured
4. Check `cacheableResponse` allows status codes

### Lighthouse PWA Score Low
**Common issues:**
- Missing icon sizes (need 192x192 and 512x512)
- Manifest missing required fields
- Service worker not responding when offline
- No theme-color meta tag
- Viewport not configured

**Fix:** Follow Lighthouse specific recommendations

---

## Success Criteria

**Phase 2 is complete when:**

- ✅ Vite PWA Plugin installed and configured
- ✅ `vite.config.js` has full Workbox configuration
- ✅ Precaching configured (all static assets)
- ✅ Runtime caching configured (APIs, fonts, images)
- ✅ Offline fallback page created
- ✅ Service worker registration updated (`virtual:pwa-register`)
- ✅ Manual `sw.js` removed
- ✅ Connectivity checking implemented
- ✅ Offline handling in views (graceful degradation)
- ✅ Production build generates service worker
- ✅ Offline mode works after first load
- ✅ Navigation between views works offline
- ✅ Cached quiz history accessible offline
- ✅ Lighthouse PWA score: 100/100
- ✅ Production deployment successful
- ✅ App works offline on mobile devices

**Verification checklist:**
```bash
# Build
npm run build
# → dist/sw.js exists
# → dist/workbox-*.js exists

# Preview
npm run preview

# Test offline
# 1. Load app online
# 2. Go offline (Network tab → Offline)
# 3. Refresh → App loads
# 4. Navigate → All views work
# 5. Check history → Data accessible

# Lighthouse
# → PWA score: 100/100
# → All PWA checks passing
```

---

## Next Steps

**After completing Phase 2:**
- ✅ Production-grade offline capabilities
- ✅ Lighthouse PWA 100/100
- ✅ Professional install experience
- ✅ Works seamlessly online and offline

**Move to Phase 3:**
- UI Polish
- Dynamic home page (real data from DB)
- Settings page (API key management)
- Simplified navigation

---

## References

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Caching Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
- [Lighthouse PWA Audit](https://web.dev/lighthouse-pwa/)

---

**Related Documentation:**
- Epic 3 Plan: `docs/epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md`
- Phase 1 (Backend): `docs/epic03_quizmaster_v2/PHASE1_BACKEND.md`
- Epic 2 Phase 7 (PWA Basics): `docs/epic02_quizmaster_v1/PHASE7_LEARNING_NOTES.md`
