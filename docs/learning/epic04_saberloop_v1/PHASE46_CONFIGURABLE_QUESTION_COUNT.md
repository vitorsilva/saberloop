# Phase 46: Configurable Question Count

## Overview

Enable the "Default Questions Per Quiz" setting and wire it through the entire flow so users can choose between 5, 10, or 15 questions per quiz.

## Problem Statement

**Current State:**
- Settings page shows "Default Questions Per Quiz" dropdown but it's **disabled**
- The value is stored in settings (`questionsPerQuiz: '10'`) but never used
- `api.real.js` has hardcoded "Generate exactly 5 multiple-choice questions"
- Validation expects exactly 5 questions

**Desired State:**
- User can select 5, 10, or 15 questions in Settings
- Quiz generation uses the selected count
- All layers pass the count correctly

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Valid options | 5, 10, 15 only | Keep existing UI, reasonable range |
| Override per quiz? | No - use global setting | Simpler UX, less clutter on TopicInputView |
| Difficulty distribution | LLM decides ("mix of difficulties") | More natural, scales automatically |

## Implementation Plan

### 46.1 - Enable Settings Dropdown

**File:** `src/views/SettingsView.js`

**Changes:**
- Remove `disabled` attribute from questionsPerQuiz select
- Remove `opacity-50` class
- Remove `cursor-not-allowed` class

**Lines:** ~46-57

```html
<!-- Before -->
<label class="flex flex-col opacity-50">
  <select id="questionsPerQuiz" disabled class="... cursor-not-allowed">

<!-- After -->
<label class="flex flex-col">
  <select id="questionsPerQuiz" data-testid="questions-per-quiz-select" class="...">
```

---

### 46.2 - Pass Question Count Through LoadingView

**File:** `src/views/LoadingView.js`

**Changes:**
- Import `getSetting` from settings
- Read `questionsPerQuiz` setting
- Add to options passed to `generateQuestions`

```javascript
import { getSetting } from '../core/settings.js';

// In startQuizGeneration():
const questionCount = parseInt(getSetting('questionsPerQuiz'), 10) || 5;

const options = {
  language: getCurrentLanguage(),
  questionCount
};
```

---

### 46.3 - Update quiz-service.js Interface

**File:** `src/services/quiz-service.js`

**Changes:**
- Document `questionCount` in options JSDoc
- Pass through to API (already passes options object)

```javascript
/**
 * @param {Object} options - Optional settings
 * @param {number} options.questionCount - Number of questions to generate (default: 5)
 * @param {string} options.language - Language code
 */
```

No code change needed - options already passed through.

---

### 46.4 - Update api.real.js

**File:** `src/api/api.real.js`

**Changes:**

1. **Extract questionCount from options** (with default 5):
```javascript
const { previousQuestions = [], language = 'en', questionCount = 5 } = options;
```

2. **Update prompt** (line ~50):
```javascript
const prompt = `You are an expert educational content creator. Generate exactly ${questionCount}
multiple-choice questions about "${topic}" appropriate for ${gradeLevel} students.
```

3. **Update difficulty instruction** (line ~64):
```javascript
  - Include a mix of difficulty levels: easy, medium, and challenging
```

4. **Update validation** (line ~131):
```javascript
if (!data.questions || !Array.isArray(data.questions) || data.questions.length !== questionCount) {
  logger.error('Invalid questions structure', { expected: questionCount, received: data.questions?.length });
  throw new Error('AI returned invalid question format');
}
```

5. **Update answer distribution instruction** (line ~76-79):
```javascript
  CORRECT ANSWER DISTRIBUTION:
  - Distribute correct answers across positions A, B, C, D
  - Vary which position has the correct answer across all questions
  - Do NOT cluster all correct answers in the same position
```

---

### 46.5 - Update api.mock.js

**File:** `src/api/api.mock.js`

**Changes:**
- Accept `questionCount` from options
- Generate that many mock questions (repeat/cycle the template)

```javascript
export async function generateQuestions(topic, gradeLevel = 'middle school', _apiKey, options = {}) {
  const { previousQuestions = [], questionCount = 5 } = options;

  // Base questions template
  const questionTemplates = [...]; // existing 5 templates

  // Generate requested number of questions
  const mockQuestions = [];
  for (let i = 0; i < questionCount; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    mockQuestions.push({
      ...template,
      question: template.question.replace('${topic}', topic)
    });
  }

  return { language: 'EN-US', questions: mockQuestions };
}
```

---

### 46.6 - Unit Tests

**New tests needed:**

1. **settings.test.js** - Verify questionsPerQuiz default and persistence
2. **api.real.test.js** - Add test for questionCount in prompt
3. **api.mock.test.js** - Add test for variable question count

**Test cases:**
- Default question count is 5 when not specified
- Question count of 10 generates 10 questions
- Question count of 15 generates 15 questions
- Invalid/missing questionCount defaults to 5

---

### 46.7 - E2E Tests

**File:** `tests/e2e/app.spec.js`

**New test:**
```javascript
test('should respect questions per quiz setting', async ({ page }) => {
  // Set questionsPerQuiz to 10 in settings
  // Generate a quiz
  // Verify 10 questions are generated (check progress indicator or results)
});
```

**Update existing tests:**
- Tests that check for "5/5" or similar may need adjustment
- Mock API should return correct count based on setting

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/views/SettingsView.js` | Modify | Enable dropdown, add data-testid |
| `src/views/LoadingView.js` | Modify | Read setting, pass to API |
| `src/services/quiz-service.js` | Modify | Update JSDoc only |
| `src/api/api.real.js` | Modify | Dynamic count in prompt + validation |
| `src/api/api.mock.js` | Modify | Generate N questions |
| `src/api/api.real.test.js` | Modify | Add questionCount tests |
| `tests/e2e/app.spec.js` | Modify | Add settings test |

---

## Testing Plan

### Unit Tests
- [ ] Settings default questionsPerQuiz is '10'
- [ ] api.real.js uses questionCount in prompt
- [ ] api.real.js validates correct count
- [ ] api.mock.js returns requested count

### E2E Tests
- [ ] Settings dropdown is enabled and functional
- [ ] Changing setting persists after refresh
- [ ] Quiz generates correct number of questions

### Manual Testing
1. Go to Settings, verify dropdown is enabled
2. Select "5 questions", generate quiz, verify 5 questions
3. Select "15 questions", generate quiz, verify 15 questions
4. Verify score display shows correct total (e.g., "12/15")

---

## Commits Plan

1. `feat: enable questions per quiz setting`
   - Enable dropdown in SettingsView
   - Add data-testid

2. `feat: pass question count to quiz generation`
   - LoadingView reads setting
   - Update quiz-service JSDoc

3. `feat: support dynamic question count in API`
   - api.real.js prompt and validation
   - api.mock.js generates N questions

4. `test: add question count unit tests`
   - api.real.test.js
   - api.mock.test.js (if needed)

5. `test: add E2E test for question count setting`

6. `docs: add Phase 46 plan`

---

## Success Criteria

- [ ] Settings dropdown enabled and functional
- [ ] Quiz generates 5, 10, or 15 questions based on setting
- [ ] Score displays correctly (e.g., "8/10", "12/15")
- [ ] All existing tests pass
- [ ] New unit tests for question count
- [ ] E2E test for settings
- [ ] Architecture tests pass (`npm run arch:test`)

---

## Out of Scope

- Custom question count input (only 5, 10, 15)
- Per-quiz override on TopicInputView
- Difficulty distribution configuration
- Question count for replay (uses original count)

---

## Related Files

- Settings: `src/core/settings.js`
- Views: `SettingsView.js`, `LoadingView.js`, `TopicInputView.js`
- Services: `quiz-service.js`
- API: `api.real.js`, `api.mock.js`
- Tests: `settings.test.js`, `api.real.test.js`, `app.spec.js`
