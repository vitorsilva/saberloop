# Phase 2: Mode Toggle + Theming

**Status:** Not Started
**Priority:** P1 - Visual identity
**Parent:** [Epic 6 Plan](./EPIC6_SHARING_PLAN.md)
**Depends on:** [Phase 1](./PHASE1_QUIZ_SHARING.md) completed

---

## Goal

Visual distinction between Learning and Party modes.

## User Story

> As a user, I want to switch between Learning and Party modes so the app feels appropriate for each context.

---

## UI Design

### Header Toggle

```
┌─────────────────────────────────────────┐
│ SABERLOOP        [📚 Learn | 🎉 Party]  │
└─────────────────────────────────────────┘
```

---

## Color Schemes

| Element | Learning Mode | Party Mode |
|---------|---------------|------------|
| Primary | Blue (#3B82F6) | Orange (#F97316) |
| Background | Light (#F8FAFC) | Dark (#1E1E2E) |
| Text | Dark (#1E293B) | Light (#F8FAFC) |
| Success | Green (#22C55E) | Yellow (#FACC15) |
| Accent | Teal (#14B8A6) | Purple (#A855F7) |

---

## Wireframes

*Learning Mode:*
```
┌─────────────────────────────────────────┐
│ SABERLOOP        [📚 Learn | 🎉 Party]  │
├─────────────────────────────────────────┤
│                                         │
│  (Learning mode - blue theme)           │
│  Light background, blue accents         │
│  Calm, focused aesthetic                │
│                                         │
└─────────────────────────────────────────┘
```

*Party Mode:*
```
┌─────────────────────────────────────────┐
│ SABERLOOP        [📚 Learn | 🎉 Party]  │
├─────────────────────────────────────────┤
│                                         │
│  (Party mode - orange/dark theme)       │
│  Dark background, orange accents        │
│  Vibrant, exciting aesthetic            │
│                                         │
└─────────────────────────────────────────┘
```

*Toggle States:*
```
Learning selected:   [📚 Learn | 🎉 Party]
                      ^^^^^^^^
                      highlighted

Party selected:      [📚 Learn | 🎉 Party]
                                 ^^^^^^^^
                                 highlighted
```

---

## Technical Specification

### CSS Custom Properties

```css
/* Learning Mode (default) */
:root {
  --color-primary: #3B82F6;
  --color-background: #F8FAFC;
  --color-text: #1E293B;
  --color-success: #22C55E;
  --color-accent: #14B8A6;
}

/* Party Mode */
:root.party-mode {
  --color-primary: #F97316;
  --color-background: #1E1E2E;
  --color-text: #F8FAFC;
  --color-success: #FACC15;
  --color-accent: #A855F7;
}
```

### Theme Manager Service

```javascript
// src/services/theme-manager.js

/**
 * Gets the current app mode.
 * @returns {"learning" | "party"}
 */
export function getCurrentMode() {
  return settings.get('appMode') || 'learning';
}

/**
 * Sets the app mode and applies theme.
 * @param {"learning" | "party"} mode
 */
export function setMode(mode) {
  settings.set('appMode', mode);
  applyTheme(mode);
  trackEvent('mode_switched', { to: mode });
}

/**
 * Applies the visual theme for the given mode.
 * @param {"learning" | "party"} mode
 */
function applyTheme(mode) {
  if (mode === 'party') {
    document.documentElement.classList.add('party-mode');
  } else {
    document.documentElement.classList.remove('party-mode');
  }
}

/**
 * Toggles between learning and party modes.
 * @returns {"learning" | "party"} The new mode
 */
export function toggleMode() {
  const current = getCurrentMode();
  const newMode = current === 'learning' ? 'party' : 'learning';
  setMode(newMode);
  return newMode;
}
```

### Toggle Component

```javascript
// src/components/mode-toggle.js

export function createModeToggle() {
  const toggle = document.createElement('div');
  toggle.className = 'mode-toggle';
  toggle.innerHTML = `
    <button class="mode-btn mode-btn-learn" data-mode="learning">
      📚 ${t('mode.learn')}
    </button>
    <button class="mode-btn mode-btn-party" data-mode="party">
      🎉 ${t('mode.party')}
    </button>
  `;

  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-mode]');
    if (btn) {
      setMode(btn.dataset.mode);
      updateToggleUI(toggle);
    }
  });

  updateToggleUI(toggle);
  return toggle;
}
```

---

## Telemetry Events

- `mode_switched` - with `from` and `to` values

---

## i18n Strings

```javascript
// Phase 2
"mode.learn": "Learn",
"mode.party": "Party",
"mode.switch.learn": "Switch to Learning Mode",
"mode.switch.party": "Switch to Party Mode",
```

---

## Implementation Tasks

1. [ ] Add mode state to global app state
2. [ ] Create CSS custom properties for theming
3. [ ] Create Learning theme CSS
4. [ ] Create Party theme CSS
5. [ ] Add toggle component to header
6. [ ] Persist mode preference in settings
7. [ ] Apply mode label when generating quizzes
8. [ ] Filter quiz list by mode (optional)
9. [ ] Add telemetry event
10. [ ] Add i18n strings
11. [ ] Write unit tests
12. [ ] Write E2E tests (Playwright)
13. [ ] Write Maestro tests (mobile)

---

## Tests

### Unit Tests

```
theme-manager.test.js:
  - getCurrentMode() returns default "learning"
  - getCurrentMode() returns saved preference
  - setMode() saves to settings
  - setMode() applies CSS class
  - setMode() fires telemetry event
  - toggleMode() switches between modes
  - applyTheme() adds party-mode class
  - applyTheme() removes party-mode class
```

### E2E Tests (Playwright)

```
mode-toggle.spec.js:
  - toggle is visible in header
  - learning mode is default
  - clicking party switches theme
  - clicking learn switches back
  - mode persists across page refresh
  - mode persists across sessions
  - quiz generation respects current mode
  - visual theme changes appropriately
```

### Maestro Tests (Mobile)

```yaml
# mode-toggle.yaml
- launchApp
- assertVisible: "Learn"
- assertVisible: "Party"
- tapOn: "Party"
- assertVisible: "Party mode active"  # Visual theme change
- restart
- assertVisible: "Party"  # Persisted

# quiz-with-mode.yaml
- launchApp
- tapOn: "Party"
- generateQuiz:
    topic: "Fun Trivia"
- assertVisible: "party"  # Mode indicator on quiz
```

---

## Phase 2 Complete Checklist

- [ ] **Design**
  - [ ] Wireframes reviewed and approved
  - [ ] Color schemes finalized
  - [ ] i18n strings defined

- [ ] **Implementation**
  - [ ] Theme manager service
  - [ ] CSS custom properties
  - [ ] Toggle component
  - [ ] Mode persistence
  - [ ] Telemetry events

- [ ] **Quality**
  - [ ] Unit tests (≥80% coverage)
  - [ ] E2E tests for all user flows (Playwright)
  - [ ] Maestro tests for mobile (parity with Playwright)
  - [ ] Mutation testing passed
  - [ ] JSDoc on all public functions
  - [ ] Architecture tests passing

- [ ] **Deployment**
  - [ ] Deploy to staging (npm run deploy:staging)
  - [ ] Manual testing at https://saberloop.com/app-staging/
  - [ ] Test on real devices (Android/iOS)
  - [ ] Run Maestro tests on staging
  - [ ] Deploy to production (npm run deploy)
  - [ ] Verify feature flag is disabled

- [ ] **Release**
  - [ ] Feature flag created (disabled)
  - [ ] Branch merged to main
  - [ ] Learning notes documented
  - [ ] Status updated in CLAUDE.md
  - [ ] Flag enabled for internal testing
  - [ ] Monitor telemetry
  - [ ] Gradual rollout begun (10% → 100%)

---

**Last Updated:** 2026-01-06
