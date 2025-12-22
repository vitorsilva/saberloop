# Phase 25 Learning Notes - Services Layer Implementation

## Session Log

### Session 1 - December 22, 2025

**What we accomplished:**

Implemented Rules 1-3 of the services layer migration:

| Rule | PR | What we did |
|------|-----|-------------|
| Rule 1: `api-should-not-import-db` | #24 | Made API stateless by passing apiKey as parameter |
| Rule 2: `components-should-not-import-api` | #25 | Made ConnectModal presentational with callback prop |
| Rule 3: `views-should-not-import-db` | #26 | Created services layer, migrated all views |

**Files Created:**
- `src/services/quiz-service.js` - Quiz data operations
- `src/services/auth-service.js` - Auth operations

**Views Migrated (Rule 3):**
- HomeView → quiz-service + auth-service
- TopicsView → quiz-service
- ResultsView → quiz-service
- SettingsView → auth-service
- LoadingView → auth-service

---

## Key Learnings

### 1. Services Layer Pattern

**Why create "wrapper" functions that just call db functions?**

It **decouples the layers**:
- Views don't need to know about storage implementation
- Could switch from IndexedDB to remote API without changing views
- Single place to add business logic (validation, caching, transformations)
- Easier to test - mock the service, not the db

### 2. Atomic Commits

Instead of one big commit at the end, we made **9 atomic commits**:
1. Create quiz-service.js
2. Migrate HomeView (quiz)
3. Migrate TopicsView
4. Migrate ResultsView
5. Create auth-service.js
6. Migrate HomeView (auth)
7. Migrate SettingsView
8. Migrate LoadingView
9. Promote rule to error

**Benefits:**
- Each commit is self-contained and reviewable
- Easy to revert if something breaks
- Clear history of what changed and why
- Easier code review

### 3. Naming Conflicts

When importing a function that has the same name as a local variable:

```javascript
// Problem: variable shadows function name
import { isConnected } from '../services/auth-service.js';
const isConnected = await isConnected(); // ERROR!

// Solution: rename the variable
const connected = await isConnected(); // OK
```

### 4. Incremental Migration

We didn't try to fix everything at once:
- Rule 1 fixed API layer, but added view violations (temporarily)
- Rule 2 fixed components, but added view violations (temporarily)
- Rule 3 cleaned up all db violations from views
- Rule 4 will clean up remaining api violations

**Key insight:** It's OK to temporarily increase violations in one area while fixing another, as long as you have a plan to clean it up.

---

## Architecture Transformation

### Before (High Coupling)
```
views/ ─────→ db/       (5 violations)
       ─────→ api/      (5 violations)
components/ ─→ api/     (1 violation)
api/ ────────→ db/      (1 violation)
```

### After Rules 1-3 (Partially Decoupled)
```
views/ ─────→ services/ (good!)
       ─────→ api/      (5 violations - Rule 4 pending)
services/ ──→ db/       (allowed)
api/ ────────→ (no db)  (good!)
components/ → (no api)  (good!)
```

### After Rule 4 (Target - Low Coupling)
```
views/ ─────→ services/ (only)
services/ ──→ api/
          ──→ db/
```

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/services/quiz-service.js` | NEW - quiz data operations |
| `src/services/auth-service.js` | NEW - auth operations |
| `src/views/HomeView.js` | Uses services instead of db |
| `src/views/TopicsView.js` | Uses quiz-service |
| `src/views/ResultsView.js` | Uses quiz-service |
| `src/views/SettingsView.js` | Uses auth-service |
| `src/views/LoadingView.js` | Uses auth-service |
| `.dependency-cruiser.cjs` | 3 rules now enforced as errors |

---

## Current Status

**Architecture violations:** 0 errors, 5 warnings

| Rule | Status |
|------|--------|
| `api-should-not-import-db` | ✅ Enforced (error) |
| `components-should-not-import-api` | ✅ Enforced (error) |
| `views-should-not-import-db` | ✅ Enforced (error) |
| `views-should-not-import-api` | ⏳ Pending (5 warnings) |

---

## Next Steps

- [ ] Merge PR #26
- [ ] Rule 4: `views-should-not-import-api`
  - Extend quiz-service with API operations
  - Create or extend services for auth API calls
  - Migrate remaining views
  - Promote rule to error

---

**Last Updated:** 2025-12-22
**Status:** In Progress (Rules 1-3 complete)
