# Data Deletion Feature Plan

**Status**: 📋 Planning
**Created**: 2024-12-28
**Branch**: `claude/add-data-deletion-iZN2V`

---

## Problem Statement

Users currently have no way to delete their data from the application. This creates two concerns:
1. **Privacy**: Users may want to clear their quiz history, API connections, and preferences
2. **Clean uninstall**: Users don't want to leave "orphaned" data when uninstalling the app

## Research Findings

### Data Storage Locations

| Storage Type | Key/Database | Data Stored | File Location |
|-------------|--------------|-------------|---------------|
| **IndexedDB** | `quizmaster` → `sessions` | Quiz history (non-sample) | `src/core/db.js:63-105` |
| **IndexedDB** | `quizmaster` → `topics` | Topic definitions | `src/core/db.js:46-58` |
| **IndexedDB** | `quizmaster` → `settings` | OpenRouter API key, welcome version | `src/core/db.js:110-159` |
| **localStorage** | `quizmaster_settings` | User preferences (grade, questions, model) | `src/core/settings.js:28-70` |
| **localStorage** | `openrouter_models_cache` | Cached models list | `src/services/model-service.js:114-153` |
| **localStorage** | `i18nextLng` | Language preference | `src/core/i18n.js:79,174` |
| **localStorage** | `saberloop_telemetry_queue` | Offline telemetry events | `src/utils/telemetry.js:87-224` |
| **sessionStorage** | `openrouter_code_verifier` | PKCE temporary data | `src/api/openrouter-auth.js:65-123` |
| **In-Memory** | `state` object | Runtime quiz state | `src/core/state.js:64-74` |

### Uninstall Event Feasibility

**Result: NOT FEASIBLE**

The web platform does not provide a PWA uninstall event:
- [W3C Service Worker Issue #998](https://github.com/w3c/ServiceWorker/issues/998) - Proposed in 2016, no implementation
- [W3C Manifest Issue #636](https://github.com/w3c/manifest/issues/636) - `appuninstall` event proposal, still open
- Some browsers (Edge) offer a "delete data" checkbox during uninstall, but this is browser-controlled

**Mitigation**: Add informational text in the delete confirmation modal encouraging users to delete data before uninstalling.

---

## Solution Design

### Scope

**In Scope:**
- User-initiated "Delete All Data" button in Settings
- Confirmation modal before deletion
- Success toast after deletion
- Automatic reload of sample quizzes
- Stay on Settings page after deletion

**Out of Scope (Not Feasible):**
- Automatic data deletion on app uninstall

### User Flow

```
Settings Page
    ↓
[Delete All Data] button (danger styling)
    ↓
Confirmation Modal appears
  - Title: "Delete All Data?"
  - Message: Explains what will be deleted
  - Note about uninstall behavior
  - [Cancel] [Delete] buttons
    ↓
User clicks [Delete]
    ↓
All data cleared (except samples)
    ↓
Sample quizzes reloaded
    ↓
Success toast: "All data deleted successfully"
    ↓
User stays on Settings page
```

### What Gets Deleted

| Data | Deleted? | Notes |
|------|----------|-------|
| User-created quizzes | ✅ Yes | Sessions where `isSample !== true` |
| Sample quizzes | ❌ No | Automatically reloaded after deletion |
| OpenRouter connection | ✅ Yes | API key removed |
| User preferences | ✅ Yes | Grade level, questions per quiz, model |
| Language preference | ✅ Yes | Resets to browser default |
| Cached models | ✅ Yes | Will be re-fetched on next connection |
| Telemetry queue | ✅ Yes | Offline events cleared |
| Runtime state | ✅ Yes | In-memory state reset |

### Architecture

Following the existing layered architecture:

```
SettingsView.js (UI Layer)
    ↓ calls
data-service.js (NEW - Service Layer)
    ↓ calls
db.js, settings.js, etc. (Core Layer)
```

**New Files:**
- `src/services/data-service.js` - Data deletion orchestration
- `src/services/data-service.test.js` - Unit tests
- `src/components/DeleteDataModal.js` - Confirmation modal component

**Modified Files:**
- `src/views/SettingsView.js` - Add delete button and modal trigger
- `src/core/db.js` - Add `clearAllData()` function
- `public/locales/*.json` - Add i18n strings (5 languages)
- `tests/e2e/settings.spec.js` - E2E tests for deletion flow

---

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Add database clear function
**File**: `src/core/db.js`
- [ ] Add `clearAllUserData()` function
  - Deletes all sessions where `isSample !== true`
  - Clears all topics
  - Clears all settings (including API key)
- [ ] Add JSDoc documentation
- [ ] Add unit tests in `src/core/db.test.js`

#### 1.2 Create data service
**File**: `src/services/data-service.js`
- [ ] Create `deleteAllUserData()` function that:
  1. Clears IndexedDB user data (via db.js)
  2. Clears localStorage keys:
     - `quizmaster_settings`
     - `openrouter_models_cache`
     - `i18nextLng`
     - `saberloop_telemetry_queue`
  3. Clears sessionStorage:
     - `openrouter_code_verifier`
  4. Resets in-memory state (via state.js)
  5. Reloads sample quizzes (via sample-loader.js)
- [ ] Add JSDoc documentation
- [ ] Add unit tests in `src/services/data-service.test.js`

### Phase 2: UI Components

#### 2.1 Create confirmation modal
**File**: `src/components/DeleteDataModal.js`
- [ ] Create modal component following existing patterns (see `ConnectModal.js`)
- [ ] Include:
  - Warning icon (red/danger styling)
  - Title: "Delete All Data?"
  - Description of what gets deleted
  - Note about uninstall behavior
  - Cancel button (secondary)
  - Delete button (danger/red)
  - Loading state during deletion
- [ ] Add JSDoc documentation

#### 2.2 Add success toast utility
**File**: `src/utils/toast.js` (NEW) or extend existing pattern
- [ ] Create reusable toast notification function
- [ ] Follow pattern from `ShareModal.js` lines 148-158
- [ ] Support success/error variants

### Phase 3: Settings Integration

#### 3.1 Update Settings view
**File**: `src/views/SettingsView.js`
- [ ] Add "Data Management" section before "About"
- [ ] Add "Delete All Data" button with danger styling
- [ ] Wire up button to show DeleteDataModal
- [ ] Handle deletion completion with success toast
- [ ] Add `data-testid` attributes for E2E testing

### Phase 4: Internationalization

#### 4.1 Add translation keys
**Files**: `public/locales/{en,pt-PT,es,fr,de}.json`
- [ ] Add keys:
  ```json
  "settings": {
    "dataManagement": "Data Management",
    "deleteAllData": "Delete All Data",
    "deleteDataTitle": "Delete All Data?",
    "deleteDataDescription": "This will permanently delete all your quiz history, OpenRouter connection, and preferences. Sample quizzes will be reloaded.",
    "deleteDataUninstallNote": "Tip: Use this before uninstalling the app to ensure complete data removal.",
    "deleteDataConfirm": "Delete",
    "deleteDataSuccess": "All data deleted successfully"
  }
  ```
- [ ] Translate to all 5 supported languages

### Phase 5: Testing

#### 5.1 Unit tests
- [ ] `src/core/db.test.js` - Test `clearAllUserData()`
- [ ] `src/services/data-service.test.js` - Test `deleteAllUserData()` orchestration
- [ ] Ensure good coverage (aim for 80%+)

#### 5.2 E2E tests
**File**: `tests/e2e/data-deletion.spec.js` (NEW)
- [ ] Test delete button visibility in Settings
- [ ] Test confirmation modal appears on click
- [ ] Test cancel button closes modal without deletion
- [ ] Test delete button clears data
- [ ] Test success toast appears
- [ ] Test sample quizzes are reloaded
- [ ] Test app remains functional after deletion

#### 5.3 Architecture validation
- [ ] Run `npm run arch:test` to verify no layer violations
- [ ] Ensure data-service.js follows service layer patterns

### Phase 6: Documentation & Polish

#### 6.1 Visual documentation
- [ ] Capture "before" screenshot of Settings page
- [ ] Capture "after" screenshot with new Delete button
- [ ] Capture screenshot of confirmation modal

#### 6.2 Code quality
- [ ] Ensure all new functions have JSDoc
- [ ] Run linter and fix any issues
- [ ] Review for accessibility (focus management, ARIA)

---

## Files Changed Summary

### New Files
| File | Purpose |
|------|---------|
| `src/services/data-service.js` | Data deletion orchestration |
| `src/services/data-service.test.js` | Unit tests |
| `src/components/DeleteDataModal.js` | Confirmation modal |
| `tests/e2e/data-deletion.spec.js` | E2E tests |

### Modified Files
| File | Changes |
|------|---------|
| `src/core/db.js` | Add `clearAllUserData()` |
| `src/core/db.test.js` | Add tests for new function |
| `src/views/SettingsView.js` | Add delete button and modal |
| `public/locales/en.json` | Add English strings |
| `public/locales/pt-PT.json` | Add Portuguese strings |
| `public/locales/es.json` | Add Spanish strings |
| `public/locales/fr.json` | Add French strings |
| `public/locales/de.json` | Add German strings |

---

## Testing Checklist

### Unit Tests
- [ ] `clearAllUserData()` deletes non-sample sessions
- [ ] `clearAllUserData()` preserves sample sessions
- [ ] `clearAllUserData()` clears settings
- [ ] `deleteAllUserData()` clears all storage types
- [ ] `deleteAllUserData()` reloads samples

### E2E Tests
- [ ] Delete button appears in Settings
- [ ] Clicking button shows confirmation modal
- [ ] Cancel closes modal, data preserved
- [ ] Confirm deletes data, shows success toast
- [ ] App functional after deletion
- [ ] Sample quizzes available after deletion

### Manual Tests
- [ ] Test on Chrome desktop
- [ ] Test on Firefox desktop
- [ ] Test on Android Chrome
- [ ] Test on iOS Safari
- [ ] Verify dark mode styling
- [ ] Verify all 5 languages display correctly

---

## Acceptance Criteria

1. ✅ User can delete all data from Settings page
2. ✅ Confirmation modal prevents accidental deletion
3. ✅ Success message confirms deletion
4. ✅ Sample quizzes automatically reload
5. ✅ App remains functional after deletion
6. ✅ All strings translated to 5 languages
7. ✅ Unit test coverage ≥ 80% for new code
8. ✅ E2E tests pass
9. ✅ Architecture tests pass
10. ✅ Before/after screenshots documented

---

## References

- [W3C Service Worker Issue #998](https://github.com/w3c/ServiceWorker/issues/998) - Uninstall event proposal
- [W3C Manifest Issue #636](https://github.com/w3c/manifest/issues/636) - appuninstall event
- Existing patterns: `ConnectModal.js`, `ShareModal.js`, `ExplanationModal.js`
