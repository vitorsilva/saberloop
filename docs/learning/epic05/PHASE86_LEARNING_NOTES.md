# Phase 86: Mutation Testing Wave 2 - Learning Notes

## Session: 2026-01-05

### Setup
- Created feature branch: `feature/phase86-mutation-testing-wave2`
- Starting mutation testing expansion to core infrastructure modules

### Progress

| Step | Description | Status |
|------|-------------|--------|
| 1 | Setup Branch and Initial Config | ✅ Complete |
| 2 | Run Baseline Mutation Testing | ✅ Complete |
| 3 | Analyze Core Module Mutations | ✅ Complete |
| 4 | Strengthen Tests for state.js | ✅ Complete |
| 5 | Strengthen Tests for db.js | ✅ Complete |
| 6 | Strengthen Tests for settings.js | ✅ Complete |
| 7 | Strengthen Tests for features.js | ✅ Complete |
| 8 | Wave 2 Checkpoint | ⬜ Not Started |

### Baseline Scores (Step 2)

**Overall: 69.71%** (target: >75%)

| Module | Mutants | Killed | Survived | No Cov | Score |
|--------|---------|--------|----------|--------|-------|
| state.js | 28 | 0 | 0 | 28 | 0.00% |
| db.js | 126 | 64 | 16 | 28 | 59.26% |
| settings.js | 28 | 18 | 4 | 6 | 64.29% |
| features.js | 46 | 25 | 19 | 2 | 54.35% |

**Wave 1 (maintained):**
| Module | Score |
|--------|-------|
| data-service.js | 100% |
| formatters.js | 100% |
| gradeProgression.js | 100% |
| shuffle.js | 93.55% |
| storage.js | 83.33% |

### Scores After state.js Tests (Step 4)

| Module | Before | After | Change |
|--------|--------|-------|--------|
| state.js | 0.00% | 88.89% | +88.89% |
| **Overall** | 69.71% | 76.90% | +7.19% |

**Crossed 75% target!**

### Scores After db.js Tests (Step 5)

| Module | Before | After | Change |
|--------|--------|-------|--------|
| db.js | 58.33% | 81.98% | +23.65% |
| **Overall** | 76.90% | 82.48% | +5.58% |

### Scores After settings.js Tests (Step 6)

| Module | Before | After | Change |
|--------|--------|-------|--------|
| settings.js | 64.29% | 87.50% | +23.21% |
| **Overall** | 82.48% | 84.02% | +1.54% |

### Scores After features.js Tests (Step 7)

| Module | Before | After | Change |
|--------|--------|-------|--------|
| features.js | 54.55% | 59.57% | +5.02% |
| **Overall** | 84.02% | 84.59% | +0.57% |

NoCoverage mutants eliminated (2 → 0). Remaining survivors are string literals in `FEATURE_FLAGS` object (descriptions) which aren't worth testing.

### Difficulties & Solutions

1. **Test isolation with fake-indexeddb** - New test suites were getting leftover sessions from previous tests. `indexedDB.deleteDatabase()` wasn't sufficient because the db module caches connections.
   - **Fix**: Use `clearAllUserData()` + `deleteSampleSessions()` in `beforeEach` for clean slate.

2. **localStorage mocking in jsdom/happy-dom** - Direct assignment `localStorage.setItem = vi.fn()` doesn't work. Also had test pollution from "corrupted JSON" test affecting error path tests.
   - **Root cause**: `localStorage` is a special object; direct method assignment doesn't intercept calls properly. The prototype chain is what gets called.
   - **Failed approaches**:
     - `localStorage.setItem = vi.fn()` - Doesn't intercept calls
     - Without `localStorage.clear()` - Previous test's corrupted data triggers wrong error
   - **Fix**: Use `vi.spyOn(Storage.prototype, 'setItem').mockImplementation()` to intercept at prototype level. Also `localStorage.clear()` at test start to prevent pollution.

### Learnings

1. **No-coverage files have the highest impact** - Adding tests to state.js (which had 0% coverage) gave us +7% overall improvement in one step.

2. **Singleton testing pattern** - When testing a singleton, must reset state in `beforeEach` to avoid test pollution. Also need to clear listeners array manually since there's no `unsubscribe` method.

3. **Find uncovered functions first** - The mutation report's "NoCoverage" mutants point directly to untested code. Adding tests for `updateQuestionExplanation` and `deleteSampleSessions` boosted db.js from 58% to 82%.

4. **Know when to stop** - Some mutants (string literals in error messages, object shapes in logs) aren't worth killing. Testing that `logger.error('exact message')` was called is testing implementation, not behavior. Added error path tests to settings.js but didn't chase logging details.

5. **Mock at the prototype level** - For browser APIs like `localStorage`, use `vi.spyOn(Storage.prototype, 'setItem')` instead of direct method replacement. This properly intercepts all calls through the prototype chain.
