# Phase 9: Deploy QuizMaster

**Goal**: Deploy QuizMaster to production using existing deployment knowledge.

---

## 📚 Prerequisites

**You already know deployment from Epic 01:**
- ✅ GitHub Actions CI/CD (Phase 4.5)
- ✅ GitHub Pages deployment
- ✅ Build process (Vite)
- ✅ Production configuration

**This phase is a quick review + deploy:**
- 🎯 Update build for QuizMaster
- 🎯 Verify deployment works
- 🎯 Test production app
- ⏱️ **Estimated time: 30 minutes** (quick verification)

---

## Learning Objectives

By the end of this phase, you will:
- ✅ Update production configuration for QuizMaster
- ✅ Deploy to GitHub Pages
- ✅ Verify all features work in production
- ✅ (Optional) Set up Netlify for Phase 11

---

## 9.1 Quick Deployment Review

### Current Setup (from Epic 01)

You already have:
- ✅ GitHub Actions workflow (`.github/workflows/deploy.yml`)
- ✅ Automated builds on push to main
- ✅ GitHub Pages configured
- ✅ Vite production build

### What Needs Updating

For QuizMaster, just verify:
- Service worker caches correct files
- Manifest paths are correct
- Mock API works in production

---

## 9.2 Production Build Configuration

### Vite Configuration for Production

```javascript
// vite.config.js

import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages
  base: '/app/',

  // Root directory
  root: '.',

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',

    // Clear output directory before build
    emptyOutDir: true,

    // Generate source maps for debugging (disable in production if size matters)
    sourcemap: false,

    // Minify output
    minify: 'terser',

    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs in production
        drop_debugger: true
      }
    },

    // Rollup options
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'vendor': ['idb'],  // External dependencies
          'router': ['./src/router/router.js'],
          'db': ['./src/db/db.js'],
          'api': ['./src/api/api.mock.js', './src/api/prompts.js']
        }
      }
    }
  },

  // Development server
  server: {
    port: 3000,
    open: true
  }
});
```

### Environment Variables

```javascript
// For different environments
// .env.production
VITE_APP_ENV=production
VITE_USE_MOCK_API=true

// .env.development
VITE_APP_ENV=development
VITE_USE_MOCK_API=true
```

```javascript
// Use in code
const isProduction = import.meta.env.PROD;
const useMockAPI = import.meta.env.VITE_USE_MOCK_API === 'true';
```

---

## 9.3 Pre-Deployment Checklist

### Code Quality

- [ ] All tests pass (`npm test`)
- [ ] No console errors
- [ ] No ESLint warnings (if using)
- [ ] Code commented appropriately
- [ ] No TODO comments left

### Build

- [ ] Build succeeds (`npm run build`)
- [ ] Inspect dist/ folder size (should be < 500KB)
- [ ] Test built version locally
- [ ] Source maps removed (if desired)

### PWA

- [ ] manifest.json has correct start_url
- [ ] Service worker paths are correct
- [ ] Icons present in build
- [ ] Lighthouse PWA score 90+

### Content

- [ ] Update app name/description
- [ ] Check all text for typos
- [ ] Verify copyright/credits
- [ ] Update README.md

### Security

- [ ] No API keys in code
- [ ] No sensitive data exposed
- [ ] HTTPS enforced
- [ ] Content Security Policy (optional)

---

## 9.4 Building for Production

### Build Command

```bash
# Clean install dependencies
rm -rf node_modules
npm install

# Run tests
npm test

# Build for production
npm run build

# Output will be in dist/
```

### Verify Build Locally

```bash
# Serve the built files locally
npx serve dist

# Or with Python
cd dist
python -m http.server 8080
```

**Test the production build:**
- Navigate to http://localhost:8080/app/
- Test all flows
- Check console for errors
- Verify service worker works

---

## 9.5 Deploy to GitHub Pages

### Current Setup (Already Working)

Your GitHub Actions workflow already deploys to GitHub Pages:

```yaml
# .github/workflows/deploy.yml

name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Deploy Process

```bash
# 1. Make sure all changes are committed
git status

# 2. Commit any final changes
git add .
git commit -m "chore: prepare for deployment"

# 3. Push to main branch
git push origin main

# 4. GitHub Actions automatically builds and deploys
# Watch progress at: https://github.com/yourusername/app/actions

# 5. Wait 2-3 minutes for deployment

# 6. Visit your site
# https://yourusername.github.io/app/
```

### Verify Deployment

**Check:**
- [ ] Site loads at GitHub Pages URL
- [ ] All pages work
- [ ] Service worker registers
- [ ] App installable
- [ ] No 404 errors
- [ ] Manifest loads correctly

---

## 9.6 Deploy to Netlify (For Phase 11)

### Setup Netlify

**Option 1: Connect GitHub (Recommended)**

1. Go to https://www.netlify.com/
2. Sign up with GitHub
3. Click "New site from Git"
4. Select your repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Branch**: `main`
6. Click "Deploy site"

**Option 2: Deploy via CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize (from project root)
netlify init

# Follow prompts:
# - Create new site or link existing
# - Build command: npm run build
# - Publish directory: dist

# Deploy
netlify deploy --prod
```

### Netlify Configuration

```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"  # For Phase 11

# Redirect all routes to index.html (SPA)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Development settings
[dev]
  command = "npm run dev"
  port = 3000
  targetPort = 3000
```

### Environment Variables (Phase 11)

1. Go to Site Settings → Environment Variables
2. Add variables:
   - `ANTHROPIC_API_KEY` (your API key)
3. Redeploy

---

## 9.7 Custom Domain (Optional)

### Using GitHub Pages

**With Custom Domain:**

1. Buy domain (e.g., quizmaster.com)
2. Add DNS records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```
3. Add CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   ```
4. In GitHub repo settings → Pages → Custom domain
5. Enter domain, save
6. Enable "Enforce HTTPS"

### Using Netlify

**With Custom Domain:**

1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Enter your domain
4. Follow DNS configuration instructions
5. Netlify provides automatic HTTPS

---

## 9.8 Monitoring and Analytics

### Basic Monitoring

**Use browser console:**
```javascript
// Add to main.js
console.log('QuizMaster version: 1.0.0');
console.log('Environment:', import.meta.env.MODE);
console.log('API Mode:', 'mock');  // or 'real' in Phase 11
```

**Service Worker Updates:**
```javascript
// Notify users of updates
navigator.serviceWorker.register('/sw.js').then(registration => {
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New version available
        if (confirm('New version available! Reload to update?')) {
          window.location.reload();
        }
      }
    });
  });
});
```

### Error Tracking (Optional)

**Simple error logging:**
```javascript
// src/utils/errorTracking.js

export function logError(error, context = {}) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.error('Error logged:', errorData);

  // In Phase 11, could send to backend
  // await fetch('/api/log-error', {
  //   method: 'POST',
  //   body: JSON.stringify(errorData)
  // });
}

// Usage
try {
  // risky operation
} catch (error) {
  logError(error, { view: 'QuizView', action: 'generateQuestions' });
}
```

### Usage Analytics (Optional)

**Simple page view tracking:**
```javascript
// src/utils/analytics.js

export function trackPageView(route) {
  console.log('Page view:', route);

  // Could integrate with Google Analytics or similar
  // gtag('config', 'GA_MEASUREMENT_ID', {
  //   page_path: route
  // });
}

// In router
router.addEventListener('routechange', (event) => {
  trackPageView(event.detail.route);
});
```

---

## 9.9 Post-Deployment Tasks

### Verify Everything Works

**Test all flows in production:**
- [ ] Home → Quiz → Results → History
- [ ] Settings save and load
- [ ] Offline mode works
- [ ] Install works
- [ ] No console errors

**Test on different devices:**
- [ ] Desktop browser
- [ ] Mobile browser
- [ ] Installed PWA (desktop)
- [ ] Installed PWA (mobile)

### Update Documentation

```markdown
# README.md update

## Live Demo

🚀 **[Try QuizMaster](https://yourusername.github.io/app/)**

## Features

- ✅ AI-generated quiz questions
- ✅ Multiple choice format
- ✅ Instant feedback
- ✅ Progress tracking
- ✅ Offline history viewing
- ✅ Installable PWA

## Tech Stack

- Vanilla JavaScript (ES6+)
- IndexedDB for data persistence
- Hash-based routing
- Mock API (real API in v2)
- Service Worker for offline support
- GitHub Pages deployment
```

### Share with Test Users

**Create instructions for testers:**

```markdown
# QuizMaster Beta Test

Thanks for testing QuizMaster!

## Getting Started

1. Visit: https://yourusername.github.io/app/
2. Install the app (optional but recommended)
3. Try creating a quiz on any topic
4. Complete the quiz and view results

## What to Test

- Does the quiz flow feel smooth?
- Are questions relevant to your topic?
- Are explanations helpful?
- Does history work correctly?
- Any bugs or confusing parts?

## Feedback

Please note:
- What you liked
- What confused you
- Any bugs encountered
- Suggestions for improvement

Send feedback to: [your email]

Thank you! 🙏
```

---

## 9.10 Rollback Plan

### If Deployment Fails

**GitHub Pages:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or checkout previous working commit
git log --oneline
git checkout <previous-commit-hash>
git push origin main --force  # Use with caution
```

**Netlify:**
- Go to Deploys
- Find previous successful deploy
- Click "Publish deploy"

---

## 9.11 Deployment Troubleshooting

### Common Issues

**1. 404 on page reload**
- **Cause**: Server doesn't know about SPA routes
- **Fix**: Configure server redirects or use hash routing (we use hash routing)

**2. Assets not loading**
- **Cause**: Wrong base path in vite.config.js
- **Fix**: Verify `base: '/app/'` matches repository name

**3. Service worker not updating**
- **Cause**: Old service worker cached
- **Fix**: Increment CACHE_NAME in sw.js, clear browser cache

**4. Manifest not loading**
- **Cause**: Wrong path in index.html
- **Fix**: Verify manifest path includes base path

**5. Icons not showing**
- **Cause**: Icons not in dist/ folder
- **Fix**: Ensure icons copied during build (check vite.config.js)

---

## Checkpoint Questions

**Q1**: Why do we need different base paths for local development vs production?

<details>
<summary>Answer</summary>

**Local**: Base is `/` (root of localhost:3000)
**GitHub Pages**: Base is `/app/` (subdirectory)

If we don't set the base path correctly:
- Assets won't load (404 errors)
- Routes won't work properly
- Service worker can't find files

Vite's `base` config handles this automatically.
</details>

**Q2**: What's the difference between `npm run build` and `npm run dev`?

<details>
<summary>Answer</summary>

**Development** (`npm run dev`):
- Fast rebuilds
- Source maps included
- Console logs present
- Larger file sizes
- Hot module reload

**Production** (`npm run build`):
- Optimized bundle
- Minified code
- Console logs removed
- Smaller file sizes
- No hot reload (static files)
</details>

**Q3**: Why test the production build locally before deploying?

<details>
<summary>Answer</summary>

Catches issues that only appear in production:
- Minification breaking code
- Missing assets
- Wrong paths
- Service worker issues
- Performance problems

Finding bugs locally is faster than debugging in production.
</details>

---

## Hands-On Exercise

### Deploy QuizMaster

**Task**: Deploy working QuizMaster to production.

**Steps**:

1. **Pre-deployment checks**:
   - Run all tests
   - Build locally
   - Test built version
   - Check Lighthouse score

2. **Update deployment**:
   - Commit final changes
   - Push to main branch
   - Monitor GitHub Actions
   - Wait for deployment

3. **Verify production**:
   - Visit deployed site
   - Test all features
   - Install PWA
   - Test on mobile

4. **Document**:
   - Update README with live URL
   - Create tester instructions
   - Note any deployment issues

**Success Criteria**:
- ✅ Site deployed and accessible
- ✅ All features work
- ✅ PWA installable
- ✅ Lighthouse score 90+
- ✅ No console errors in production

---

## Next Steps

Once deployed:

**"I'm ready for Phase 10"** → We'll run user testing and gather feedback

**Issues found?** → Fix and redeploy

---

## Learning Notes

**Date Started**: ___________

**Deployment URL**: ___________

**Deployment Method**:
- [ ] GitHub Pages
- [ ] Netlify
- [ ] Other

**Issues Encountered**:
-
-

**Resolution**:
-
-

**Date Completed**: ___________
