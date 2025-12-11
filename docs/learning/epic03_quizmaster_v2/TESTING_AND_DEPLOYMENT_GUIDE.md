# Epic 3 - Testing and Deployment Guide

**Purpose:** This guide applies to ALL phases of Epic 3. Every time you make code changes, follow this guide to ensure tests are updated and deployment works.

---

## Core Principles

### 1. Test-Driven Development
- ✅ **Before coding:** Write or update tests
- ✅ **During coding:** Run tests frequently
- ✅ **After coding:** Ensure all tests pass

### 2. Continuous Deployment
- ✅ **Every phase ends with deployment**
- ✅ **GitHub Actions must pass**
- ✅ **Production site must work**

### 3. No Broken Deployments
- ✅ **Never push broken code to main**
- ✅ **All tests must pass locally first**
- ✅ **Verify production build before deploying**

---

## Testing Checklist (Every Phase)

### Unit Tests

**When to update:**
- Adding new functions/utilities
- Adding new components/views
- Changing existing logic

**What to test:**
- ✅ Function inputs and outputs
- ✅ Edge cases (empty, null, invalid input)
- ✅ Error handling
- ✅ Data transformations
- ✅ Business logic

**Example test structure:**
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle happy path', () => {
    // Test normal operation
  });

  it('should handle edge cases', () => {
    // Test empty, null, undefined, etc.
  });

  it('should handle errors gracefully', () => {
    // Test error scenarios
  });
});
```

**Run unit tests:**
```bash
npm test
npm test -- --coverage  # With coverage report
```

**Success criteria:**
- ✅ All tests pass
- ✅ Coverage ≥ 70% (aim for ≥ 80%)
- ✅ No console errors

---

### E2E Tests

**When to update:**
- Adding new user flows
- Adding new pages/views
- Changing UI behavior
- Adding API endpoints

**What to test:**
- ✅ Complete user journeys
- ✅ Navigation flows
- ✅ Form submissions
- ✅ API interactions (mocked)
- ✅ Error states
- ✅ Offline behavior

**Example E2E test structure:**
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete user flow', async ({ page }) => {
    // 1. Navigate to feature
    // 2. Interact with UI
    // 3. Verify results
    // 4. Check state persistence
  });

  test('should handle errors', async ({ page }) => {
    // Test error scenarios
  });

  test('should work offline', async ({ page, context }) => {
    // Test offline capability
  });
});
```

**Run E2E tests:**
```bash
npm run test:e2e
npm run test:e2e:ui  # Interactive mode
```

**Success criteria:**
- ✅ All E2E tests pass
- ✅ No flaky tests
- ✅ Tests run in < 2 minutes

---

## Deployment Checklist (Every Phase)

### Step 1: Local Development Verification

```bash
# Start dev server
npm run dev

# Manual testing checklist:
# □ New features work correctly
# □ Existing features still work (regression test)
# □ No console errors
# □ Responsive on mobile (resize browser)
# □ All navigation works
# □ Data persists correctly (IndexedDB, localStorage)

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# All tests must pass ✅
```

**Fix any failing tests before proceeding!**

---

### Step 2: Production Build Verification

```bash
# Clean previous build
rm -rf dist

# Build for production
npm run build

# Verify build succeeded
ls -la dist/

# Expected files:
# ✅ index.html
# ✅ assets/*.js (hashed filenames)
# ✅ assets/*.css (hashed filenames)
# ✅ manifest.json
# ✅ sw.js (or service worker files)
# ✅ netlify/functions/*.js

# Preview production build
npm run preview

# Manual testing in preview:
# □ All features work
# □ Service worker registers (Phase 2+)
# □ Offline mode works (Phase 2+)
# □ API calls work (Phase 1+)
# □ Settings persist (Phase 3+)
# □ No console errors
# □ Performance is good (no lag)
```

**Fix any production issues before deploying!**

---

### Step 3: Update Documentation

**Before committing, update:**

1. **Phase Learning Notes** (if exists)
   - Document what you learned
   - Note any challenges
   - Record solutions

2. **CHANGELOG.md** (if exists)
   ```markdown
   ## [Unreleased]

   ### Added
   - Feature X
   - Feature Y

   ### Changed
   - Updated Z

   ### Fixed
   - Bug A
   ```

3. **Code Comments**
   - Add JSDoc comments to new functions
   - Update existing comments if behavior changed
   - Document complex logic

---

### Step 4: Git Commit and Push

```bash
# Stage changes
git add .

# Check what's being committed
git status
git diff --staged

# Verify no sensitive data (API keys, secrets)
# Verify .env is NOT staged

# Commit with descriptive message
git commit -m "feat(phase3): add settings page with API key management

- Created SettingsView component
- Added API key validation
- Implemented localStorage persistence
- Updated navigation to include settings
- Added unit and E2E tests
- All tests passing ✅
"

# Push to GitHub
git push origin main
```

**Commit message format:**
- `feat(phaseN): description` - New feature
- `fix(phaseN): description` - Bug fix
- `test(phaseN): description` - Test updates
- `docs(phaseN): description` - Documentation
- `refactor(phaseN): description` - Code refactoring

---

### Step 5: Monitor GitHub Actions

**After pushing:**

1. Go to GitHub repository
2. Click "Actions" tab
3. Watch workflow run

**CI/CD pipeline should:**
- ✅ Install dependencies
- ✅ Run unit tests
- ✅ Run E2E tests
- ✅ Build project
- ✅ Verify build artifacts
- ✅ Deploy to Netlify (on main branch)

**If pipeline fails:**
1. Click on failed step
2. Read error logs
3. Fix issue locally
4. Run tests locally to verify fix
5. Commit and push again

**Do not skip failed CI checks!**

---

### Step 6: Verify Netlify Deployment

**After successful GitHub Actions run:**

1. Go to Netlify dashboard
2. Check latest deployment status
3. Click "Preview deploy" or production URL

**Production verification checklist:**

```bash
# Visit: https://your-app.netlify.app

# Manual testing on production:
# □ Homepage loads without errors
# □ All navigation works
# □ New features work correctly
# □ Existing features still work
# □ Offline mode works (Phase 2+)
# □ Service worker registered (Phase 2+)
# □ API endpoints work (Phase 1+)
# □ Settings persist (Phase 3+)
# □ Mobile responsive
# □ No console errors
# □ Performance is acceptable
```

**Test in multiple browsers:**
- ✅ Chrome
- ✅ Firefox
- ✅ Safari (if available)
- ✅ Mobile browser (real device if possible)

---

### Step 7: Mobile Device Testing

**At minimum, test on:**
- Android Chrome (real device or emulator)
- iOS Safari (real device or emulator)

**Mobile testing checklist:**
```
# □ App loads quickly
# □ Touch interactions work
# □ Responsive layout (no horizontal scroll)
# □ PWA install works
# □ Installed app works (Phase 2+)
# □ Offline mode works (Phase 2+)
# □ Keyboard doesn't break layout
# □ Forms are accessible
```

---

## Phase-Specific Testing Requirements

### Phase 1: Backend Integration

**Critical tests:**
- ✅ Netlify Functions respond correctly
- ✅ API key environment variable is set
- ✅ CORS headers present
- ✅ Input validation works
- ✅ Error handling robust
- ✅ Real API calls work (not just mocks)

**Deployment critical:**
- ✅ Environment variables set in Netlify
- ✅ Functions deployed successfully
- ✅ Health check endpoint responds
- ✅ Can generate real questions

---

### Phase 2: Offline Capabilities

**Critical tests:**
- ✅ Service worker registers
- ✅ Precaching works
- ✅ Runtime caching works
- ✅ Offline fallback shows
- ✅ Lighthouse PWA score = 100/100

**Deployment critical:**
- ✅ sw.js generated in build
- ✅ Workbox files present
- ✅ Offline works on production
- ✅ PWA installable

---

### Phase 3: UI Polish

**Critical tests:**
- ✅ Settings page accessible
- ✅ API key validation works
- ✅ Settings persist (localStorage)
- ✅ Home page shows quiz history
- ✅ Navigation simplified
- ✅ Mobile responsive

**Deployment critical:**
- ✅ Settings work on production
- ✅ LocalStorage not blocked
- ✅ No CSP issues

---

### Phase 3.5: Branding & Identity

**Critical tests:**
- ✅ App name updated in manifest.json
- ✅ Custom icons load correctly (192x192, 512x512)
- ✅ No "demo-pwa-app" references in code
- ✅ PWA installs with new branding
- ✅ Browser tab shows correct title
- ✅ Installed app shows correct name/icon

**Deployment critical:**
- ✅ Manifest.json deployed with new branding
- ✅ Icon files present at correct paths
- ✅ Cache cleared to show new branding
- ✅ Theme colors applied

---

### Phase 4: Observability

**Critical tests:**
- ✅ Logger works
- ✅ Error handler catches errors
- ✅ Performance marks recorded
- ✅ No sensitive data in logs

**Deployment critical:**
- ✅ Logs visible in production
- ✅ Errors tracked
- ✅ Analytics working (if implemented)

---

### Phase 5: Project Structure

**Critical tests:**
- ✅ All existing tests still pass
- ✅ Documentation up to date
- ✅ README accurate

**Deployment critical:**
- ✅ Build process unchanged
- ✅ All imports still work
- ✅ No broken links in docs

---

### Phase 6: Validation

**Critical tests:**
- ✅ User feedback collected
- ✅ Bug tracking works
- ✅ Iteration plan clear

**Deployment critical:**
- ✅ Each iteration deploys successfully
- ✅ Users can access production site
- ✅ Feedback mechanism works

---

## Common Issues and Solutions

### Tests Failing Locally

**Problem:** Tests fail on your machine

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear test cache
npm test -- --clearCache

# Run tests in watch mode to debug
npm test -- --watch

# Check for environment issues
node --version  # Should be 18+
npm --version
```

---

### Tests Pass Locally But Fail in CI

**Problem:** Tests pass locally but fail in GitHub Actions

**Solution:**
- Check Node version matches (18+)
- Check environment variables
- Look for timing issues (add waits in E2E)
- Check for port conflicts
- Review CI logs carefully

---

### Build Fails

**Problem:** `npm run build` fails

**Solution:**
```bash
# Check for TypeScript errors (if using TS)
npm run type-check

# Check for linting errors
npm run lint

# Clear Vite cache
rm -rf node_modules/.vite

# Check build logs for specific error
npm run build 2>&1 | tee build.log
```

---

### Deployment Succeeds But Site Broken

**Problem:** GitHub Actions passes, but production site doesn't work

**Solution:**
- Check browser console for errors
- Verify environment variables in Netlify
- Check Netlify function logs
- Verify service worker isn't caching old version
- Hard refresh (Ctrl+Shift+R)
- Check Network tab for failed requests

---

### Service Worker Not Updating

**Problem:** Changes not appearing on production (old version cached)

**Solution:**
```bash
# In DevTools → Application → Service Workers:
# 1. Check "Update on reload"
# 2. Click "Unregister"
# 3. Hard refresh (Ctrl+Shift+R)
# 4. Clear all site data

# Or programmatically skip waiting:
# Add to vite.config.js PWA config:
workbox: {
  skipWaiting: true,
  clientsClaim: true
}
```

---

### E2E Tests Flaky

**Problem:** E2E tests pass sometimes, fail sometimes

**Solution:**
```javascript
// Add proper waits
await page.waitForLoadState('networkidle');
await page.waitForSelector('text=Expected content');

// Increase timeouts for slow operations
await page.click('button', { timeout: 10000 });

// Use retry logic for flaky assertions
await expect(async () => {
  const text = await page.textContent('.result');
  expect(text).toBe('Expected');
}).toPass({ timeout: 5000 });
```

---

## Lighthouse Testing (Phase 2+)

### Run Lighthouse Locally

```bash
# Build production
npm run build

# Serve
npx serve dist -p 8080

# In Chrome:
# 1. Open http://localhost:8080
# 2. DevTools → Lighthouse tab
# 3. Select: Mobile, PWA category
# 4. Click "Analyze page load"
```

**Target scores (Phase 2+):**
- PWA: 100/100 ✅
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

---

## Final Pre-Deployment Checklist

Before marking any phase as complete:

- [ ] All unit tests pass locally
- [ ] All E2E tests pass locally
- [ ] Production build works locally
- [ ] Manual testing complete
- [ ] Code reviewed (self-review)
- [ ] Documentation updated
- [ ] Commit message descriptive
- [ ] GitHub Actions passes
- [ ] Netlify deploys successfully
- [ ] Production site works
- [ ] Mobile testing complete
- [ ] No console errors in production
- [ ] Performance acceptable
- [ ] Phase learning notes updated

**Only proceed to next phase when ALL boxes checked ✅**

---

## Getting Help

**If stuck:**
1. Check error logs carefully
2. Search GitHub issues
3. Check Epic 01/02 learning notes
4. Review Netlify/Vite documentation
5. Ask for help (provide error logs)

**When reporting issues:**
- Include error message
- Include relevant code
- Include steps to reproduce
- Include what you've tried

---

**Remember:** Testing and deployment are NOT optional. They're integral to each phase!

**Last Updated:** 2025-11-20
