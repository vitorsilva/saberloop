# Phase 50: Offline Mode Testing - Learning Notes

**Date Started:** December 29, 2024
**Status:** In Progress

---

## Session 1: Initial E2E Tests & Documentation

### What Was Done

1. **Created E2E test infrastructure:**
   - `tests/e2e/offline.spec.js` - Dedicated offline test file (5 tests)
   - `tests/e2e/helpers.js` - Shared test helper functions

2. **Captured baseline screenshots** documenting current offline UX:
   - `phase50-online-baseline.png` - Normal online state
   - `phase50-offline-banner.png` - Offline banner and disabled button
   - `phase50-offline-settings.png` - Settings page while offline
   - `phase50-offline-quiz-replay.png` - Quiz replay from IndexedDB
   - `phase50-online-recovered.png` - State after connection restored

---

## Offline Behavior Documentation

### Visual Indicators

| State | Network Indicator | Banner | Start Quiz Button |
|-------|------------------|--------|-------------------|
| Online | Green dot (bottom-right) | Hidden | Enabled (blue) |
| Offline | Orange dot (bottom-right) | Visible (orange) | Disabled (gray) |

### Offline Banner

- **Location:** Below "Welcome back!" heading, above "Start New Quiz" button
- **Icon:** `wifi_off` material icon
- **Message:** "You're offline. You can replay saved quizzes below."
- **Color:** Orange/brown background

### Features Available Offline

| Feature | Works Offline? | Notes |
|---------|---------------|-------|
| View home page | Yes | All cached via service worker |
| View quiz history | Yes | Data from IndexedDB |
| Replay saved quizzes | Yes | Questions stored in IndexedDB |
| Navigate between views | Yes | SPA routing works offline |
| Change settings | Yes | Settings stored locally |
| Change language | Yes | Translations bundled |
| Start new quiz | No | Requires OpenRouter API |
| Connect to OpenRouter | No | Requires OAuth flow |
| Get AI explanations | No | Requires OpenRouter API |

### Connection State Transitions

**Going Offline:**
1. Browser fires `offline` event
2. `network.js` detects change via `navigator.onLine`
3. Banner becomes visible (removes `hidden` class from `#offlineBanner`)
4. Start Quiz button disabled
5. Network indicator changes to orange

**Going Online:**
1. Browser fires `online` event
2. `network.js` detects change
3. Banner hidden (adds `hidden` class)
4. Start Quiz button re-enabled
5. Network indicator changes to green

---

## E2E Tests Created

### `tests/e2e/offline.spec.js`

| Test | Description | Status |
|------|-------------|--------|
| `should show offline banner when connection is lost` | Verifies banner appears when offline | Pass |
| `should hide offline banner when connection is restored` | Verifies banner hides when online | Pass |
| `should handle rapid offline/online toggling gracefully` | Tests 5x rapid toggle stability | Pass |
| `should allow navigation to all views while offline` | Tests Settings, History, Home nav | Pass |
| `should complete a sample quiz while offline` | Full quiz flow using sample data | Pass |

### Test Helpers (`tests/e2e/helpers.js`)

- `setupAuthenticatedState(page)` - Sets up IndexedDB with API key and welcome flag
- `clearSessions(page)` - Clears quiz sessions for clean state

---

## Key Learnings

### 1. Playwright Offline Simulation

```javascript
// context.setOffline() controls network at browser level
await context.setOffline(true);  // Simulate offline
await context.setOffline(false); // Restore connection

// Different from page - context affects the whole browser session
// page = single tab/DOM, context = browser session/network
```

### 2. CSS Class-Based Visibility

The app uses CSS classes for offline banner visibility:
```javascript
// Check banner is hidden (has 'hidden' class)
await expect(offlineBanner).toHaveClass(/hidden/);

// Check banner is visible (doesn't have 'hidden' class)
await expect(offlineBanner).not.toHaveClass(/hidden/);
```

### 3. Test File Isolation

Initially imported helpers from `app.spec.js`, but this caused Playwright to run both files (38 tests instead of 4). Solution: extract helpers to non-`.spec.js` file.

### 4. Sample Quizzes Enable Offline Testing

Sample quizzes are pre-loaded on first launch, stored in IndexedDB. This allows testing the full quiz flow offline without needing API mocking.

---

## Screenshots

All screenshots saved to: `docs/learning/epic04_saberloop_v1/screenshots/`

| Screenshot | Description |
|------------|-------------|
| `phase50-online-baseline.png` | Home page in online state |
| `phase50-offline-banner.png` | Home page with offline banner visible |
| `phase50-offline-settings.png` | Settings page while offline |
| `phase50-offline-quiz-replay.png` | Quiz replay working offline |
| `phase50-online-recovered.png` | Home page after connection restored |

---

## Remaining Work

### Phase 1 (Documentation)
- [x] Capture screenshots
- [x] Document current behavior

### Phase 2 (Unit Tests)
- [ ] Add edge case tests to `network.test.js`
- [ ] Test rapid toggling at unit level
- [ ] Test missing DOM elements

### Phase 3 (E2E Tests)
- [x] Connection transitions (5 tests)
- [ ] Mid-operation connection loss
- [ ] Visual regression tests

### Phase 4 (JSDoc)
- [ ] Add JSDoc to `src/utils/network.js`

### Phase 5 (i18n)
- [ ] Audit offline message translation keys
- [ ] Verify translations exist

### Phase 6 (Architecture)
- [ ] Run `npm run arch:test`
- [ ] Verify network module compliance

---

## Next Session

Continue with **Phase 2: Unit Test Edge Cases** - add tests for rapid connection toggling and error handling in `network.test.js`.

---

**Last Updated:** December 29, 2024
