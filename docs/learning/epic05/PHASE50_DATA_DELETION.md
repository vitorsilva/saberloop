# Data Deletion Feature Plan

**Status**: 📋 Planning
**Created**: 2024-12-28
**Updated**: 2024-12-30
**Priority**: High (User Privacy)
**Estimated Effort**: 3-4 sessions

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2024-12-28 | **Plan Created** | Initial research and design complete |
| 2024-12-30 | **Moved to Epic 5** | Promoted from parking lot to active epic |

---

## Overview

Provide users with complete control over their data through a "Delete All Data" feature in Settings. This addresses privacy concerns and enables users to completely remove their data before uninstalling the app.

**Key Features:**
- Storage usage display (see what you're storing)
- One-click data deletion with confirmation
- Preserves sample quizzes (so app stays functional)
- Multi-language support across all 5 supported languages

---

## What You'll Learn

### New Technologies & Concepts

1. **Storage Manager API** - Using `navigator.storage.estimate()` to measure origin storage
2. **IndexedDB Data Sizing** - Calculating database sizes by serializing to JSON
3. **Byte Formatting** - Human-readable storage units (B, KB, MB, GB)
4. **Service Layer Orchestration** - Coordinating deletion across multiple storage systems
5. **Confirmation UX Patterns** - Modal workflows for destructive actions
6. **Async Data Loading** - Progressive UI rendering with loading states
7. **Data Lifecycle Management** - Complete CRUD operations (Delete completes the cycle)

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Epic 03 Phase 3** complete (Settings page exists)
- ✅ **IndexedDB** implementation (`src/core/db.js`)
- ✅ **i18n system** working (5 languages supported)
- ✅ **Modal patterns** established (`ConnectModal.js` as reference)
- ✅ **Service layer** architecture in place
- ✅ **Unit testing** with Vitest set up
- ✅ **E2E testing** with Playwright configured
- ✅ Understanding of localStorage and sessionStorage APIs

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

### UI Wireframes

#### Settings Page (with new Data Management section)

```
┌─────────────────────────────────────┐
│  ←  Settings                        │
├─────────────────────────────────────┤
│                                     │
│  Preferences                        │
│  ┌─────────────────────────────────┐│
│  │ 📚 Default Grade Level          ││
│  │    [Middle School        ▼]     ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 📝 Questions per Quiz           ││
│  │    [5                    ▼]     ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🌐 Language                     ││
│  │    [🇬🇧 English           ▼]     ││
│  └─────────────────────────────────┘│
│                                     │
│  AI Provider                        │
│  ┌─────────────────────────────────┐│
│  │ ✓ Connected to OpenRouter      ││
│  │   Model: deepseek-r1t2-chimera  ││
│  │   [Change]  [🔴 Disconnect]     ││
│  └─────────────────────────────────┘│
│                                     │
│  ──────────── NEW ────────────      │
│  Data Management                    │
│  ┌─────────────────────────────────┐│
│  │ 🗄️ Storage Usage                ││
│  │                                 ││
│  │ Settings & Preferences   1.2 KB ││
│  │ Quizzes & History       44.0 KB ││
│  │ ───────────────────────────────  ││
│  │ Total                   45.2 KB ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🗑️ Delete All Data              ││
│  │    Remove all quizzes,          ││
│  │    settings, and connections    ││
│  │                                 ││
│  │  [🔴 Delete All Data    ]       ││
│  └─────────────────────────────────┘│
│  ──────────────────────────────     │
│                                     │
│  About                              │
│  ┌─────────────────────────────────┐│
│  │ Saberloop v1.0.0                ││
│  │ [View on GitHub]                ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

#### Delete Confirmation Modal

```
┌─────────────────────────────────────┐
│                                     │
│  (dark overlay backdrop)            │
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │      ⚠️ (warning icon)      │   │
│   │                             │   │
│   │    Delete All Data?         │   │
│   │                             │   │
│   │  This will permanently      │   │
│   │  delete:                    │   │
│   │  • All quiz history         │   │
│   │  • OpenRouter connection    │   │
│   │  • Your preferences         │   │
│   │                             │   │
│   │  Sample quizzes will be     │   │
│   │  reloaded automatically.    │   │
│   │                             │   │
│   │  ┌───────────────────────┐  │   │
│   │  │ 💡 Tip: Use this      │  │   │
│   │  │ before uninstalling   │  │   │
│   │  │ for complete removal  │  │   │
│   │  └───────────────────────┘  │   │
│   │                             │   │
│   │  [    Cancel    ]           │   │
│   │  [🔴 Delete     ]           │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

#### Success Toast

```
┌─────────────────────────────────────┐
│                                     │
│  (Settings page content)            │
│                                     │
│         ┌─────────────────┐         │
│         │ ✓ All data      │         │
│         │   deleted       │         │
│         └─────────────────┘         │
│            (auto-dismiss            │
│             after 3s)               │
│                                     │
└─────────────────────────────────────┘
```

---

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

**Note:** Each phase builds on the previous. Complete them in order for a smooth learning progression.

### Phase 0: Storage Size Display

**Q: Why show storage size before adding deletion?**
A: Transparency! Users should see what they're deleting and understand the impact. It also helps users decide if deletion is necessary.

#### 0.1 Create storage utility
**File**: `src/utils/storage.js`
- [ ] Create `formatStorageSize(bytes)` - formats bytes to human-readable (B, KB, MB, GB)
- [ ] Create `getStorageBreakdown()` - returns { core, quizzes, total } with formatted strings
- [ ] Calculate core size: localStorage settings + IndexedDB settings store
- [ ] Calculate quizzes size: IndexedDB topics + sessions stores
- [ ] Add JSDoc documentation
- [ ] Add unit tests in `src/utils/storage.test.js`

**Q: Why separate core and quizzes in the breakdown?**
A: It helps users understand that most storage comes from quiz history (which they created), not app settings (which are small).

#### 0.2 Add Storage Usage card to Settings
**File**: `src/views/SettingsView.js`
- [ ] Add "Data Management" section header
- [ ] Add Storage Usage card with breakdown display
- [ ] Load storage breakdown asynchronously on render
- [ ] Show loading state ("...") while calculating
- [ ] Handle errors gracefully (show "--" on failure)

#### 0.3 Add i18n strings for storage display
**Files**: `public/locales/{en,pt-PT}.json`
- [ ] Add keys:
  ```json
  "settings": {
    "dataManagement": "Data Management",
    "storageUsage": "Storage Usage",
    "coreData": "Settings & Preferences",
    "quizzesData": "Quizzes & History",
    "totalUsed": "Total"
  }
  ```

---

### Phase 1: Core Infrastructure

**Q: Why preserve sample quizzes?**
A: The app would feel broken if users deleted all data and saw an empty state. Sample quizzes let users explore immediately after deletion.

#### 1.1 Add database clear function
**File**: `src/core/db.js`
- [ ] Add `clearAllUserData()` function
  - Deletes all sessions where `isSample !== true`
  - Clears all topics
  - Clears all settings (including API key)
- [ ] Add JSDoc documentation
- [ ] Add unit tests in `src/core/db.test.js`

**Q: Why put this in `db.js` instead of a service?**
A: `db.js` is the single source of truth for database operations. Services orchestrate, but core modules handle the actual data operations.

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

**Q: Why is the deletion order important?**
A: Start with IndexedDB (largest), then localStorage, then sessionStorage, then in-memory. This way if something fails midway, the most important data is already cleared.

### Phase 2: UI Components

**Q: Why create a separate modal component instead of inline UI?**
A: Modals force user focus and prevent accidental clicks. Destructive actions should always require confirmation through a dedicated UI pattern.

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
- [ ] `src/utils/storage.test.js` - Test `formatStorageSize()` and `getStorageBreakdown()`
- [ ] `src/core/db.test.js` - Test `clearAllUserData()`
- [ ] `src/services/data-service.test.js` - Test `deleteAllUserData()` orchestration
- [ ] Run `npm run test:coverage` and verify:
  - [ ] `src/utils/storage.js` ≥ 80% coverage
  - [ ] `src/services/data-service.js` ≥ 80% coverage
  - [ ] New functions in `src/core/db.js` covered

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
- [ ] Ensure storage.js follows utils layer patterns

#### 5.4 Maestro testing (mobile)
**File**: `.maestro/flows/data-deletion.yaml` (NEW)
- [ ] Test storage usage displays in Settings
- [ ] Test delete button navigates to confirmation
- [ ] Test cancel returns to Settings
- [ ] Test delete clears data and shows success
- [ ] Test sample quizzes available after deletion

---

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
| `src/utils/storage.js` | Storage size calculation utilities |
| `src/utils/storage.test.js` | Storage utility unit tests |
| `src/services/data-service.js` | Data deletion orchestration |
| `src/services/data-service.test.js` | Data service unit tests |
| `src/components/DeleteDataModal.js` | Confirmation modal |
| `tests/e2e/data-deletion.spec.js` | E2E tests |
| `.maestro/flows/data-deletion.yaml` | Maestro mobile tests |

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

## Test Commands

Run these commands to verify the implementation:

```bash
# Unit tests
npm test -- --run

# Unit tests with coverage
npm run test:coverage

# E2E tests (headless)
npm run test:e2e

# E2E tests (with UI)
npm run test:e2e:ui

# Architecture tests
npm run arch:test

# Dead code detection
npm run lint:dead-code

# Type checking
npm run typecheck

# Maestro mobile tests (requires Android emulator)
maestro test .maestro/flows/data-deletion.yaml

# Run all checks before PR
npm test -- --run && npm run test:e2e && npm run arch:test && npm run typecheck
```

---

## Testing Checklist

### Unit Tests (Phase 0 - Storage Display)
- [ ] `formatStorageSize()` formats bytes correctly (B, KB, MB, GB)
- [ ] `getStorageBreakdown()` returns core and quizzes sizes
- [ ] `getStorageBreakdown()` handles empty databases gracefully
- [ ] Total equals core + quizzes

### Unit Tests (Phase 1+ - Data Deletion)
- [ ] `clearAllUserData()` deletes non-sample sessions
- [ ] `clearAllUserData()` preserves sample sessions
- [ ] `clearAllUserData()` clears settings
- [ ] `deleteAllUserData()` clears all storage types
- [ ] `deleteAllUserData()` reloads samples

### E2E Tests (Playwright)
- [ ] Storage usage displays in Settings
- [ ] Delete button appears in Settings
- [ ] Clicking button shows confirmation modal
- [ ] Cancel closes modal, data preserved
- [ ] Confirm deletes data, shows success toast
- [ ] App functional after deletion
- [ ] Sample quizzes available after deletion

### Maestro Tests (Mobile)
- [ ] Storage usage visible on Settings screen
- [ ] Delete button tap opens confirmation
- [ ] Cancel returns to Settings
- [ ] Delete clears data and shows success
- [ ] Sample quizzes load after deletion

### Manual Tests
- [ ] Test on Chrome desktop
- [ ] Test on Firefox desktop
- [ ] Test on Android Chrome
- [ ] Test on iOS Safari
- [ ] Verify dark mode styling
- [ ] Verify all 5 languages display correctly

---

## Acceptance Criteria

### Phase 0: Storage Display
1. [ ] Storage usage displayed in Settings under "Data Management"
2. [ ] Breakdown shows Settings & Preferences vs Quizzes & History
3. [ ] Total storage calculated correctly
4. [ ] Loading state shown while calculating
5. [ ] Unit tests pass for storage utilities

### Phase 1+: Data Deletion
6. [ ] User can delete all data from Settings page
7. [ ] Confirmation modal prevents accidental deletion
8. [ ] Success message confirms deletion
9. [ ] Sample quizzes automatically reload
10. [ ] App remains functional after deletion
11. [ ] All strings translated to supported languages
12. [ ] Unit test coverage ≥ 80% for new code
13. [ ] E2E tests pass
14. [ ] Architecture tests pass
15. [ ] Before/after screenshots documented

---

## Troubleshooting / Common Pitfalls

Based on findings from previous phases, watch out for these issues:

### Maestro Testing (Mobile)
| Issue | Cause | Solution |
|-------|-------|----------|
| TWA state not clearable | Maestro `clearState` doesn't affect IndexedDB/localStorage in TWA apps | Use in-app "Delete All Data" feature as test setup |
| Airplane mode flaky in CI | Device airplane mode toggles unreliable in CI | Skip network-dependent tests in CI or use dedicated offline flows |
| Emulator startup slow | Cold boot takes 30-60s | Use `-no-snapshot-load` flag or keep emulator running |
| APK version mismatch | Testing outdated APK | Always run `npm run build && npm run build:twa` before testing |
| ADB not found | `ANDROID_HOME` not set | Set `export ANDROID_HOME=~/Android/Sdk` and add to PATH |

### E2E Testing (Playwright)
| Issue | Cause | Solution |
|-------|-------|----------|
| Test file isolation | Importing from `.spec.js` runs both files | Extract shared utils to non-spec helper files |
| Offline simulation | `page.setOffline()` doesn't work for service workers | Use `context.setOffline(true)` before navigation |
| No offline data | Sample quizzes not loaded | Visit home page first to trigger sample loading |
| Flaky selectors | i18n changes text content | Use `data-testid` attributes for stable selectors |

### Unit Testing
| Issue | Cause | Solution |
|-------|-------|----------|
| Can't capture handlers | Event handlers not accessible | Return handler from setup function or store in module state |
| Browser globals undefined | `localStorage`, `navigator` not in Node | Mock using `vi.stubGlobal()` or `Object.defineProperty()` |
| localStorage mock issues | Can't spy on `localStorage.getItem` directly | Spy on `Storage.prototype.getItem` instead |
| Timers not advancing | Using `Date.now()` with fake timers | Use `vi.useFakeTimers()` with `vi.advanceTimersByTime()` |
| Coverage below threshold | New files not meeting 80% | Write tests for error paths, not just happy paths |

### i18n / Cross-Platform
| Issue | Cause | Solution |
|-------|-------|----------|
| Text selectors break | Translations change button text | Use `data-testid` for all testable elements |
| ENV vars not working | Different syntax Windows vs Unix | Use `cross-env` package: `cross-env VITE_API=mock npm test` |
| Missing translations | New keys not in all locale files | Run build to catch missing keys, check all 5 language files |

### Code Coverage
| Issue | Cause | Solution |
|-------|-------|----------|
| Coverage drops | New code not tested | Run `npm run test:coverage` and check new files specifically |
| Branch coverage low | Missing error path tests | Add tests for `try/catch`, `if/else`, and edge cases |
| Coverage report unclear | Too many files | Use `--coverage.include='src/utils/storage.js'` for specific files |

### Architecture
| Issue | Cause | Solution |
|-------|-------|----------|
| Layer violation | Service importing from view | Check imports: views→services→core→utils (one direction) |
| Unexpected warning | New file not in dependency rules | Update `.dependency-cruiser.cjs` if adding new module patterns |

---

## References

- [W3C Service Worker Issue #998](https://github.com/w3c/ServiceWorker/issues/998) - Uninstall event proposal
- [W3C Manifest Issue #636](https://github.com/w3c/manifest/issues/636) - appuninstall event
- Existing patterns: `ConnectModal.js`, `ShareModal.js`, `ExplanationModal.js`
