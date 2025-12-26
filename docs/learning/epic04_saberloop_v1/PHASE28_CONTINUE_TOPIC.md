# Phase 28: Continue on This Topic

## Status: PLANNING

## Overview

Add a "Continue on this topic" button to the Results page that generates a new quiz on the same topic, excluding previously asked questions and progressively increasing difficulty.

## Requirements Summary

| Aspect | Decision |
|--------|----------|
| UI Layout | Side-by-side buttons (equal weight) |
| Button Label | "Continue on this topic" |
| Question Tracking | Per session chain (reset on new topic) |
| Topic Exhausted | Allow repeats with warning |
| Max Continues | Unlimited |
| Prompt Approach | Send all previous questions |
| Grade Progression | 2 → 4 → 8 pattern |

## Grade Level Progression

**Levels:** elementary → middle school → high school → college

| Continue # | Total Quizzes | Level Up? |
|------------|---------------|-----------|
| 0 | 1 (initial) | - |
| 1-2 | 2-3 | ✅ after 2 continues |
| 3-6 | 4-7 | ✅ after 4 more (6 total) |
| 7-14 | 8-15 | ✅ after 8 more (14 total) |
| 15+ | 16+ | Stays at college |

**Edge cases:**
- If user starts at college → stays at college
- Cap at college level (no higher)

---

## UI Design

### Current Results Page (Before)

```
┌─────────────────────────────────┐
│         Results                 │
│                                 │
│        [Score Circle]           │
│           75%                   │
│                                 │
│     Review Your Answers         │
│     [Question cards...]         │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Try Another Topic     │   │
│  └─────────────────────────┘   │
│                                 │
│  [Home] [Topics] [Settings]     │
└─────────────────────────────────┘
```

### New Results Page (After)

```
┌─────────────────────────────────┐
│         Results                 │
│                                 │
│        [Score Circle]           │
│           75%                   │
│                                 │
│     Review Your Answers         │
│     [Question cards...]         │
│                                 │
│  ┌────────────┐ ┌────────────┐ │
│  │ Continue   │ │ Try Another│ │
│  │ on this    │ │ Topic      │ │
│  │ topic      │ │            │ │
│  └────────────┘ └────────────┘ │
│                                 │
│  [Home] [Topics] [Settings]     │
└─────────────────────────────────┘
```

**Button styling:**
- "Continue on this topic" + arrow_forward icon - Primary style (blue, prominent)
- "Try Another Topic" - Secondary style (outlined or muted)

---

## Data Model

### Session Chain Tracking

We need to track the "continue chain" - all questions asked in a sequence of continues on the same topic.

**Option A: Store in state (simpler)**
```javascript
state.set('continueChain', {
  topic: 'Ionic Liquids',
  continueCount: 2,
  allQuestions: [...previousQuestions],
  startingGradeLevel: 'middle school'
});
```

**Option B: Store in IndexedDB (persists across sessions)**
- New field in quiz session: `chainId`
- Query all sessions with same `chainId` to get previous questions

**Recommendation:** Option A (state) - simpler, and "continue chain" should reset if user closes app anyway.

### State Changes

```javascript
// New state fields
continueChain: {
  topic: string,           // Topic being continued
  continueCount: number,   // How many times continued (for grade progression)
  previousQuestions: [],   // All questions asked in this chain
  startingGradeLevel: string
}
```

---

## Prompt Modification

### Current Prompt (api.real.js)

```
Generate exactly 5 multiple-choice questions about "${topic}"
appropriate for ${gradeLevel} students.
...
```

### New Prompt (with exclusions)

```
Generate exactly 5 multiple-choice questions about "${topic}"
appropriate for ${gradeLevel} students.

${previousQuestions.length > 0 ? `
IMPORTANT - AVOID DUPLICATE QUESTIONS:
The following questions have already been asked. Generate NEW questions
that cover DIFFERENT aspects of the topic:

Previously asked questions:
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

If you cannot generate 5 completely new questions, generate as many new
ones as possible and include a note in any repeated questions.
` : ''}
...
```

---

## Feature Flag

```javascript
// src/core/features.js
CONTINUE_TOPIC: {
  phase: 'DISABLED',  // Enable after testing
  description: 'Continue quiz on same topic with new questions'
}
```

---

## Telemetry

```javascript
// When user clicks "Continue on this topic"
logger.action('continue_topic_clicked', {
  topic: state.get('currentTopic'),
  continueCount: chain.continueCount,
  currentGradeLevel: state.get('currentGradeLevel'),
  nextGradeLevel: calculateNextGradeLevel(chain),
  previousQuestionCount: chain.previousQuestions.length
});
```

---

## Implementation Steps

### Branch & Commits

**Branch:** `feat/phase28-continue-topic`

**Commit strategy:**
0. `docs: capture before screenshot for phase 28` (before any code)
1. `feat: add CONTINUE_TOPIC feature flag`
2. `feat: add continueChain state management`
3. `feat: update prompt to exclude previous questions`
4. `feat: add grade level progression logic`
5. `test: add unit tests for grade progression`
6. `feat: add Continue button to ResultsView`
7. `feat: wire up continue flow to LoadingView`
8. `feat: add telemetry for continue_topic_clicked`
9. `test: add E2E tests for continue flow`
10. `chore: enable CONTINUE_TOPIC flag`
11. `docs: capture after screenshots for phase 28`

### Step-by-Step

#### Step 1: Feature Flag
- Add `CONTINUE_TOPIC` to `src/core/features.js`

#### Step 2: State Management
- Add `continueChain` to `src/core/state.js`
- Create helper functions:
  - `initContinueChain(topic, gradeLevel)`
  - `addToContinueChain(questions)`
  - `clearContinueChain()`
  - `getContinueChain()`

#### Step 3: Grade Progression Logic
- Create `src/utils/gradeProgression.js`:
  - `calculateNextGradeLevel(continueCount, currentLevel)`
  - `GRADE_LEVELS = ['elementary', 'middle school', 'high school', 'college']`
  - `PROGRESSION_THRESHOLDS = [2, 6, 14]` // cumulative continues for level-up

#### Step 4: Prompt Modification
- Update `src/api/api.real.js` `generateQuestions()`:
  - Add optional `previousQuestions` parameter
  - Modify prompt to include exclusion list
- Update `src/api/api.mock.js` similarly
- Update `src/services/quiz-service.js` to pass through parameter

#### Step 5: ResultsView UI
- Add "Continue on this topic" button (side-by-side)
- Check feature flag before showing
- Style: primary (blue) vs secondary (outlined) for "Try Another Topic"

#### Step 6: Continue Flow
- On "Continue" click:
  1. Calculate next grade level
  2. Get previous questions from chain
  3. Update state with new grade level
  4. Navigate to `/loading` (quiz generation)
- Update `LoadingView` to:
  - Check for `continueChain`
  - Pass `previousQuestions` to `generateQuestions()`
  - Add new questions to chain after generation

#### Step 7: Telemetry
- Add `continue_topic_clicked` event in ResultsView

#### Step 8: Reset Chain
- Clear `continueChain` when:
  - User clicks "Try Another Topic"
  - User navigates to Home
  - User starts a new topic from TopicInputView

---

## Files to Modify/Create

| File | Action | Description |
|------|--------|-------------|
| `src/core/features.js` | Modify | Add CONTINUE_TOPIC flag |
| `src/core/state.js` | Modify | Add continueChain state |
| `src/utils/gradeProgression.js` | Create | Grade level progression logic |
| `src/api/api.real.js` | Modify | Add previousQuestions to prompt |
| `src/api/api.mock.js` | Modify | Add previousQuestions parameter |
| `src/services/quiz-service.js` | Modify | Pass through previousQuestions |
| `src/views/ResultsView.js` | Modify | Add Continue button, telemetry |
| `src/views/LoadingView.js` | Modify | Handle continue chain |
| `src/views/TopicInputView.js` | Modify | Clear chain on new topic |
| `src/views/HomeView.js` | Modify | Clear chain on home |

---

## Testing Plan

### Unit Tests

**File:** `src/utils/gradeProgression.test.js`

1. `calculateNextGradeLevel` returns same level for 0-1 continues
2. `calculateNextGradeLevel` returns next level after 2 continues
3. `calculateNextGradeLevel` returns next level after 6 continues
4. `calculateNextGradeLevel` returns next level after 14 continues
5. `calculateNextGradeLevel` caps at college
6. `calculateNextGradeLevel` handles starting at college

**File:** `src/api/api.real.test.js` (existing)

7. Prompt includes previous questions when provided
8. Prompt excludes section when no previous questions

### E2E Tests

**File:** `tests/e2e/app.spec.js`

1. **should show Continue button on Results page**
   - Complete quiz
   - Verify "Continue on this topic" button visible

2. **should generate new quiz when Continue clicked**
   - Complete quiz
   - Click Continue
   - Verify loading page appears
   - Verify new questions generated

3. **should track continue count for telemetry**
   - Complete quiz
   - Click Continue
   - Verify telemetry event fired (mock or check state)

### Code Coverage

**Requirement:** New code must have adequate test coverage.

Run coverage report:
```bash
npm run test:coverage
```

**Coverage targets for new files:**
| File | Min Coverage |
|------|--------------|
| `src/utils/gradeProgression.js` | 90%+ |
| Changes to `api.real.js` | Covered by existing + new tests |

**Validation step:** Before PR, run `npm run test:coverage` and verify new code is covered.

---

## Screenshots (Required)

### Before Implementation
Capture current state before making changes:

| Screenshot | Description | Filename |
|------------|-------------|----------|
| Results page | Current single button layout | `phase28_results_before.png` |

### After Implementation
Capture new state after changes:

| Screenshot | Description | Filename |
|------------|-------------|----------|
| Results page | Two side-by-side buttons | `phase28_results_after.png` |
| Continue flow | Loading page after Continue click | `phase28_continue_loading.png` |
| New quiz | New questions generated (different from first) | `phase28_continue_new_quiz.png` |

**Location:** `docs/product-info/screenshots/`

**Process:**
1. Take "before" screenshots BEFORE any code changes
2. Take "after" screenshots AFTER implementation complete
3. Include in PR description for visual review

---

## Validation Checklist

### Screenshots
- [ ] "Before" screenshot captured before implementation
- [ ] "After" screenshots captured after implementation
- [ ] Screenshots included in PR description

### Feature
- [ ] Feature flag `CONTINUE_TOPIC` added
- [ ] Continue button shows only when flag enabled
- [ ] Buttons are side-by-side and properly styled
- [ ] Arrow icon on Continue button
- [ ] Grade progression works correctly (2 → 4 → 8 pattern)
- [ ] Previous questions sent in prompt
- [ ] New questions exclude previously asked ones
- [ ] Chain resets on new topic / home
- [ ] Telemetry fires on Continue click
- [ ] Warning shows if questions might repeat (optional)
- [ ] Works in dark mode

### Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Code coverage verified (`npm run test:coverage`)
- [ ] `gradeProgression.js` has 90%+ coverage
- [ ] Build succeeds

---

## Design Decisions

1. **Button label:** Just "Continue on this topic" (no level shown)
2. **Progress indicator:** None (keep it simple)
3. **Button icon:** `arrow_forward` →

---

## Future Enhancements

1. **Visual progress bar** showing grade level progression
2. **Topic mastery badge** when reaching college level
3. **Smart question selection** - prioritize questions user got wrong
4. **Spaced repetition** - bring back old questions after some time
