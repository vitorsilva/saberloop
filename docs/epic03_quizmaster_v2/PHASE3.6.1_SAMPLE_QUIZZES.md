# Phase 3.6.1: Sample Quizzes & Skip-Auth Flow

## Overview

This phase improves the user experience by allowing users to explore the app without requiring an OpenRouter API key upfront. Sample quizzes provide immediate value, and API keys are only requested when generating new quizzes.

**Why This Matters:**
- **Lower friction** - Users can try the app immediately
- **App Store approval** - Reviewers can test without API keys
- **Better UX** - Show value before asking for commitment
- **Graceful degradation** - Core features work without external dependencies

---

## User Flows

### First-Time User

```
1. Open app → WelcomeView
2. See "Get Started Free" (OpenRouter) + "Skip for now"
3. If "Skip for now":
   → Mark welcomeScreenVersion in storage
   → Navigate to HomeView
4. HomeView shows:
   - "Start New Quiz" button (enabled)
   - Sample Quizzes section (8 pre-built quizzes)
```

### Returning User (Skipped Auth)

```
1. Open app → HomeView directly (skip WelcomeView)
2. Can replay sample quizzes immediately
3. Click "Start New Quiz":
   → Modal: "Connect to OpenRouter to generate new quizzes"
   → [Connect] → OAuth flow → Continue to topic input
   → [Cancel] → Stay on HomeView
```

### Returning User (Connected)

```
1. Open app → HomeView directly
2. See quiz history + sample quizzes
3. Click "Start New Quiz" → Topic input (no prompt)
```

### Future Feature Announcements

```
1. Bump WELCOME_SCREEN_VERSION in code (e.g., "1.0" → "1.1")
2. User opens app
3. Stored version < current version → Show WelcomeView
4. WelcomeView can highlight new features
5. User proceeds → Store new version
```

---

## Sample Quizzes (8 Total)

Pre-built quizzes demonstrating different topic formats and difficulties:

| # | Topic | Format | Difficulty | Grade |
|---|-------|--------|------------|-------|
| 1 | Solar System | Short (2 words) | Easy | Elementary |
| 2 | Countries and continents where animals live | Descriptive + geography | Medium | Middle School |
| 3 | Basic Math | Short (2 words) | Easy | Elementary |
| 4 | Why do cats purr and what does it mean? | Descriptive sentence | Medium | Middle School |
| 5 | Marvel vs DC superheroes | Entertainment + comparison | Medium | High School |
| 6 | Famous Scientists | Short (2 words) | Hard | High School |
| 7 | What makes a song become a hit? | Descriptive + entertainment | Medium | High School |
| 8 | How do economic recessions impact global trade patterns and employment rates across different sectors? | Long complex sentence | Hard | College |

**Purpose:** Show users that the app handles:
- Simple 1-2 word topics
- Full questions/sentences
- Entertainment topics
- Academic/complex topics
- Comparison formats

---

## Implementation Tasks

### 1. Sample Quiz Data

**File:** `src/data/sample-quizzes.js`

Create 8 complete quiz objects with:
- Topic name
- Grade level
- 5 questions each with 4 options
- Correct answer index
- Difficulty per question
- Pre-written (no API call needed)

### 2. WelcomeView Updates

**File:** `src/views/WelcomeView.js`

Changes:
- Add "Skip for now" link below "Get Started Free" button
- On skip: Store `welcomeScreenVersion` and navigate to HomeView
- Style: Subtle link, not competing with primary CTA

### 3. Welcome Version Utilities

**File:** `src/utils/welcome-version.js`

```javascript
const CURRENT_VERSION = "1.0";

export function shouldShowWelcome() {
  const seenVersion = localStorage.getItem('welcomeScreenVersion');
  return !seenVersion || seenVersion < CURRENT_VERSION;
}

export function markWelcomeSeen() {
  localStorage.setItem('welcomeScreenVersion', CURRENT_VERSION);
}
```

### 4. Main.js Routing Updates

**File:** `src/main.js`

Changes:
- Use `shouldShowWelcome()` instead of `isOpenRouterConnected()`
- First-time OR new version → WelcomeView
- Otherwise → HomeView

### 5. HomeView Updates

**File:** `src/views/HomeView.js`

Changes:
- Add "Sample Quizzes" section (always visible)
- Load from `sample-quizzes.js`
- Same UI as "Recent Topics" but different header
- Clicking sample quiz → QuizView (replay mode)

### 6. Connect Modal Component

**File:** `src/components/ConnectModal.js`

Modal for when user tries to generate new quiz without API key:

```
┌─────────────────────────────────────┐
│         Connect to OpenRouter       │
│                                     │
│  To generate new quizzes, you need  │
│  to connect your OpenRouter account │
│                                     │
│  [Connect with OpenRouter]          │
│                                     │
│         [Cancel]                    │
└─────────────────────────────────────┘
```

### 7. TopicInputView Updates

**File:** `src/views/TopicInputView.js`

Changes:
- On "Generate" click: Check `isOpenRouterConnected()`
- If not connected: Show ConnectModal
- If connected: Proceed with generation

### 8. E2E Test Updates

**File:** `tests/e2e/app.spec.js`

Changes:
- Remove `setupAuthenticatedState` helper (not needed)
- Tests can use sample quizzes without API key
- Add tests for:
  - Skip flow on WelcomeView
  - Sample quizzes visible on HomeView
  - Connect modal when generating without key

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/data/sample-quizzes.js` | Create | 8 pre-built quiz objects |
| `src/utils/welcome-version.js` | Create | Version check utilities |
| `src/components/ConnectModal.js` | Create | API key prompt modal |
| `src/views/WelcomeView.js` | Modify | Add "Skip" option |
| `src/views/HomeView.js` | Modify | Add sample quizzes section |
| `src/views/TopicInputView.js` | Modify | Check connection before generate |
| `src/main.js` | Modify | Version-based routing |
| `tests/e2e/app.spec.js` | Modify | Update for new flow |

---

## Success Criteria

- [x] Users can skip WelcomeView and access HomeView immediately ✅
- [x] 8 sample quizzes visible on HomeView (always) ✅
- [x] Sample quizzes playable without API key ✅
- [x] "Start New Quiz" shows connect modal if not connected ✅
- [x] Connect modal leads to OAuth flow ✅
- [x] Cancel on connect modal returns to HomeView ✅
- [x] WelcomeView can be re-shown for future announcements (version bump) ✅
- [x] All E2E tests passing ✅ (16/16 E2E, 78/78 unit)
- [x] App Store reviewers can test full flow without API key ✅

**Phase 3.6.1 Status: COMPLETE** (December 4, 2025)

---

## Estimated Sessions

2-3 sessions:
- Session 1: Sample quiz data + WelcomeView skip
- Session 2: HomeView sample section + Connect modal
- Session 3: E2E test updates + polish

---

## Notes

- Sample quizzes should feel authentic (good questions, reasonable difficulty)
- Consider marking sample quizzes visually (badge or different color)
- Sample quiz scores still saved to IndexedDB (user can replay and improve)
- Future: Could add more sample quizzes via app updates
