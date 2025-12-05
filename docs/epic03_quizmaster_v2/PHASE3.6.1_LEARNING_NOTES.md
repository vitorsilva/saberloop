# Phase 3.6.1 Learning Notes: Sample Quizzes & Skip-Auth Flow

## Session 1 - December 2, 2025

### What We Built

Implemented the "skip auth" flow allowing users to explore the app without an OpenRouter API key upfront.

### Completed Tasks

1. **Sample Quiz Data** (`src/data/sample-quizzes.json`)
   - Created 8 pre-built quizzes covering various topics and difficulty levels
   - JSON format matches API response structure for consistency
   - Topics: Solar System, Animals & Geography, Basic Math, Cat Behavior, Marvel vs DC, Famous Scientists, Hit Songs, Economic Recessions

2. **Sample Loader Utility** (`src/utils/sample-loader.js`)
   - Loads samples into IndexedDB on first app launch
   - Version-based loading (only reloads when version changes)
   - Deletes old samples before loading new ones (prevents duplicates)

3. **Database Updates** (`src/db/db.js`)
   - Added `deleteSampleSessions()` function
   - Sample quizzes marked with `isSample: true` flag

4. **Welcome Version Utilities** (`src/utils/welcome-version.js`)
   - `shouldShowWelcome()` - checks if user has seen current welcome version
   - `markWelcomeSeen()` - marks welcome as seen in IndexedDB settings
   - Separate version from APP_VERSION (manually bumped for feature announcements)

5. **WelcomeView Updates** (`src/views/WelcomeView.js`)
   - Added "Skip for now" button
   - Calls `markWelcomeSeen()` then navigates to HomeView

6. **Main.js Routing Refactor** (`src/main.js`)
   - Routes are now stable (don't change based on state)
   - `/` always maps to HomeView
   - `/welcome` always maps to WelcomeView
   - Initial redirect to `/welcome` if `shouldShowWelcome()` returns true

7. **HomeView Score Display Fix** (`src/views/HomeView.js`)
   - Shows `--/5` instead of `null/5` for unplayed quizzes
   - Gray color for unplayed quizzes

8. **Connect Modal Component** (`src/components/ConnectModal.js`)
   - Modal prompting users to connect to OpenRouter
   - Appears when trying to generate new quiz without connection
   - Options: "Connect with OpenRouter" or "Cancel"

9. **HomeView Connection Check** (`src/views/HomeView.js`)
   - "Start New Quiz" button checks `isOpenRouterConnected()`
   - Shows ConnectModal if not connected

### Key Decisions

1. **Sample quizzes in JSON file, loaded to IndexedDB**
   - File is source of truth (easy to update)
   - Runtime access through IndexedDB (consistent with other data)
   - Avoids two different data access patterns

2. **Separate welcome version from app version**
   - App version changes on every build
   - Welcome version only bumped when we want to re-show welcome screen
   - Stored in IndexedDB settings (consistent with other settings)

3. **Stable routes with initial redirect**
   - Better than dynamically changing what `/` maps to
   - Routes are predictable
   - Skip flow works without page reload

4. **Connection check on "Start New Quiz" (not "Generate")**
   - Better UX to check early
   - Users don't waste time typing topic if they can't generate

### Files Created/Modified

| File | Action |
|------|--------|
| `src/data/sample-quizzes.json` | Created |
| `src/utils/sample-loader.js` | Created |
| `src/utils/welcome-version.js` | Created |
| `src/components/ConnectModal.js` | Created |
| `src/db/db.js` | Modified (added deleteSampleSessions) |
| `src/main.js` | Modified (samples loading, routing refactor) |
| `src/views/WelcomeView.js` | Modified (skip button) |
| `src/views/HomeView.js` | Modified (score display, connection check) |

### What's Next

- [x] Run E2E tests and fix any failures ✅ (Session 2)
- [ ] Test full user flows:
  - First-time user → WelcomeView → Skip → HomeView with samples
  - Returning user → HomeView directly
  - Unconnected user → Start New Quiz → ConnectModal
- [ ] Consider visual distinction for sample quizzes (badge?)

### Key Learnings

1. **Consistency matters** - Using IndexedDB for all settings instead of mixing localStorage keeps the codebase simpler

2. **Stable routes are easier** - Dynamic route mapping based on state creates complexity; redirects are cleaner

3. **Check early, fail early** - Connection check on "Start New Quiz" is better UX than checking after user enters topic

4. **Reuse existing patterns** - Sample quizzes use same JSON structure as API responses, allowing code reuse

---

## Session 2 - December 4, 2025

### What We Fixed

All E2E tests were failing after the Phase 3.6.1 changes. This session focused on fixing them.

### Root Causes Identified

1. **IndexedDB Access Requires Same-Origin Page**
   - `about:blank` doesn't allow IndexedDB access (SecurityError)
   - Tests must navigate to the app first before manipulating IndexedDB

2. **URL Persistence After Reload**
   - When page reloads while on `/#/welcome`, the app stays on that route
   - Even if `shouldShowWelcome()` would return false, the URL is already `/welcome`
   - Solution: Navigate explicitly to `/#/` instead of just reloading

3. **Wrong IndexedDB Key Name**
   - Initially used `welcome_version_seen` but the app uses `welcomeScreenVersion`
   - Key names must match exactly what the app expects

### Fixes Applied to `tests/e2e/app.spec.js`

1. **Rewrote `setupAuthenticatedState()` helper function**:
   ```javascript
   async function setupAuthenticatedState(page) {
     // Navigate to app first (will show welcome page initially)
     await page.goto('/');
     await page.waitForLoadState('networkidle');

     // Set IndexedDB data (app has already created the database)
     await page.evaluate(async () => {
       // Store openrouter_api_key and welcomeScreenVersion
       // ...
     });

     // Navigate explicitly to home (not just reload!)
     await page.goto('/#/');

     // Wait for home page
     await page.waitForSelector('h2:has-text("Welcome back!")');
   }
   ```

2. **Removed redundant `page.goto('/')` calls** from individual tests

3. **Added proper waits after `clearSessions()`** with reload and home page verification

### Debugging Process

Created a debug test to inspect IndexedDB state:
- BEFORE: Only `samplesVersion: "1.0"` existed
- AFTER setting data: Both `openrouter_api_key` and `welcomeScreenVersion` present
- AFTER RELOAD: Data persists correctly
- BUT URL was still `/#/welcome` - this revealed the real issue!

The key insight: **Data was being stored correctly, but the URL wasn't changing.** The app only checks `shouldShowWelcome()` on initial load, not on every route change.

### Video Recording for Documentation

Updated `playwright.config.js` to record videos for all tests:
```javascript
use: {
  video: 'on', // Record video for all tests (for documentation)
}
```

Videos are saved in `test-results/` directory as `.webm` files.

### Test Results

- **16/16 E2E tests passing**
- **78/78 unit tests passing**

### Files Modified

| File | Changes |
|------|---------|
| `tests/e2e/app.spec.js` | Rewrote setupAuthenticatedState, fixed all test patterns |
| `playwright.config.js` | Changed video from 'retain-on-failure' to 'on' |

### Key Learnings

1. **IndexedDB requires same-origin context** - Can't access IndexedDB from `about:blank`

2. **URL state matters in SPAs** - Reloading a page doesn't change its URL; you need explicit navigation

3. **Debug with visibility** - Writing a debug test to inspect actual IndexedDB state was crucial for finding the real issue

4. **Don't assume - verify** - The data WAS being stored correctly; the problem was elsewhere (URL routing)

5. **Test setup timing** - In E2E tests, the order of operations matters: navigate → setup data → navigate again

### Current Status

Phase 3.6.1 is now complete:
- Sample quizzes loading on first launch ✅
- Skip-auth flow working ✅
- E2E tests all passing ✅
- Video documentation generated ✅

### What's Next

- [ ] Manual testing of user flows
- [ ] Consider Phase 3.7 or other Epic 3 phases
- [ ] Review Epic 3 completion status
