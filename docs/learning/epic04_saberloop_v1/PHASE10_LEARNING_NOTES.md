# Phase 10 Learning Notes - OpenRouter Onboarding UX

## Session Log

### Session 1 - December 21, 2024

**What we accomplished:**

1. **Phase 1: Foundation**
   - Created feature flag system (`src/core/features.js`) with 3 phases:
     - `DISABLED` - Code deployed but not active
     - `SETTINGS_ONLY` - Available only in Settings page
     - `ENABLED` - Available everywhere
   - Created `OpenRouterGuideView.js` shell
   - Created `ConnectionConfirmedView.js` shell
   - Registered new routes: `/setup-openrouter`, `/connection-confirmed`
   - Added 6 unit tests for feature flag logic

2. **Phase 2: OpenRouter Guide UI**
   - Built full guide view with:
     - Hero section ("Create your free account")
     - "Free Access" info box
     - 4 step cards with icons
     - Step 3 highlighted with warning box
     - Primary CTA buttons (top and fixed bottom)
     - "I'll do it later" link
   - Added OpenRouter screenshots for steps 2, 3, 4
   - Images stored in `public/images/onboarding/`

3. **Phase 3: Integration & Routing**
   - Updated SettingsView to use feature flag
   - Updated WelcomeView to use feature flag
   - Updated HomeView to use feature flag (user caught this missing from initial plan!)
   - Updated OAuth callback in main.js to redirect to ConnectionConfirmed

**Key learnings:**

1. **Feature flags enable safe deployment**
   - Deploy code without activating it, then gradually enable
   - Critical for apps with real users (we're in closed testing)
   - Can roll back instantly by changing flag phase
   - Hand-rolled solution works well for simple use cases (no need for external libraries)

2. **Three-phase rollout pattern**
   - `DISABLED` → `SETTINGS_ONLY` → `ENABLED`
   - Test with power users first (Settings), then roll out everywhere
   - Each phase gives confidence before expanding

3. **Context-aware feature flags**
   - Same flag can behave differently based on where it's checked
   - `isFeatureEnabled('OPENROUTER_GUIDE', 'settings')` vs `'welcome'` vs `'home'`
   - Enables granular control over rollout

4. **Always trace all entry points to a feature**
   - Initially missed HomeView's "Generate Quiz" button
   - User caught this before we moved on
   - Lesson: Before integrating a new flow, map ALL paths that lead to the old flow

5. **Check the plan before adding work**
   - User asked "did you check if E2E tests were in the plan?"
   - E2E tests are in Phase 5, not Phase 3
   - Lesson: Follow the plan structure, don't jump ahead

6. **Validate imports before providing code**
   - Initially provided `startOAuthFlow` but the actual export was `startAuth`
   - Caused runtime error that blocked the entire app
   - Lesson: Always read existing code before suggesting imports

**Files created/modified:**

| File | Type | Purpose |
|------|------|---------|
| `src/core/features.js` | New | Feature flag system |
| `src/core/features.test.js` | New | Unit tests for feature flags |
| `src/views/OpenRouterGuideView.js` | New | Step-by-step guide UI |
| `src/views/ConnectionConfirmedView.js` | New | Success celebration screen |
| `src/main.js` | Modified | Routes + OAuth callback |
| `src/views/SettingsView.js` | Modified | Feature flag integration |
| `src/views/WelcomeView.js` | Modified | Feature flag integration |
| `src/views/HomeView.js` | Modified | Feature flag integration |
| `public/images/onboarding/*.png` | New | Step screenshots |

**Current status:**
- Phases 1-5 complete
- Feature flag set to `ENABLED`
- All 26 E2E tests passing (18 existing + 8 new)

---

### Session 2 - December 21, 2024 (continued)

**What we accomplished:**

4. **Phase 4: ConnectionConfirmed Polish**
   - Updated benefits list (removed "Unlimited quiz generations" - inaccurate)
   - Verified success screen displays correctly

5. **Phase 5: E2E Tests**
   - Created `tests/e2e/openrouter-guide.spec.js` with 8 tests:
     - Settings → Guide navigation
     - Home → Guide (when unauthenticated)
     - Welcome → Guide navigation
     - "I'll do it later" returns to home
     - Back button navigation
     - All 4 step cards display
     - ConnectionConfirmed success screen
     - Start Quiz button navigation
   - Created helper functions for test state management:
     - `setupUnauthenticatedState()` - clears API key, marks welcome seen
     - `markWelcomeSeen()` - for direct route testing

**Key learnings:**

7. **E2E test state management with IndexedDB**
   - Can't just navigate to routes - need to set up proper database state first
   - IndexedDB operations are async and need proper transaction handling
   - Wait for database close before navigating to ensure state is persisted
   ```javascript
   const request = indexedDB.open(dbName, 1);
   request.onsuccess = () => {
     const db = request.result;
     const transaction = db.transaction(['settings'], 'readwrite');
     // ... operations
     transaction.oncomplete = () => {
       db.close();  // IMPORTANT: close before resolving
       resolve();
     };
   };
   ```

8. **Feature flag debugging**
   - When E2E tests fail unexpectedly, check feature flag phase
   - Tests showed ConnectModal instead of Guide because flag was `SETTINGS_ONLY`
   - Context-aware flags (`'settings'` vs `'home'`) can cause subtle test failures
   - Fix: Ensure flag phase matches expected behavior for all contexts

9. **Playwright waiting strategies**
   - Use `page.waitForLoadState('networkidle')` after navigation
   - Use specific selectors with `waitForSelector()` before assertions
   - Combine both for reliable tests:
   ```javascript
   await page.goto('/#/setup-openrouter');
   await page.waitForLoadState('networkidle');
   await page.waitForSelector('h2:has-text("Create your free account")', { timeout: 10000 });
   ```

10. **Test helper design patterns**
    - Create reusable helpers for common state setups
    - Each helper should be self-contained (navigate, modify state, navigate back)
    - Use descriptive names: `setupUnauthenticatedState` vs just `setup`

**Files created/modified:**

| File | Type | Purpose |
|------|------|---------|
| `tests/e2e/openrouter-guide.spec.js` | New | E2E tests for guide flows |
| `src/core/features.js` | Modified | Fixed phase to ENABLED |

**Commits made:**
1. `feat(onboarding): add feature flag system` (Phase 1)
2. `feat(onboarding): implement OpenRouterGuideView` (Phase 2)
3. `feat(onboarding): integrate guide with Settings, Welcome, Home` (Phase 3)
4. `feat(onboarding): polish ConnectionConfirmed view` (Phase 4)
5. `test(onboarding): add E2E tests for OpenRouter guide flows` (Phase 5)

---

### Session 3 - December 21, 2024 (PR & Deployment)

**What we accomplished:**

1. **Documentation Audit & Cleanup**
   - Discovered 54 files still referencing Netlify (outdated architecture)
   - Updated critical files: CLAUDE.md, README.md, CONTRIBUTING.md
   - Updated architecture docs: API_DESIGN.md, SYSTEM_OVERVIEW.md
   - Added deprecation notes to historical learning docs
   - Current architecture: FTP to saberloop.com + client-side OpenRouter (no Netlify)

2. **PR Creation & CI Debugging**
   - Created PR #18 for OpenRouter Onboarding UX feature
   - CI failed: 2 E2E tests failing in GitHub Actions but passing locally
   - Root cause #1: Feature flag was `SETTINGS_ONLY`, tests expected navigation from Home/Welcome
   - Root cause #2: IndexedDB state timing - CI environment needed `page.reload()` after state setup
   - Fix: Changed feature flag to `ENABLED` + added reload after IndexedDB modifications

3. **Production Deployment Fix**
   - Images returning 404 on production (saberloop.com/app/)
   - Root cause: Image paths used `/images/onboarding/` but app deploys to `/app/` subdirectory
   - Fix: Changed paths to `/app/images/onboarding/` in OpenRouterGuideView.js

**Key learnings:**

11. **Subdirectory deployment affects asset paths**
    - When app deploys to `domain.com/app/`, all absolute paths need `/app/` prefix
    - Compare: `/app/icons/icon-192x192.png` (WelcomeView - correct)
    - vs: `/images/onboarding/...` (OpenRouterGuideView - was broken)
    - Easy to miss when developing locally (Vite serves from root)
    - Lesson: Check how existing assets are referenced before adding new ones

12. **CI vs Local test timing differences**
    - Tests pass locally, fail in CI = usually timing/race conditions
    - IndexedDB state changes may not be visible to app immediately
    - Solution: Add `page.reload()` after modifying IndexedDB state
    ```javascript
    await setupUnauthenticatedState(page);
    await page.reload();  // Forces app to re-read IndexedDB
    await page.waitForLoadState('networkidle');
    ```
    - CI environments are often slower/more variable than local

13. **Feature flag phase affects test behavior**
    - `SETTINGS_ONLY` phase: feature works in Settings but NOT Home/Welcome
    - Tests clicking "Generate Quiz" on Home showed modal, not guide
    - Lesson: When E2E tests fail with wrong navigation, check feature flags first
    - Feature phase should match intended behavior for all tested contexts

14. **Documentation debt accumulates silently**
    - Project migrated from Netlify months ago, but 54 files still referenced it
    - Documentation and code can drift apart without breaking anything
    - Periodic audits help catch this: `grep -r "netlify" --include="*.md"`
    - Critical files (CLAUDE.md, README) should be accurate; learning notes can be historical

15. **Git branch awareness during hotfixes**
    - After PR merge, working directory returns to `main`
    - Easy to accidentally commit fixes to `main` instead of feature branch
    - Not wrong if PR is already merged, but be aware of current branch
    - `git branch --show-current` before committing

**Files created/modified:**

| File | Type | Purpose |
|------|------|---------|
| `src/core/features.js` | Modified | Changed phase to ENABLED |
| `src/views/OpenRouterGuideView.js` | Modified | Fixed image paths (/app/ prefix) |
| `tests/e2e/openrouter-guide.spec.js` | Modified | Added reload + better timeouts |
| `CLAUDE.md` | Modified | Updated architecture (no more Netlify) |
| `README.md` | Modified | Updated live demo URL |
| `docs/architecture/API_DESIGN.md` | Modified | Rewritten for OpenRouter |
| Multiple learning docs | Modified | Added deprecation notices |

**Commits made:**
1. `docs: update architecture docs to reflect current deployment` (PR #18)
2. `fix(e2e): resolve CI timing issues in OpenRouter guide tests`
3. `feat: enable OPENROUTER_GUIDE feature flag for all contexts`
4. `fix: correct image paths for OpenRouter guide screenshots`

---

## Summary

Phase 10 (OpenRouter Onboarding UX) is **complete and deployed**. The new onboarding flow provides:

1. **Feature flag system** - Safe gradual rollout capability (now ENABLED)
2. **Step-by-step guide** - Clear instructions with screenshots
3. **Multiple entry points** - Settings, Welcome, and Home all route to guide
4. **Success celebration** - ConnectionConfirmed screen after OAuth
5. **Full test coverage** - 8 E2E tests for all navigation paths

**Total test count:** 26 E2E tests (up from 18)

**Deployment notes:**
- Images must use `/app/` prefix for production (subdirectory deployment)
- Feature flag must be `ENABLED` for full functionality
- After build, deploy with `npm run build && npm run deploy`
