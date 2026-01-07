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

### Key Decisions

- **CSS Variables + Tailwind**: Using CSS custom properties that Tailwind references means existing `bg-primary`, `text-primary` classes automatically adapt to mode changes without modifying components
- **Party mode = dark + orange**: Party mode applies both `party-mode` and `dark` classes to leverage existing dark theme styles while adding party-specific colors

### Difficulties & Solutions

(None yet - smooth progress so far)

### Next Steps

- [ ] Initialize theme on app startup (call `initTheme()` in main.js)
- [ ] Create mode toggle component
- [ ] Add toggle to header
- [ ] Add i18n strings for mode labels
- [ ] Write unit tests for theme-manager.js
- [ ] Write E2E tests
- [ ] Write Maestro tests

---

**Last Updated:** 2026-01-07
