# Phase 50: Offline Mode Testing - Comprehensive Quality Assurance

**Epic:** 4 - Saberloop V1
**Phase:** 50 - Offline Mode Testing
**Status:** Ready to Implement
**Estimated Time:** 4-6 sessions
**Prerequisites:** Phase 2 (Epic 01) complete, Phase 25 (Services Layer) complete

---

## Overview

This phase focuses on **thoroughly testing offline functionality** to ensure an excellent user experience when the app is used without an internet connection. While offline support was a core focus in Epic 01 (Phase 2), the feature has not been systematically validated as the app evolved through Epics 02-04.

**What you'll achieve:**
- Comprehensive offline test coverage (unit + E2E)
- Visual documentation of offline UX (before/after screenshots)
- Verified architecture compliance for offline-related code
- Full i18n support for offline messages
- JSDoc documentation for offline utilities
- Confidence that offline mode works reliably

**Why this matters:**
- PWA's primary value proposition is offline capability
- Users expect seamless experience when connection drops
- Quiz replay feature requires robust offline storage
- Mobile users frequently experience connectivity issues

---

## Current State Analysis

### What Works Offline (Implemented in Epic 01-03)

| Feature | Status | Location |
|---------|--------|----------|
| App shell loading | ✅ Working | Service Worker (Workbox) |
| Static asset caching | ✅ Working | `vite.config.js` PWA plugin |
| Online/offline detection | ✅ Working | `src/utils/network.js` |
| Offline status indicator | ✅ Working | Network status dot (green/orange) |
| Offline banner | ✅ Working | Homepage "You're offline" message |
| Quiz replay from IndexedDB | ✅ Working | `src/core/db.js` |
| Disable quiz generation button | ✅ Working | `updateOfflineUI()` |

### What Requires Connection

| Feature | Reason |
|---------|--------|
| Generate new quizzes | Requires OpenRouter API |
| Initial OAuth connection | Requires OpenRouter OAuth |
| Get AI explanations | Requires OpenRouter API |
| Model list refresh | Requires OpenRouter /models API |

### Existing Test Coverage

**Unit Tests** (`src/utils/network.test.js`):
- ✅ `isOnline()` returns correct status
- ✅ `updateNetworkIndicator()` sets correct classes
- ✅ `updateOfflineUI()` shows/hides banner, disables buttons
- ✅ Event listener registration
- ✅ `initNetworkMonitoring()` initialization
- ✅ Error handling for missing DOM elements

**E2E Tests** (`tests/e2e/app.spec.js`):
- ✅ Basic offline mode test (lines 557-627)
- ✅ Banner appears when offline
- ✅ Button disabled when offline
- ✅ Quiz replay works offline
- ✅ UI returns to normal when online

### Gaps Identified

1. **No visual regression testing** - No screenshots documenting expected UI
2. **Limited scenario coverage** - Only basic "go offline, go online" tested
3. **No stress testing** - What happens with rapid offline/online toggling?
4. **No edge case testing** - Mid-quiz connection loss, mid-API-call disconnection
5. **No i18n verification** - Offline messages not tested in other languages
6. **No JSDoc** - Network utilities lack type documentation
7. **Architecture compliance** - Not verified for offline code paths

---

## Learning Objectives

By the end of this phase, you will:

1. **Master offline testing patterns**
   - Playwright offline simulation (`context.setOffline()`)
   - Vitest mocking for `navigator.onLine`
   - Edge case scenario design

2. **Implement visual regression testing**
   - Screenshot capture with Playwright
   - Before/after documentation
   - Baseline image management

3. **Apply JSDoc to network utilities**
   - Type definitions for network functions
   - Document expected behavior
   - IDE autocomplete for offline APIs

4. **Verify architecture compliance**
   - Ensure offline code follows layer boundaries
   - No circular dependencies in network module
   - Clean separation of concerns

5. **Ensure i18n completeness**
   - All offline messages translatable
   - Test offline UI in different languages
   - Verify locale-aware formatting

---

## Implementation Plan

### Phase 1: Documentation & Baseline (1 session)

**1.1 Capture Current State Screenshots**

Create visual documentation of current offline experience.

**Screenshots to capture:**

| Screenshot | Description | File |
|------------|-------------|------|
| `offline-banner.png` | Homepage with offline banner visible | `docs/issues/offline/` |
| `offline-indicator.png` | Header with orange status dot | `docs/issues/offline/` |
| `offline-button-disabled.png` | Start Quiz button in disabled state | `docs/issues/offline/` |
| `offline-quiz-replay.png` | Replaying saved quiz while offline | `docs/issues/offline/` |
| `online-normal.png` | Normal online state (baseline) | `docs/issues/offline/` |

**Playwright screenshot script:**

```javascript
// scripts/capture-offline-screenshots.js
import { chromium } from '@playwright/test';

async function captureOfflineScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:8888/');

  // Capture online baseline
  await page.screenshot({
    path: 'docs/issues/offline/online-normal.png',
    fullPage: true
  });

  // Go offline and capture
  await context.setOffline(true);
  await page.waitForTimeout(500); // Allow UI to update

  await page.screenshot({
    path: 'docs/issues/offline/offline-banner.png',
    fullPage: true
  });

  // ... more screenshots

  await browser.close();
}
```

**1.2 Document Expected Behavior**

Create `docs/issues/offline/OFFLINE_UX_SPEC.md`:

```markdown
# Offline User Experience Specification

## When User Goes Offline

1. **Immediate Visual Feedback** (< 500ms)
   - Status indicator: green → orange
   - Offline banner appears on homepage

2. **Feature Restrictions**
   - "Start Quiz" button: disabled
   - "Connect to OpenRouter" button: disabled
   - "Refresh Models" button: disabled

3. **Available Features**
   - Browse quiz history
   - Replay saved quizzes
   - View past results
   - Navigate between views
   - Change settings (except model selection)

## When User Goes Online

1. **Immediate Recovery** (< 500ms)
   - Status indicator: orange → green
   - Offline banner disappears

2. **Feature Restoration**
   - All buttons re-enabled
   - Can generate new quizzes
   - API calls resume
```

---

### Phase 2: Unit Test Expansion (1 session)

**2.1 New Unit Tests for Edge Cases**

```javascript
// src/utils/network.test.js - additions

describe('edge cases', () => {
  describe('rapid connection changes', () => {
    it('handles rapid online/offline toggling', async () => {
      // Simulate rapid toggling
      for (let i = 0; i < 10; i++) {
        Object.defineProperty(navigator, 'onLine', { value: i % 2 === 0 });
        window.dispatchEvent(new Event(i % 2 === 0 ? 'online' : 'offline'));
      }

      // Final state should be stable
      expect(/* final UI state */).toBe(/* expected */);
    });
  });

  describe('missing DOM elements', () => {
    it('gracefully handles missing offline banner', () => {
      document.body.innerHTML = ''; // No elements
      expect(() => updateOfflineUI()).not.toThrow();
    });

    it('gracefully handles missing start button', () => {
      document.body.innerHTML = '<div id="offline-banner"></div>';
      expect(() => updateOfflineUI()).not.toThrow();
    });
  });

  describe('initialization timing', () => {
    it('correctly detects offline state on init', () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      initNetworkMonitoring();
      expect(/* UI shows offline */).toBe(true);
    });
  });
});
```

**2.2 Coverage Goals**

| File | Current | Target |
|------|---------|--------|
| `src/utils/network.js` | ~80% | 100% |
| `src/core/db.js` (offline storage) | ~70% | 90% |
| `src/api/openrouter-client.js` (network errors) | ~85% | 95% |

---

### Phase 3: E2E Test Expansion (1-2 sessions)

**3.1 New E2E Test Scenarios**

```javascript
// tests/e2e/offline.spec.js - new file

import { test, expect } from '@playwright/test';

test.describe('Offline Mode', () => {

  test.describe('connection transitions', () => {
    test('shows offline banner immediately when connection lost', async ({ page, context }) => {
      await page.goto('/');
      await expect(page.locator('[data-testid="offline-banner"]')).not.toBeVisible();

      await context.setOffline(true);

      // Should appear within 500ms
      await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible({ timeout: 500 });
    });

    test('hides offline banner immediately when connection restored', async ({ page, context }) => {
      await page.goto('/');
      await context.setOffline(true);
      await expect(page.locator('[data-testid="offline-banner"]')).toBeVisible();

      await context.setOffline(false);

      // Should hide within 500ms
      await expect(page.locator('[data-testid="offline-banner"]')).not.toBeVisible({ timeout: 500 });
    });

    test('handles rapid offline/online toggling gracefully', async ({ page, context }) => {
      await page.goto('/');

      // Rapid toggling
      for (let i = 0; i < 5; i++) {
        await context.setOffline(true);
        await page.waitForTimeout(100);
        await context.setOffline(false);
        await page.waitForTimeout(100);
      }

      // Final state should be online
      await expect(page.locator('[data-testid="offline-banner"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="start-quiz-btn"]')).toBeEnabled();
    });
  });

  test.describe('quiz replay offline', () => {
    test('can start and complete saved quiz while offline', async ({ page, context }) => {
      // First, create a quiz while online
      await page.goto('/');
      // ... create quiz steps

      // Go offline
      await context.setOffline(true);

      // Navigate to history and replay
      await page.click('[data-testid="nav-history"]');
      await page.click('[data-testid="replay-quiz-btn"]');

      // Should be able to answer all questions
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="option-0"]');
        await page.click('[data-testid="next-btn"]');
      }

      // Should see results
      await expect(page.locator('[data-testid="results-view"]')).toBeVisible();
    });
  });

  test.describe('mid-operation connection loss', () => {
    test('handles connection loss while loading quiz', async ({ page, context }) => {
      await page.goto('/');

      // Start quiz generation
      await page.fill('[data-testid="topic-input"]', 'JavaScript');
      await page.click('[data-testid="start-quiz-btn"]');

      // Go offline during loading
      await context.setOffline(true);

      // Should show appropriate error
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/offline|connection/i);
    });
  });

  test.describe('navigation while offline', () => {
    test('can navigate to all views while offline', async ({ page, context }) => {
      await page.goto('/');
      await context.setOffline(true);

      // Navigate to Settings
      await page.click('[data-testid="nav-settings"]');
      await expect(page.locator('[data-testid="settings-view"]')).toBeVisible();

      // Navigate to History
      await page.click('[data-testid="nav-history"]');
      await expect(page.locator('[data-testid="topics-view"]')).toBeVisible();

      // Navigate back to Home
      await page.click('[data-testid="nav-home"]');
      await expect(page.locator('[data-testid="home-view"]')).toBeVisible();
    });
  });

  test.describe('visual regression', () => {
    test('offline UI matches expected design', async ({ page, context }) => {
      await page.goto('/');
      await context.setOffline(true);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('offline-homepage.png', {
        maxDiffPixels: 100
      });
    });
  });
});
```

**3.2 Test Coverage Targets**

| Scenario Category | Tests |
|-------------------|-------|
| Connection transitions | 5 |
| Quiz replay offline | 3 |
| Mid-operation connection loss | 3 |
| Navigation while offline | 2 |
| Visual regression | 3 |
| i18n offline messages | 2 |
| **Total New E2E Tests** | **18** |

---

### Phase 4: JSDoc Documentation (1 session)

**4.1 Add Type Definitions**

```javascript
// src/utils/network.js - with JSDoc

/**
 * @typedef {Object} NetworkState
 * @property {boolean} isOnline - Whether the browser reports being online
 * @property {Date} lastChecked - When the status was last verified
 */

/**
 * Check if the browser is currently online.
 *
 * Note: This only indicates network connectivity, not internet access.
 * A true value means connected to a network (WiFi, ethernet), but
 * the network may not have internet access (e.g., captive portal).
 *
 * @returns {boolean} True if navigator.onLine is true
 * @example
 * if (isOnline()) {
 *   await fetchData();
 * } else {
 *   showOfflineMessage();
 * }
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Update the visual network status indicator.
 *
 * Changes the status dot color:
 * - Online: Green (#10B981)
 * - Offline: Orange (#F59E0B)
 *
 * @param {HTMLElement} [element] - Optional element to update. Defaults to #network-status
 * @returns {void}
 * @example
 * // Auto-detect element
 * updateNetworkIndicator();
 *
 * // Specify element
 * updateNetworkIndicator(document.querySelector('.custom-status'));
 */
export function updateNetworkIndicator(element) {
  // implementation
}

/**
 * Update UI elements that should be disabled when offline.
 *
 * Affected elements:
 * - #offline-banner: Shown when offline, hidden when online
 * - #start-quiz-btn: Disabled when offline
 * - .requires-connection: All elements with this class
 *
 * @returns {void}
 * @fires window#offline-ui-updated - Dispatched after UI update complete
 */
export function updateOfflineUI() {
  // implementation
}

/**
 * Initialize network monitoring with event listeners.
 *
 * Sets up:
 * 1. Initial UI state based on current connection
 * 2. Event listeners for online/offline events
 * 3. Periodic connection verification (optional)
 *
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.periodicCheck=false] - Enable periodic verification
 * @param {number} [options.checkInterval=30000] - Interval in ms for periodic checks
 * @returns {Function} Cleanup function to remove listeners
 * @example
 * // Basic initialization
 * const cleanup = initNetworkMonitoring();
 *
 * // With periodic checks
 * const cleanup = initNetworkMonitoring({
 *   periodicCheck: true,
 *   checkInterval: 60000
 * });
 *
 * // Cleanup on unmount
 * cleanup();
 */
export function initNetworkMonitoring(options = {}) {
  // implementation
}
```

**4.2 Type Check Verification**

```bash
# Run typecheck to verify JSDoc types
npm run typecheck

# Expected output:
# ✓ No type errors found
```

---

### Phase 5: i18n Verification (0.5 session)

**5.1 Audit Offline Messages**

Ensure all user-facing offline messages are translatable:

| Key | English | Location |
|-----|---------|----------|
| `offline.banner` | "You're offline. Some features are unavailable." | HomeView |
| `offline.quizDisabled` | "Quiz generation requires an internet connection" | HomeView |
| `offline.settingsLimited` | "Some settings require an internet connection" | SettingsView |
| `offline.connectionRestored` | "Connection restored" | Toast/notification |
| `offline.retrying` | "Retrying connection..." | Loading states |

**5.2 Add Missing Translations**

```json
// public/locales/en/translation.json
{
  "offline": {
    "banner": "You're offline. Some features are unavailable.",
    "quizDisabled": "Quiz generation requires an internet connection",
    "settingsLimited": "Some settings require an internet connection",
    "connectionRestored": "Connection restored",
    "retrying": "Retrying connection..."
  }
}

// public/locales/pt-PT/translation.json
{
  "offline": {
    "banner": "Estás offline. Algumas funcionalidades estão indisponíveis.",
    "quizDisabled": "A geração de quizzes requer ligação à internet",
    "settingsLimited": "Algumas definições requerem ligação à internet",
    "connectionRestored": "Ligação restabelecida",
    "retrying": "A tentar ligar novamente..."
  }
}
```

**5.3 E2E Test for i18n Offline Messages**

```javascript
test('offline messages display in Portuguese', async ({ page, context }) => {
  // Set Portuguese locale
  await page.goto('/?lang=pt-PT');
  await context.setOffline(true);

  await expect(page.locator('[data-testid="offline-banner"]'))
    .toContainText('Estás offline');
});
```

---

### Phase 6: Architecture Verification (0.5 session)

**6.1 Verify Architecture Rules**

```bash
# Run architecture tests
npm run arch:test

# Expected: No violations in network module
```

**6.2 Verify No Circular Dependencies**

```bash
# Check specifically for network module
npx depcruise src/utils/network.js --output-type err

# Expected: No circular dependencies
```

**6.3 Verify Layer Boundaries**

Network utilities should:
- ✅ Be importable by views
- ✅ Be importable by services
- ❌ Not import from views
- ❌ Not import from API layer

---

## Success Criteria

### Unit Tests
- [ ] `src/utils/network.js` at 100% coverage
- [ ] All edge cases tested (rapid toggling, missing elements)
- [ ] 10+ new unit tests added

### E2E Tests
- [ ] 15+ new E2E tests for offline scenarios
- [ ] Visual regression tests with screenshots
- [ ] All tests pass in CI

### Documentation
- [ ] Before/after screenshots captured
- [ ] `OFFLINE_UX_SPEC.md` created
- [ ] JSDoc added to all network functions
- [ ] `npm run typecheck` passes

### i18n
- [ ] All offline messages have translation keys
- [ ] Translations added for pt-PT (and other languages)
- [ ] E2E test verifies translated messages

### Architecture
- [ ] `npm run arch:test` passes
- [ ] No circular dependencies in network module
- [ ] Layer boundaries respected

### Code Quality
- [ ] No dead code detected by Knip
- [ ] All existing tests still pass
- [ ] PR review approved

---

## Decision Matrix

### When to Implement This Phase

**✅ Proceed if:**
- [ ] Offline experience is a priority for users
- [ ] Want to ensure PWA quality standards
- [ ] Preparing for production launch
- [ ] Building confidence in app reliability
- [ ] Mobile users are a key demographic

**⏸️ Defer if:**
- [ ] Other features are higher priority
- [ ] App is used primarily online
- [ ] Limited testing resources
- [ ] Major refactoring planned soon

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `tests/e2e/offline.spec.js` | Dedicated offline E2E tests |
| `docs/issues/offline/OFFLINE_UX_SPEC.md` | UX specification |
| `docs/issues/offline/*.png` | Before/after screenshots |
| `scripts/capture-offline-screenshots.js` | Screenshot capture utility |

### Modified Files
| File | Changes |
|------|---------|
| `src/utils/network.js` | Add JSDoc documentation |
| `src/utils/network.test.js` | Add edge case tests |
| `public/locales/*/translation.json` | Add offline message keys |
| `tests/e2e/app.spec.js` | Extract offline tests to dedicated file |

---

## Estimated Effort

| Phase | Sessions | Focus |
|-------|----------|-------|
| Phase 1: Documentation & Baseline | 1 | Screenshots, UX spec |
| Phase 2: Unit Test Expansion | 1 | Edge cases, coverage |
| Phase 3: E2E Test Expansion | 1-2 | New scenarios, visual tests |
| Phase 4: JSDoc Documentation | 1 | Type definitions |
| Phase 5: i18n Verification | 0.5 | Translation audit |
| Phase 6: Architecture Verification | 0.5 | Arch tests |
| **Total** | **5-6** | |

---

## References

### Related Documentation
- [Phase 2 Learning Notes (Epic 01)](../epic01_infrastructure/PHASE2_LEARNING_NOTES.md) - Original offline implementation
- [Phase 80 Test Coverage](../epic04_saberloop_v1/PHASE80_TEST_COVERAGE.md) - Testing patterns
- [Architecture Rules](../../architecture/ARCHITECTURE_RULES.md) - Layer boundaries

### External Resources
- [Playwright Offline Testing](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline)
- [Service Worker Testing](https://web.dev/offline-ux/)
- [PWA Offline Patterns](https://web.dev/offline-cookbook/)

---

**Last Updated:** 2025-12-28
**Status:** Ready to Implement
**Location:** `docs/learning/epic04_saberloop_v1/PHASE50_OFFLINE_MODE_TESTING.md`
