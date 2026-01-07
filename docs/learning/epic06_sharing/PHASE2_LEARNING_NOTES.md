# Phase 2: Mode Toggle - Learning Notes

**Status:** In Progress
**Branch:** `feature/phase2-mode-toggle`
**Started:** 2026-01-07
**Depends on:** Phase 1 (Quiz Sharing) ✅ Merged

---

## Session: 2026-01-07

### Completed

- [x] Added `appMode: 'learning'` to DEFAULT_SETTINGS (`src/core/settings.js`)
- [x] Added CSS custom properties for theming (`src/styles/main.css`)
  - `:root` variables for Learning mode (blue primary)
  - `:root.party-mode` variables for Party mode (orange primary)
- [x] Updated Tailwind config to use CSS variables (`tailwind.config.js`)
  - Changed `primary` from hardcoded hex to `var(--color-primary)`
  - Added `primary-hover` color
- [x] Created theme manager service (`src/services/theme-manager.js`)
  - `getCurrentMode()` - reads from settings
  - `setMode()` - saves and applies theme
  - `applyTheme()` - toggles CSS classes on root element
  - `toggleMode()` - switches between modes
  - `initTheme()` - initializes on app startup
- [x] Initialize theme on app startup (`src/main.js`)
  - Called synchronously before async init to prevent theme flash
- [x] Added i18n strings for mode toggle (all 9 locales)
  - `mode.learn`, `mode.party`, `mode.switchToLearn`, `mode.switchToParty`
- [x] Created ModeToggle component (`src/components/ModeToggle.js`)
  - Segmented button with Learn/Party options
  - Updates UI on click, calls setMode()
  - Accessible with ARIA roles
- [x] Added mode toggle to HomeView header
- [x] Added mode toggle to TopicsView header
- [x] Added mode toggle to SettingsView header
- [x] Added MODE_TOGGLE feature flag (DISABLED by default)
- [x] Unit tests for theme-manager.js (20 tests)
  - getCurrentMode, setMode, applyTheme, toggleMode, initTheme
  - Telemetry tracking verification
  - DOM class manipulation verification
- [x] Unit tests for ModeToggle component (22 tests)
  - Component structure and ARIA attributes
  - Initial state for learning/party modes
  - Click interactions and UI updates
  - Accessibility verification

### Key Decisions

- **CSS Variables + Tailwind**: Using CSS custom properties that Tailwind references means existing `bg-primary`, `text-primary` classes automatically adapt to mode changes without modifying components
- **Party mode = dark + orange**: Party mode applies both `party-mode` and `dark` classes to leverage existing dark theme styles while adding party-specific colors

### Difficulties & Solutions

(None yet - smooth progress so far)

### Next Steps

- [x] Write E2E tests (Playwright) ✅
- [ ] Write Maestro tests (mobile)
- [ ] Deploy and test

---

## Session: 2026-01-07 (continued)

### Completed

- [x] E2E tests for mode toggle feature (10 tests)
  - Feature flag disabled test (toggle not visible by default)
  - Feature flag enabled tests via localStorage override
  - Toggle visibility on home page
  - Default to learning mode
  - Switch to party mode (click, UI update, CSS class)
  - Switch back to learning mode
  - Persist mode across page navigation
  - Persist mode across page refresh
  - Toggle visible on Topics view
  - Toggle visible on Settings view
  - Dark theme applied in party mode

### Key Implementation Details

- **E2E Feature Flag Testing**: Uses localStorage override `__test_feature_MODE_TOGGLE` to enable the feature during tests without changing production code
- **Test Helper**: `setupWithModeToggleEnabled(page)` sets up authenticated state + enables feature flag + reloads page
- **Assertions**: Using `aria-selected` attribute for accessibility and CSS class checks for theming

### Test Results

- Unit tests: 529 passed
- E2E tests: 10 passed (mode-toggle.spec.js)

---

**Last Updated:** 2026-01-07
