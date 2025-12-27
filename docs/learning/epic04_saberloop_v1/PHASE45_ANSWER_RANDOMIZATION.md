# Phase 45: Answer Position Randomization

## Overview

Prevent answer position memorization by randomizing the placement of correct answers both during LLM generation and when replaying quizzes.

## Problem Statement

**Issue 1: LLM Bias**
- LLMs tend to place correct answers in predictable positions (often A/first option)
- Users may unconsciously learn "when in doubt, pick A"

**Issue 2: Replay Memorization**
- When replaying saved quizzes (offline or from history), users can memorize positions
- "I remember the answer to question 3 was option B"
- Reduces learning effectiveness on repeated attempts

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Shuffling optional? | **No** - Always enabled | Consistent behavior, better learning |
| When to shuffle? | **Every render** | Prevents position memorization even within same session |
| Shuffle on initial play? | **No** - Replay only | Trust LLM distribution on first attempt |

## Implementation Plan

### 45.1 - Prompt Enhancement (LLM Generation)

**File:** `src/api/api.real.js`

**Change:** Add instruction to the question generation prompt to distribute correct answers evenly.

```text
CORRECT ANSWER DISTRIBUTION:
- Distribute correct answers evenly across positions A, B, C, D
- For 5 questions: aim for approximately 1-2 correct answers per position
- Do NOT cluster all correct answers in the same position (e.g., all "A")
- Vary the position naturally across the quiz
```

**Location:** Add after the "CRITICAL - Answer Option Quality" section (around line 74)

**Why prompt-level?**
- Reduces need for client-side processing on initial play
- LLM can make semantically sensible distributions
- Cheaper than shuffling every question

---

### 45.2 - Shuffle Utility Function

**File:** `src/utils/shuffle.js` (new file)

**Function:** `shuffleQuestionOptions(question)`

```javascript
/**
 * Shuffle answer options for a question
 * Uses Fisher-Yates algorithm for unbiased randomization
 *
 * @param {Object} question - Question object with options and correct index
 * @returns {Object} - New question object with shuffled options and updated correct index
 */
export function shuffleQuestionOptions(question) {
  // 1. Create array of indices [0, 1, 2, 3]
  // 2. Fisher-Yates shuffle the indices
  // 3. Reorder options based on shuffled indices
  // 4. Find new position of correct answer
  // 5. Return new question object (immutable)
}
```

**Key requirements:**
- Must be pure function (no side effects)
- Must return NEW object (don't mutate original)
- Must correctly track the new correct answer index
- Handle edge cases (questions with < 4 options)

---

### 45.3 - Integration in QuizView

**File:** `src/views/QuizView.js`

**Change:** When loading questions for replay, shuffle each question's options.

**Detection:** A quiz is a "replay" when:
- `state.get('replaySessionId')` is set (loaded from history)
- Questions come from IndexedDB rather than fresh generation

**Implementation approach:**

```javascript
// In render() method, after getting questions
if (state.get('replaySessionId')) {
  // This is a replay - shuffle options
  this.questions = this.questions.map(q => shuffleQuestionOptions(q));
}
```

**Important:** Shuffle happens in `render()`, so every navigation back to quiz reshuffles.

---

### 45.4 - Unit Tests

**File:** `src/utils/shuffle.test.js` (new file)

**Test cases:**
1. Shuffled question has same options (different order)
2. Correct answer index points to same option text after shuffle
3. Multiple shuffles produce different orderings (statistical test)
4. Original question object is not mutated
5. Handle edge case: question with fewer than 4 options
6. Handle edge case: correct index at each position (0, 1, 2, 3)

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/api/api.real.js` | Modify | Add prompt instruction for answer distribution |
| `src/utils/shuffle.js` | New | Fisher-Yates shuffle utility |
| `src/utils/shuffle.test.js` | New | Unit tests for shuffle |
| `src/views/QuizView.js` | Modify | Apply shuffle on replay |

---

## Testing Plan

### Manual Testing

1. **Initial quiz generation:**
   - Generate 3-5 quizzes on different topics
   - Note the position of correct answers
   - Verify distribution is reasonably varied (not all A's)

2. **Replay shuffling:**
   - Complete a quiz and save
   - Replay from Topics/History
   - Verify options are in different order
   - Verify correct answer is still marked correctly
   - Navigate away and back - verify reshuffled again

3. **Edge cases:**
   - Replay while offline (should still shuffle)
   - Sample quizzes (should shuffle on replay)

### Automated Testing

- Unit tests for shuffle function
- E2E test: complete quiz, replay, verify different order

---

## Success Criteria

- [ ] LLM-generated quizzes show varied correct answer positions
- [ ] Replayed quizzes have shuffled options every render
- [ ] Correct answer tracking works after shuffle
- [ ] All existing tests pass
- [ ] New shuffle tests pass

---

## Commits Plan

1. `feat: add shuffle utility for answer randomization`
   - Create shuffle.js with Fisher-Yates implementation
   - Add unit tests

2. `feat: shuffle options on quiz replay`
   - Integrate shuffle in QuizView for replays
   - Detect replay via replaySessionId

3. `feat: improve LLM prompt for answer distribution`
   - Update api.real.js prompt
   - Add instruction for even distribution

---

## Out of Scope

- Settings toggle for shuffle (decided: always on)
- Shuffle on initial play (decided: replay only)
- Tracking shuffle history (not needed)
- Analytics on answer position distribution

---

## Related Documentation

- Original exploration: `docs/product-info/quiz-generator-exploration.md` (lines 1419-1435: Gaming the Assessment)
- QuizView implementation: `src/views/QuizView.js`
- API implementation: `src/api/api.real.js`
