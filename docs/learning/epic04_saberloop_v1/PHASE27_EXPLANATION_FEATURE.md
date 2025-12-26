# Phase 27: Explanation Feature for Incorrect Answers

## Overview

Add the ability for users to learn more about questions they got wrong by requesting an AI-generated explanation. This feature connects the existing `generateExplanation` API to the Results view.

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| `api.real.js` generateExplanation | Ready | Lines 123-162, uses OpenRouter |
| `api.mock.js` generateExplanation | Ready | Lines 93-112, returns mock text |
| `api/index.js` export | Ready | Line 20, conditionally exports |
| `quiz-service.js` export | Missing | Needs to be added |
| ResultsView UI | Missing | No info button on incorrect answers |
| E2E tests | Missing | No tests for explanation feature |

## Mockups Reference

Location: `docs/product-info/mockups/incorrect_answer/`

### Results Page (`new_results_page.png`)
- Info button (ⓘ) appears only on incorrect answer cards
- Correct answers show green dot on right side
- Incorrect answers show info button instead of dot
- **Button animation**: `animate-pulse` + blue glow `shadow-[0_0_10px_rgba(74,144,226,0.5)]`

### Explanation Modal (`incorrect_answer_explanation_page.png`)
- **Bottom sheet modal** that slides up from bottom
- Header: "INCORRECT" badge (red with warning icon)
- Question text displayed prominently
- Two side-by-side cards:
  - Left: "YOU SELECTED" with X icon, user's answer (red tint)
  - Right: "CORRECT ANSWER" with checkmark, correct answer (green tint)
- Divider line
- Lightbulb icon + "Why it's [correct answer]" heading
- Explanation text (can be multiple paragraphs)
- "Got it!" button at bottom with arrow icon

## Branching & Commits

**Branch name**: `feat/phase27-explanation-feature`

```bash
git checkout main
git pull
git checkout -b feat/phase27-explanation-feature
```

**Commit strategy** (small, logical commits):
1. `feat: add EXPLANATION_FEATURE flag`
2. `feat: export generateExplanation from quiz-service`
3. `feat: add info button to incorrect answer cards`
4. `feat: create ExplanationModal component`
5. `feat: connect modal to generateExplanation API`
6. `feat: add telemetry tracking for explanation opens`
7. `test: add E2E tests for explanation feature`
8. `chore: enable EXPLANATION_FEATURE flag`

**PR**: Create PR to `main` when complete

---

## Learning Objectives

1. Connecting existing API to UI through services layer
2. Loading states and async UI patterns
3. Error handling in user-facing features
4. Expanding E2E test coverage

---

## Implementation Steps

### Step 1: Export generateExplanation from quiz-service.js

**Concept**: The architecture requires views to use the services layer, not direct API access. We need to expose `generateExplanation` through `quiz-service.js`.

**Files to modify**:
- `src/services/quiz-service.js`

**Changes**:
1. Import `generateExplanation` from `../api/index.js`
2. Export wrapper function with same signature

### Step 2: Add Info Button to ResultsView

**Concept**: Modify the incorrect answer card template to replace the red dot with an info button.

**Files to modify**:
- `src/views/ResultsView.js`

**Changes**:
1. Update the incorrect answer template (around line 70-88)
2. Replace `<div class="size-3 rounded-full bg-error">` with info button
3. Include data attributes to identify which question

**Template change** (replace red dot with button):
```html
<button
  aria-label="Explain answer"
  data-question-index="${index}"
  class="explain-btn flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary/20 active:scale-95 animate-pulse shadow-[0_0_10px_rgba(74,144,226,0.5)]">
  <span class="material-symbols-outlined text-[20px]">info</span>
</button>
```

**Note**: The `animate-pulse` and blue glow draws attention to the button, encouraging users to tap for an explanation.

### Step 3: Create Bottom Sheet Modal Component

**Concept**: A reusable bottom sheet component for displaying explanations.

**Files to create/modify**:
- `src/components/ExplanationModal.js` (new)

**Modal structure** (per mockup):
```html
<!-- Backdrop -->
<div class="fixed inset-0 bg-black/50 z-40">
  <!-- Bottom Sheet -->
  <div class="fixed bottom-0 left-0 right-0 bg-card-dark rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto">
    <!-- Drag Handle -->
    <div class="flex justify-center pt-3 pb-2">
      <div class="w-12 h-1 bg-gray-600 rounded-full"></div>
    </div>

    <!-- INCORRECT Badge -->
    <div class="flex justify-center mb-4">
      <span class="bg-error/20 text-error px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
        <span class="material-symbols-outlined text-base">error</span>
        INCORRECT
      </span>
    </div>

    <!-- Question -->
    <h2 class="text-xl font-bold text-center px-6 mb-6">${question}</h2>

    <!-- Answer Cards Side by Side -->
    <div class="flex gap-3 px-4 mb-6">
      <!-- User's Answer -->
      <div class="flex-1 bg-error/10 rounded-xl p-4">
        <div class="flex items-center gap-2 text-error text-sm mb-1">
          <span class="material-symbols-outlined text-base">close</span>
          YOU SELECTED
        </div>
        <p class="text-lg font-semibold">${userAnswer}</p>
      </div>
      <!-- Correct Answer -->
      <div class="flex-1 bg-success/10 rounded-xl p-4 border border-success/30">
        <div class="flex items-center justify-between text-success text-sm mb-1">
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base">check</span>
            CORRECT ANSWER
          </span>
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <p class="text-lg font-semibold">${correctAnswer}</p>
      </div>
    </div>

    <!-- Divider -->
    <hr class="border-gray-700 mx-4 mb-6">

    <!-- Explanation Section -->
    <div class="px-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <span class="material-symbols-outlined text-primary">lightbulb</span>
        <h3 class="font-bold text-lg">Why it's ${correctAnswer}</h3>
      </div>
      <p class="text-subtext-dark leading-relaxed">${explanation}</p>
    </div>

    <!-- Got it Button -->
    <div class="px-4 pb-8">
      <button class="w-full bg-primary rounded-xl py-4 font-bold text-white flex items-center justify-center gap-2">
        Got it!
        <span class="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>
  </div>
</div>
```

### Step 4: Add Click Handler and Loading State

**Concept**: When user clicks the info button, fetch explanation and show modal.

**Files to modify**:
- `src/views/ResultsView.js`

**Changes**:
1. Add click listener for `.explain-btn` buttons
2. Import `generateExplanation` from services
3. Get API key from auth-service
4. Show loading spinner in modal while fetching
5. Display explanation in bottom sheet modal

**UI States**:
- Default: Info button (no pulse when online, disabled when offline)
- Loading: Modal opens with spinner in explanation area
- Success: Modal shows full explanation
- Error: Modal shows error message with retry option

### Step 5: Handle Offline and Error Cases

**Concept**: Graceful degradation when explanation can't be fetched.

**Decision**: Show disabled button when offline (per user preference).

**Scenarios**:
1. **Offline**: Show disabled/grayed-out info button (no click action)
2. **No API key**: Show connect prompt or use mock API
3. **API error**: Show error message in modal with retry button

**Implementation**:
- Listen to `online`/`offline` events
- Toggle button disabled state based on network status
- Add visual indication (opacity, no hover effects)

### Step 6: Add Feature Flag

**Concept**: Use feature flags for gradual rollout of the explanation feature.

**Files to modify**:
- `src/core/features.js`
- `src/views/ResultsView.js`

**Add flag to features.js**:
```javascript
EXPLANATION_FEATURE: {
  phase: 'DISABLED',  // Start disabled, enable after testing
  description: 'AI-generated explanations for incorrect answers'
}
```

**Check flag in ResultsView.js**:
```javascript
import { isFeatureEnabled } from '../core/features.js';

// Only show info button if feature is enabled
const showExplanationButton = isFeatureEnabled('EXPLANATION_FEATURE');

// In template for incorrect answers:
${showExplanationButton ? `
  <button aria-label="Explain answer" ...>
    <span class="material-symbols-outlined">info</span>
  </button>
` : `
  <div class="size-3 rounded-full bg-error"></div>
`}
```

**Rollout phases**:
1. `DISABLED` - Deploy code, test internally
2. `ENABLED` - Available to all users

### Step 7: Add Telemetry Tracking

**Concept**: Track when users open explanations to measure feature usage.

**Files to modify**:
- `src/views/ResultsView.js`

**Implementation** (using existing telemetry via logger):
```javascript
import { logger } from '../utils/logger.js';

// When user clicks info button and modal opens successfully:
logger.action('explanation_opened', {
  topic: state.get('currentTopic'),
  questionIndex: index,
  gradeLevel: state.get('currentGradeLevel')
});
```

**Telemetry event structure**:
```json
{
  "type": "event",
  "data": {
    "action": "explanation_opened",
    "topic": "Science",
    "questionIndex": 2,
    "gradeLevel": "middle school"
  },
  "timestamp": "2025-12-26T...",
  "sessionId": "...",
  "url": "https://saberloop.com/app/#/results"
}
```

**Analysis possibilities**:
- How often users request explanations
- Which topics generate more explanation requests
- Correlation between grade level and explanation usage

### Step 8: Update Knip Configuration (Optional)

**Concept**: Once `generateExplanation` is used, we can make Knip configuration more precise.

**Files to modify**:
- `knip.json`

**Current config** ignores entire API files:
```json
"ignore": [
  "src/api/api.mock.js",
  "src/api/api.real.js"
]
```

**Option**: Remove this ignore and let Knip validate exports properly.

---

## Testing Plan

> **IMPORTANT**: The feature flag `EXPLANATION_FEATURE` must be set to `ENABLED` in `src/core/features.js` during testing, or tests will not see the info button. Remember to:
> 1. Enable the flag before running E2E tests
> 2. Test with flag DISABLED to verify graceful degradation (button hidden)
> 3. Test with flag ENABLED to verify full functionality

### Unit Tests

**File**: `tests/unit/quiz-service.test.js` (new or existing)

1. Test `generateExplanation` wrapper calls underlying API
2. Test with mock API returns expected format
3. Test error handling

### E2E Tests

**File**: `tests/e2e/app.spec.js`

**New test cases**:

1. **should display info button on incorrect answers**
   - Complete quiz with at least one wrong answer
   - Verify info button is visible on incorrect cards
   - Verify no info button on correct cards

2. **should show explanation when info button clicked**
   - Click info button on incorrect answer
   - Verify loading state appears
   - Verify explanation text appears
   - Verify button state changes

3. **should toggle explanation visibility**
   - Click to show explanation
   - Click again to hide
   - Verify toggle works correctly

4. **should handle explanation error gracefully**
   - Mock API error
   - Click info button
   - Verify error message appears
   - Verify retry option works

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/core/features.js` | Modify | Add EXPLANATION_FEATURE flag |
| `src/services/quiz-service.js` | Modify | Add generateExplanation export |
| `src/views/ResultsView.js` | Modify | Add info button, click handler, feature check |
| `src/components/ExplanationModal.js` | Create | Bottom sheet modal component |
| `tests/e2e/app.spec.js` | Modify | Add explanation feature tests |
| `knip.json` | Optional | Refine ignored files |

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Display format | Bottom sheet modal | Per mockup design |
| Caching | No caching | Always fetch fresh explanation |
| Offline behavior | Disabled button | Button visible but grayed out |

---

## Validation Checklist

- [ ] Feature flag `EXPLANATION_FEATURE` added to features.js
- [ ] Info button only shows when feature flag is ENABLED
- [ ] Info button appears only on incorrect answer cards
- [ ] Info button has pulse animation and blue glow
- [ ] Correct answer cards show green dot (no button)
- [ ] Clicking info button opens bottom sheet modal
- [ ] Modal matches mockup design (badge, cards, explanation)
- [ ] Loading spinner shows while fetching explanation
- [ ] Error state shows in modal on failure with retry option
- [ ] "Got it!" button closes modal
- [ ] Clicking backdrop closes modal
- [ ] Button disabled when offline (grayed out)
- [ ] Works with both real and mock API
- [ ] Works in dark mode
- [ ] Accessible (keyboard navigation, screen reader, aria-labels)
- [ ] Telemetry event `explanation_opened` fires when modal opens
- [ ] E2E tests pass
- [ ] Architecture rules pass (`npm run arch:test`)
- [ ] Build succeeds (`npm run build`)
