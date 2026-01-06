# Phase 79: Answer Label Order Fix - Learning Notes

## Session: 2026-01-06

### Overview

Fixed Issue #79 where answer labels (A, B, C, D) appeared in random order after shuffling during quiz replay.

### Bug Discovery

User reported that when replaying a quiz, the answer options showed labels like "C, A, B, D" instead of sequential "A, B, C, D". The screenshot clearly showed the problem - the labels were embedded in the shuffled content.

### Root Cause Analysis

**Problem location:** The Phase 45 answer randomization feature (`src/utils/shuffle.js`)

**Root cause:** The LLM generates options with embedded prefixes:
```javascript
"options": ["A) Paris", "B) London", "C) Berlin", "D) Madrid"]
```

When `shuffleQuestionOptions()` shuffles the array, it shuffles the entire strings including the prefixes, resulting in jumbled labels.

**Code flow:**
1. LLM generates options with embedded prefixes → stored in IndexedDB
2. User replays quiz → QuizView calls `shuffleAllQuestions()`
3. Shuffle reorders options → prefixes move with content
4. UI renders shuffled options with wrong label order

### Solution Implemented

Added prefix normalization to the shuffle function:

1. **New helper functions:**
   - `stripPrefix(option)` - Removes A-D prefixes using regex `/^[A-Da-d][).]\s*/`
   - `addPrefix(option, index)` - Adds sequential label based on position

2. **Modified `shuffleQuestionOptions()`:**
   - Strip prefixes before shuffling
   - Shuffle clean answer text
   - Re-add sequential A, B, C, D prefixes after shuffle

### Key Implementation Details

```javascript
// Regex handles: "A) text", "A. text", "a) text", "a. text"
const PREFIX_PATTERN = /^[A-Da-d][).]\s*/;

// Strip and re-add prefixes during shuffle
const cleanOptions = options.map(opt => stripPrefix(opt));
const shuffledOptions = shuffledIndices.map((originalIndex, newIndex) =>
  addPrefix(cleanOptions[originalIndex], newIndex)
);
```

### Testing Strategy

1. **Failing test first:** Added test that expects A, B, C, D labels - confirmed it failed before fix
2. **Unit tests:** 37 total tests covering:
   - Prefix stripping for various formats (A), B., c), etc.)
   - Prefix adding for all positions
   - Label normalization after shuffle
   - Edge cases (empty, null, non-string)
3. **E2E test:** Replay quiz and verify sequential labels
4. **Mutation testing:** 83.33% score (above 80% threshold)

### Difficulties & Solutions

**Difficulty 1:** Existing tests expected old behavior (labels preserved)
- **Solution:** Updated tests to check content rather than exact strings with labels

**Difficulty 2:** E2E test failing due to whitespace in text content
- **Solution:** Added `.trim()` to text content before regex matching

**Difficulty 3:** Some mutation testing survivors
- **Cause:** Tests check pattern `/^A\)/` but don't verify exact letter
- **Decision:** Accepted at 83.33% - above threshold, survivors are edge cases

### Gotchas for Future Reference

1. **Options include embedded prefixes** - stored in IndexedDB this way from LLM
2. **Shuffle happens on replay only** - per Phase 45 design decision
3. **Regex pattern** must handle both `)` and `.` delimiters, uppercase and lowercase

### Test Results

- Unit tests: 415 passed
- E2E tests: Passed
- Mutation score: 83.33%
- Architecture tests: No new violations

### Files Changed

| File | Change |
|------|--------|
| `src/utils/shuffle.js` | Added prefix helpers, modified shuffle logic |
| `src/utils/shuffle.test.js` | Updated + 19 new tests |
| `tests/e2e/quiz-replay-labels.spec.js` | New E2E test |
| `docs/issues/79.md` | Issue plan |
| `docs/issues/79-after.png` | After screenshot |

### Commits

1. `test: add failing test for answer label order after shuffle`
2. `fix: normalize answer labels after shuffle`
3. `test: add E2E test for replay label order`
4. `docs: update issue plan with completion status`

### PR

- Issue: https://github.com/vitorsilva/saberloop/issues/79
- PR: https://github.com/vitorsilva/saberloop/pull/80
