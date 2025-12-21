# Phase 25: Services Layer Implementation

**Epic:** 4 - Saberloop V1
**Phase:** 25 - Services Layer Implementation
**Status:** Planning
**Estimated Sessions:** 8-12 sessions
**Prerequisites:** Phase 20 (Architecture Testing) complete

---

## Overview

This phase implements a **services layer** to fix the 9 architectural violations identified in Phase 20. We'll systematically change each warning rule to an error rule by refactoring the codebase one rule at a time.

**Goal:** Transform the high-coupling architecture into a low-coupling architecture with clear layer boundaries.

**Approach:** One rule at a time - fix violations, update tests, verify no dead code, then promote rule to error.

---

## Current Violations (from Phase 20)

| Rule | Severity | Count | Files |
|------|----------|-------|-------|
| `views-should-not-import-db` | warn | 4 | TopicsView, SettingsView, ResultsView, HomeView |
| `views-should-not-import-api` | warn | 3 | QuizView, OpenRouterGuideView, LoadingView |
| `components-should-not-import-api` | warn | 1 | ConnectModal |
| `api-should-not-import-db` | warn | 1 | api.real.js |

**Total:** 9 violations to fix

---

## Architecture Transformation

### Before (Current)

```
views/ ─────→ api/      (direct access)
       ─────→ db/       (direct access)
       ─────→ state/    (direct access)

components/ ─→ api/     (problem)
api/ ────────→ db/      (problem)
```

### After (Target)

```
views/ ─────→ services/ (only)
       ─────→ components/
       ─────→ utils/

services/ ──→ api/
          ──→ db/
          ──→ state/

components/ → (pure, callbacks only)
api/ ───────→ (receives credentials as params)
```

---

## Implementation Strategy

### Order of Execution

We'll fix rules in this order (easiest to hardest):

| Order | Rule | Why This Order |
|-------|------|----------------|
| 1 | `api-should-not-import-db` | Smallest scope (1 file), foundational change |
| 2 | `components-should-not-import-api` | Small scope (1 file), isolated component |
| 3 | `views-should-not-import-db` | Medium scope (4 files), requires services layer |
| 4 | `views-should-not-import-api` | Medium scope (3 files), builds on services layer |

### Per-Rule Process

For each rule, follow this process:

```
1. Create feature branch: fix/arch-rule-{rule-name}
2. Understand current usage (read affected files)
3. Design the fix (services functions, callback patterns)
4. Implement the fix
5. Update unit tests (mock services instead of db/api)
6. Update E2E tests if needed
7. Run dead code check (npm run lint:dead-code)
8. Run architecture check (npm run arch:test)
9. Change rule from warn → error
10. Run full test suite (npm test && npm run test:e2e)
11. Create PR and merge
12. Repeat for next rule
```

---

## Detailed Plan by Rule

### Rule 1: `api-should-not-import-db` (1 session)

**Current Violation:**
- `src/api/api.real.js` imports from `src/core/db.js` to get API key

**Fix:**
- Modify `generateQuestions()` and `generateExplanation()` to receive `apiKey` as parameter
- Caller (views or services) retrieves API key from db and passes it

**Files to Change:**
| File | Change |
|------|--------|
| `src/api/api.real.js` | Add `apiKey` parameter to functions |
| `src/api/openrouter-client.js` | Already receives apiKey (verify) |
| Views calling API | Pass apiKey when calling (temporary, will move to services) |

**Tests to Update:**
- `src/api/openrouter-client.test.js` - Verify tests pass apiKey

**Checklist:**
- [ ] Create branch `fix/arch-rule-api-db`
- [ ] Modify `api.real.js` to accept apiKey parameter
- [ ] Update callers to pass apiKey
- [ ] Update unit tests
- [ ] Run `npm run lint:dead-code`
- [ ] Change rule to `error` in `.dependency-cruiser.cjs`
- [ ] Run `npm run arch:test` (should pass)
- [ ] Run full test suite
- [ ] Create PR and merge

---

### Rule 2: `components-should-not-import-api` (1 session)

**Current Violation:**
- `src/components/ConnectModal.js` imports from `src/api/openrouter-auth.js`

**Fix:**
- ConnectModal receives `onConnect` callback as prop
- Parent view (WelcomeView, HomeView) handles the auth call
- ConnectModal becomes purely presentational

**Files to Change:**
| File | Change |
|------|--------|
| `src/components/ConnectModal.js` | Remove API import, use callback prop |
| `src/views/WelcomeView.js` | Pass onConnect callback to ConnectModal |
| `src/views/HomeView.js` | Pass onConnect callback to ConnectModal |

**Tests to Update:**
- ConnectModal tests should mock callbacks, not API
- View tests should verify callback is passed

**Checklist:**
- [ ] Create branch `fix/arch-rule-components-api`
- [ ] Refactor ConnectModal to use callback
- [ ] Update WelcomeView to pass callback
- [ ] Update HomeView to pass callback
- [ ] Update unit tests
- [ ] Run `npm run lint:dead-code`
- [ ] Change rule to `error`
- [ ] Run `npm run arch:test`
- [ ] Run full test suite
- [ ] Create PR and merge

---

### Rule 3: `views-should-not-import-db` (3-4 sessions)

**Current Violations:**
- `src/views/HomeView.js` → `src/core/db.js`
- `src/views/ResultsView.js` → `src/core/db.js`
- `src/views/SettingsView.js` → `src/core/db.js`
- `src/views/TopicsView.js` → `src/core/db.js`

**Fix:**
- Create `src/services/quiz-service.js` for quiz-related db operations
- Create `src/services/settings-service.js` for settings-related db operations
- Views import from services instead of db

**Session 3a: Create Services Layer Structure**

| File | Functions |
|------|-----------|
| `src/services/quiz-service.js` | `getQuizHistory()`, `getQuizSession()`, `saveQuizResults()`, `getTopicStats()` |
| `src/services/settings-service.js` | `getSettings()`, `saveSettings()`, `isConnected()` |
| `src/services/index.js` | Re-exports from both services |

**Session 3b: Migrate HomeView**

| Current Import | New Import |
|----------------|------------|
| `import { getRecentSessions } from '../core/db.js'` | `import { getQuizHistory } from '../services/quiz-service.js'` |

**Session 3c: Migrate ResultsView, TopicsView**

Same pattern - replace db imports with service imports.

**Session 3d: Migrate SettingsView**

Uses settings-service instead of direct db access.

**Tests to Update:**
- Create `src/services/quiz-service.test.js`
- Create `src/services/settings-service.test.js`
- Update view tests to mock services instead of db

**Checklist:**
- [ ] Create branch `fix/arch-rule-views-db`
- [ ] Create `src/services/quiz-service.js`
- [ ] Create `src/services/settings-service.js`
- [ ] Create `src/services/index.js`
- [ ] Add service tests
- [ ] Migrate HomeView
- [ ] Migrate ResultsView
- [ ] Migrate TopicsView
- [ ] Migrate SettingsView
- [ ] Update all view tests
- [ ] Run `npm run lint:dead-code`
- [ ] Change rule to `error`
- [ ] Run `npm run arch:test`
- [ ] Run full test suite
- [ ] Run E2E tests
- [ ] Create PR and merge

---

### Rule 4: `views-should-not-import-api` (2-3 sessions)

**Current Violations:**
- `src/views/QuizView.js` → `src/api/index.js`
- `src/views/OpenRouterGuideView.js` → `src/api/openrouter-auth.js`
- `src/views/LoadingView.js` → `src/api/index.js`

**Fix:**
- Add API-related functions to services layer
- Views call services, services call API

**New Service Functions:**
| Service | Functions |
|---------|-----------|
| `quiz-service.js` | `generateQuiz(topic, gradeLevel)` - calls API and saves to db |
| `auth-service.js` | `startAuth()`, `handleCallback()`, `isConnected()` |

**Session 4a: Extend Services Layer**

Add auth-service and extend quiz-service with API functions.

**Session 4b: Migrate LoadingView, QuizView**

Replace API imports with service imports.

**Session 4c: Migrate OpenRouterGuideView**

Replace auth API imports with auth-service imports.

**Tests to Update:**
- Create `src/services/auth-service.test.js`
- Extend `src/services/quiz-service.test.js`
- Update view tests

**Checklist:**
- [ ] Create branch `fix/arch-rule-views-api`
- [ ] Create `src/services/auth-service.js`
- [ ] Extend `quiz-service.js` with API functions
- [ ] Add service tests
- [ ] Migrate LoadingView
- [ ] Migrate QuizView
- [ ] Migrate OpenRouterGuideView
- [ ] Update all view tests
- [ ] Run `npm run lint:dead-code`
- [ ] Change rule to `error`
- [ ] Run `npm run arch:test`
- [ ] Run full test suite
- [ ] Run E2E tests
- [ ] Create PR and merge

---

## Services Layer Design

### quiz-service.js

```javascript
// src/services/quiz-service.js
import { generateQuestions as apiGenerateQuestions } from '../api/index.js';
import { saveSession, getRecentSessions, getSession } from '../core/db.js';
import state from '../core/state.js';

export async function generateQuiz(topic, gradeLevel) {
  const apiKey = await getApiKey();
  const questions = await apiGenerateQuestions(topic, gradeLevel, apiKey);
  state.set('currentQuestions', questions);
  return questions;
}

export async function getQuizHistory(limit = 10) {
  return getRecentSessions(limit);
}

export async function getQuizSession(id) {
  return getSession(id);
}

export async function saveQuizResults(sessionData) {
  return saveSession(sessionData);
}
```

### settings-service.js

```javascript
// src/services/settings-service.js
import { getSetting, saveSetting } from '../core/db.js';

export async function getSettings() {
  return {
    gradeLevel: await getSetting('gradeLevel') || 'middle school',
    theme: await getSetting('theme') || 'system'
  };
}

export async function saveSetting(key, value) {
  return saveSetting(key, value);
}
```

### auth-service.js

```javascript
// src/services/auth-service.js
import { startAuth as apiStartAuth, handleCallback as apiHandleCallback } from '../api/openrouter-auth.js';
import { getApiKey } from '../core/db.js';

export async function startAuth() {
  return apiStartAuth();
}

export async function handleCallback(code) {
  return apiHandleCallback(code);
}

export async function isConnected() {
  const key = await getApiKey();
  return !!key;
}
```

---

## Testing Strategy

### Unit Tests

| Layer | Mock | Test |
|-------|------|------|
| Views | Services | UI behavior, navigation, rendering |
| Services | API, DB | Business logic, coordination |
| API | Fetch | HTTP calls, response parsing |
| DB | IndexedDB (fake-indexeddb) | Data persistence |

### E2E Tests

E2E tests should continue working unchanged - they test through the UI and don't care about internal architecture.

**Run E2E tests after each rule migration to verify no regressions.**

---

## Success Criteria

Phase 25 is complete when:

- [ ] All 4 warning rules changed to error rules
- [ ] `npm run arch:test` passes with 0 violations
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No dead code detected
- [ ] Services layer fully implemented
- [ ] Documentation updated

---

## Estimated Timeline

| Rule | Sessions | Cumulative |
|------|----------|------------|
| Rule 1: api-should-not-import-db | 1 | 1 |
| Rule 2: components-should-not-import-api | 1 | 2 |
| Rule 3: views-should-not-import-db | 3-4 | 5-6 |
| Rule 4: views-should-not-import-api | 2-3 | 7-9 |
| Buffer/cleanup | 1-2 | 8-11 |

**Total: 8-11 sessions**

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | E2E tests after each rule, incremental approach |
| Test coverage gaps | Review test coverage before migration |
| Scope creep | Strictly one rule at a time |
| Dead code accumulation | Run `npm run lint:dead-code` after each rule |

---

## Related Documentation

- [Phase 20: Architecture Testing](./PHASE20_ARCH_TESTING.md)
- [Phase 20 Learning Notes](./PHASE20_LEARNING_NOTES.md)
- [Architecture Rules](../architecture/ARCHITECTURE_RULES.md)
- [System Overview](../architecture/SYSTEM_OVERVIEW.md)

---

**Created:** 2025-12-21
**Status:** Planning (awaiting review)
