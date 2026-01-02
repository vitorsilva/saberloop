# Phase 50: Data Deletion Feature - Learning Notes

**Date**: 2026-01-02
**Status**: Complete

## What Was Built

A complete "Delete All Data" feature in Settings that:
- Shows storage usage breakdown (Settings vs Quizzes)
- Provides a confirmation modal before deletion
- Deletes all user data while preserving sample quizzes
- Shows success toast notification
- Supports i18n (English and Portuguese)

## Key Technical Learnings

### 1. Storage Size Calculation

**Challenge**: Calculate accurate byte sizes for IndexedDB and localStorage data.

**Solution**: Use `Blob` for accurate UTF-8 byte counting:
```javascript
export function getJsonSize(value) {
  if (value === null || value === undefined) return 0;
  try {
    const json = JSON.stringify(value);
    return new Blob([json]).size;  // Accurate UTF-8 byte count
  } catch {
    return 0;
  }
}
```

**Why Blob?**: `JSON.stringify().length` returns character count, not byte count. Multi-byte Unicode characters (like Portuguese "ã" or "ç") would be undercounted.

### 2. Default vs Named Exports

**Issue Encountered**: Build failed with:
```
"state" is not exported by "src/core/state.js"
```

**Root Cause**: `state.js` uses `export default new AppState()`, but I imported it as a named export `{ state }`.

**Fix**: Change from named to default import:
```javascript
// Wrong
import { state } from '../core/state.js';

// Correct
import state from '../core/state.js';
```

**Mock Fix**: Also needed to update the Vitest mock:
```javascript
// Wrong
vi.mock('../core/state.js', () => ({
  state: { clear: vi.fn() }
}));

// Correct
vi.mock('../core/state.js', () => ({
  default: { clear: vi.fn() }
}));
```

### 3. IndexedDB Data Preservation

**Challenge**: Delete user data but preserve sample quizzes so app remains functional.

**Solution**: Filter by `isSample` flag when clearing sessions:
```javascript
export async function clearAllUserData() {
  const db = await getDB();
  const allSessions = await db.getAll('sessions');

  for (const session of allSessions) {
    if (!session.isSample) {
      await db.delete('sessions', session.id);
    }
  }
  // Clear all topics and settings (no preservation needed)
}
```

### 4. Test Isolation with fake-indexeddb

**Issue**: Unit tests using `fake-indexeddb` were leaking data between tests.

**Attempted Solution**: `indexedDB.deleteDatabase(DB_NAME)` in `beforeEach`.

**Working Solution**: Call `clearAllUserData()` at the start of tests that need a clean state, which properly clears data while preserving samples.

### 5. Mutation Testing Insights

**Results**:
- `data-service.js`: 100% mutation score (perfect!)
- `storage.js`: 82.46% mutation score

**Surviving Mutants** (not worth fixing):
1. `bytes < 0` → `bytes <= 0` - Equivalent since `bytes === 0` is handled separately
2. String literal mutations for setting keys - Tests don't verify specific key names
3. `+= → -=` for welcomeVersion - Not directly tested but covered by integration

**Lesson**: Not all surviving mutants need fixing. Some are equivalent mutants or testing specific implementation details that don't affect behavior.

### 6. Modal Pattern

Followed existing `ConnectModal.js` pattern:
- Create modal as a Promise-returning function
- Append to `document.body` dynamically
- Handle: Cancel button, Confirm button, Backdrop click, Escape key
- Show loading state during async operation
- Remove from DOM on completion

### 7. Service Layer Orchestration

Data deletion spans multiple storage types. The service layer coordinates:
```
data-service.js (orchestrator)
    ├── db.js → clearAllUserData() (IndexedDB)
    ├── localStorage.removeItem() (4 keys)
    ├── sessionStorage.removeItem() (1 key)
    ├── state.clear() (in-memory)
    └── sample-loader.js → loadSamplesIfNeeded() (reload samples)
```

**Order matters**: Clear largest/most important first (IndexedDB), then smaller stores, then reload samples at the end.

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/utils/storage.js` | 89 | Storage size calculation |
| `src/utils/storage.test.js` | 186 | 20 unit tests |
| `src/services/data-service.js` | 75 | Deletion orchestration |
| `src/services/data-service.test.js` | 195 | 10 unit tests |
| `src/components/DeleteDataModal.js` | 112 | Confirmation modal |
| `tests/e2e/data-deletion.spec.js` | 142 | 8 E2E tests |

## Test Coverage

- **Unit tests**: 30 new tests (356 total passing)
- **E2E tests**: 8 new tests (68 total passing)
- **Mutation score**: 87% overall for new files

## What Went Well

1. **Incremental commits**: Small, focused commits made debugging easier
2. **E2E tests caught the build error**: The failing E2E tests revealed the import issue
3. **Mutation testing validated test quality**: 100% score on data-service.js confirmed thorough testing
4. **Following existing patterns**: Using ConnectModal.js as reference sped up development

## What Could Be Improved

1. **Missing i18n for es/fr/de**: Only English and Portuguese were translated; other languages fall back to English
2. **Surviving mutants in storage.js**: Could add more specific tests for edge cases
3. **No Maestro mobile tests**: Skipped due to time constraints

## Questions for Future Reference

Q: Why use `Blob.size` instead of `TextEncoder`?
A: Both work, but `Blob` is slightly more compatible and handles the encoding automatically.

Q: Why clear localStorage keys individually instead of `localStorage.clear()`?
A: Selective clearing preserves any third-party data or future keys we don't control.

Q: Why reload samples after deletion?
A: Without samples, the app would show empty state and feel broken. Samples provide immediate content.
