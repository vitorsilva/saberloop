# Phase 60: Maestro Testing Expansion

**Epic:** 4 - Saberloop V1
**Phase:** 60 - Maestro Testing Expansion
**Status:** ✅ Complete (December 30, 2024) - PR #63 merged
**Created:** 2025-12-15
**Updated:** 2025-12-30

---

## Overview

Expand Maestro test coverage to match Playwright E2E tests, ensuring parity between web and mobile testing.

### Goals
1. Create comprehensive test suite matching Playwright coverage
2. Organize tests into focused, maintainable files
3. Integrate with GitHub Actions CI
4. Handle TWA-specific testing challenges

---

## Current State

### Playwright Tests (56 scenarios across 5 files)

**app.spec.js (33 tests):**
- Home page display and navigation
- Full quiz flow (topic → loading → quiz → results)
- Quiz replay from saved history
- Settings page, form elements, persistence
- Bottom navigation
- Correct/incorrect answers display
- Submit button states (disabled when no answer, visible after selection)
- Dark mode support
- AI model selection (display, change, persist, error handling)
- Continue on topic feature (single and multiple continues)
- Loading countdown timer (issue #37)
- Answer visibility fixes (issues #10, #29)
- Explanation modal for incorrect answers

**offline.spec.js (7 tests):**
- Offline banner show/hide
- Rapid offline/online toggling
- Navigation while offline
- Sample quiz completion while offline
- Mid-quiz connection loss recovery
- Full offline/online cycle with replay

**openrouter-guide.spec.js (8 tests):**
- Guide navigation from Settings, Home, Welcome
- Back button and "I'll do it later" navigation
- Step cards display (4 steps)
- Connection confirmed screen

**quiz-leave-confirmation.spec.js (4 tests):**
- Confirmation dialogs when navigating during quiz (Home, Topics, Settings)
- Navigate away when user confirms

**share.spec.js (4 tests):**
- Share button visibility on results
- Deep link handling with topic parameter
- Share modal UI elements

### Existing Maestro Setup

**config.yaml:**
```yaml
testOutputDir: .maestro/tests
```

**smoke-test.yaml (3 basic checks):**
```yaml
appId: com.saberloop.app
---
- launchApp
- assertVisible: ".*Saberloop.*|.*Quiz.*|.*Question.*|.*Welcome.*"
- takeScreenshot: 01-app-loaded
- tapOn: "Settings"
- assertVisible: ".*Settings.*|.*API.*|.*Provider.*"
- takeScreenshot: 02-settings-visible
- tapOn: "Home"
- takeScreenshot: 03-back-to-home
```

**Gap:** 50+ test scenarios need to be added to reach parity

---

## Test Strategy

### 1. Use Sample Quizzes (Demo Mode)

The app pre-loads 8 sample quizzes on first launch:
1. **Solar System** (elementary)
2. **Countries and continents** (middle school)
3. **Basic Math** (elementary)
4. **Why do cats purr** (middle school)
5. **Marvel vs DC** (high school)
6. **Famous Scientists** (high school)
7. **What makes a song a hit** (high school)
8. **Economic recessions** (college)

For testing, we'll use **"Basic Math"**:
- Topic: "Basic Math"
- Grade Level: elementary
- 5 questions with predictable answers:
  - Q1-Q4: correct answer at index 2 (option C)
  - Q5: correct answer at index 1 (option B)

**Benefits:**
- No API calls needed
- Fast, deterministic tests
- Works offline
- No cost

### 2. State-Resilient Tests

Since TWA data persists in Chrome's storage (not clearable via `clearState`), tests will:
- Handle both fresh (welcome screen) and returning (home screen) users
- Use flexible assertions that match multiple valid states
- Navigate to known starting points before testing specific flows

### 3. File Organization

```
.maestro/
├── config.yaml                 # Workspace configuration
├── smoke-test.yaml             # Quick sanity check (existing)
└── flows/
    ├── _shared/
    │   └── navigate-home.yaml  # Reusable: ensure we're on home screen
    ├── 01-onboarding.yaml      # Welcome screen → Skip to home
    ├── 02-quiz-flow.yaml       # Complete quiz from sample
    ├── 03-quiz-results.yaml    # Verify results display
    ├── 04-replay-quiz.yaml     # Replay saved quiz from home
    ├── 05-navigation.yaml      # Bottom nav, history page
    ├── 06-settings.yaml        # Settings page and persistence
    └── 07-offline.yaml         # Offline mode behavior
```

---

## Test Specifications

### Test 01: Onboarding (`01-onboarding.yaml`)

**Purpose:** Verify welcome screen and skip to home flow

**Steps:**
1. Launch app (may show welcome or home depending on state)
2. If welcome screen visible, tap "Try Free Quizzes"
3. Verify home screen is displayed
4. Verify "Start New Quiz" button visible
5. Verify sample quizzes appear in Recent Topics

**Playwright equivalent:** `setupAuthenticatedState` helper + home page test

---

### Test 02: Quiz Flow (`02-quiz-flow.yaml`)

**Purpose:** Complete a full quiz using sample quiz

**Steps:**
1. Ensure on home screen
2. Find "Basic Math" in Recent Topics (sample quiz)
3. Tap on it to start quiz
4. Verify quiz header shows "Basic Math Quiz"
5. Verify "Question 1 of 5" progress indicator
6. Answer all 5 questions:
   - Q1-Q4: tap option C (index 2) for correct answers
   - Q5: tap option B (index 1) for correct answer
7. After each answer, tap submit/next button
8. Verify navigation to results page
9. Take screenshot of results (should show 100%)

**Playwright equivalent:** `should create and complete a full quiz`

---

### Test 03: Quiz Results (`03-quiz-results.yaml`)

**Purpose:** Verify results display with correct/incorrect answers

**Steps:**
1. Complete quiz answering some correctly, some incorrectly:
   - Q1: Answer C (correct - index 2)
   - Q2: Answer A (incorrect - index 0, correct is C/index 2)
   - Q3: Answer C (correct - index 2)
   - Q4: Answer C (correct - index 2)
   - Q5: Answer B (correct - index 1)
2. Verify results page shows 80% (4/5)
3. Verify "Review Your Answers" section visible
4. Verify check marks (correct) and X marks (incorrect) displayed
5. Verify "Try Another Topic" and "Continue on this topic" buttons visible
6. Verify info button appears on incorrect answer (Q2)

**Playwright equivalent:** `should display correct and incorrect answers in results`, `should display info button on incorrect answers only`

---

### Test 04: Replay Quiz (`04-replay-quiz.yaml`)

**Purpose:** Verify replaying a saved quiz from home

**Steps:**
1. Ensure on home screen
2. Verify Recent Topics shows at least one quiz
3. Tap on a quiz item
4. Verify quiz starts (not loading screen - using saved questions)
5. Complete the quiz with different answers
6. Verify results page
7. Return to home
8. Verify quiz item still exists (not duplicated)

**Playwright equivalent:** `should replay a saved quiz when clicked`

---

### Test 05: Navigation (`05-navigation.yaml`)

**Purpose:** Verify bottom navigation and history page

**Steps:**
1. Ensure on home screen
2. Verify bottom nav shows Home, History, Settings icons
3. Tap History icon
4. Verify History page header
5. Verify quiz items displayed (if any exist)
6. Tap on a quiz to replay (if exists)
7. Go back to home
8. Verify successful navigation

**Playwright equivalent:** `should navigate using bottom navigation` + `should display quiz history on topics page`

---

### Test 06: Settings (`06-settings.yaml`)

**Purpose:** Verify settings page and basic functionality

**Steps:**
1. Tap Settings in bottom nav
2. Verify Settings page header
3. Verify "Preferences" section visible
4. Verify "About" section visible
5. Verify version number displayed
6. Verify GitHub link visible
7. Navigate back to Home

**Playwright equivalent:** `should navigate to settings page` + `should display all settings form elements`

---

### Test 07: Offline Mode (`07-offline.yaml`)

**Purpose:** Verify offline behavior

**Steps:**
1. Ensure on home screen with at least one saved quiz
2. Enable airplane mode
3. Verify offline banner appears ("You're offline")
4. Verify "Start New Quiz" button is disabled
5. Tap on a saved quiz (should still work)
6. Verify quiz loads from saved data
7. Complete quiz offline
8. Verify results display
9. Disable airplane mode
10. Verify offline banner disappears
11. Verify "Start New Quiz" button re-enabled

**Playwright equivalent:** `should handle offline mode correctly`

---

## GitHub Actions Integration

### Approach: Android Emulator on GitHub Runner

```yaml
# .github/workflows/maestro.yml
name: Maestro E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  maestro-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: AVD cache
        uses: actions/cache@v4
        id: avd-cache
        with:
          path: |
            ~/.android/avd/*
            ~/.android/adb*
          key: avd-api-30

      - name: Create AVD and generate snapshot
        if: steps.avd-cache.outputs.cache-hit != 'true'
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 30
          force-avd-creation: false
          emulator-options: -no-window -gpu swiftshader_indirect -noaudio -no-boot-anim
          disable-animations: true
          script: echo "Generated AVD snapshot"

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Download APK
        run: |
          # Option 1: Download from releases
          # curl -L -o app.apk "https://github.com/vitorsilva/saberloop/releases/latest/download/saberloop.apk"

          # Option 2: Use checked-in APK (if available)
          cp package/Saberloop.apk app.apk

      - name: Run Maestro Tests
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 30
          force-avd-creation: false
          emulator-options: -no-window -gpu swiftshader_indirect -noaudio -no-boot-anim
          disable-animations: true
          script: |
            adb install app.apk
            maestro test .maestro/flows/ --format junit --output maestro-results.xml

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: maestro-results
          path: |
            maestro-results.xml
            ~/.maestro/tests/

      - name: Publish Test Results
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: Maestro Tests
          path: maestro-results.xml
          reporter: java-junit
```

### CI Considerations

1. **APK Source:** Check `Saberloop.apk` into the repo at `package/Saberloop.apk`
   - **Decision:** Option A - simple approach, ~1MB added to repo
   - Can optimize later (GitHub Releases) if needed

2. **Emulator Startup Time:** ~2-3 minutes, cached snapshots help

3. **Test Timeout:** Maestro has 30s default per command, may need adjustment

4. **Artifacts:** Save screenshots and test results for debugging

---

## Implementation Order

| Order | Task | Estimated Complexity |
|-------|------|---------------------|
| 1 | Create `flows/` directory structure | Simple |
| 2 | Implement `01-onboarding.yaml` | Simple |
| 3 | Implement `02-quiz-flow.yaml` | Medium |
| 4 | Implement `03-quiz-results.yaml` | Medium |
| 5 | Implement `04-replay-quiz.yaml` | Medium |
| 6 | Implement `05-navigation.yaml` | Simple |
| 7 | Implement `06-settings.yaml` | Simple |
| 8 | Implement `07-offline.yaml` | Complex (airplane mode) |
| 9 | Add GitHub Actions workflow | Medium |
| 10 | Test and debug CI pipeline | Medium |

---

## Success Criteria

- [x] All 7 test flows pass locally
- [x] Tests are state-resilient (work on fresh or returning user)
- [x] GitHub Actions runs tests on label trigger (PR #63 verified)
- [x] Test results visible in PR checks
- [x] Screenshots uploaded as artifacts
- [x] Documentation updated with learnings (PHASE60_LEARNING_NOTES.md)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| TWA state not clearable | Medium | Design state-resilient tests |
| Airplane mode flaky in CI | High | May skip offline test in CI initially |
| Emulator startup slow | Low | Use cached AVD snapshots |
| APK version mismatch | Medium | Document APK source clearly |

---

## Future Test Expansion (Optional)

After completing the core 7 tests, additional Playwright scenarios could be ported:

**High Priority:**
- Quiz leave confirmation dialogs (4 tests)
- AI model selection (5 tests)
- Continue on topic feature (4 tests)
- Explanation modal for incorrect answers (3 tests)

**Medium Priority:**
- Dark mode support
- Loading countdown timer
- Settings persistence
- Configurable question count

**Low Priority (Web-specific or difficult to test on mobile):**
- OpenRouter guide flow (requires specific state setup)
- Share feature (requires system share sheet interaction)
- Deep link handling

---

## Notes

- This plan focuses on core functionality parity between web and mobile
- Can be extended to other sample quizzes (Solar System, Famous Scientists) for variety
- Consider Maestro Cloud for faster/easier CI in future
- Airplane mode testing may be flaky - consider making it optional in CI initially
