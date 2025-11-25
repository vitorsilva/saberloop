# Phase 3 Learning Notes: UI Polish

**Epic:** 3 - QuizMaster V2
**Phase:** 3 - UI Polish
**Status:** In Progress
**Started:** November 25, 2025

---

## Phase 3 Structure

| Part | Focus | Status |
|------|-------|--------|
| **Part 1** | **Loading Screen for Quiz Generation** | **Complete** |
| **Part 2** | **Multi-Language Question Generation** | **Complete** |
| Part 3 | Dynamic Home Page | Pending |
| Part 4 | Settings Page | Pending |
| Part 5 | Navigation Updates | Pending |

---

## Part 1: Loading Screen for Quiz Generation

**Completed:** November 25, 2025
**Duration:** ~45 minutes

### Problem Solved

When users clicked "Generate Questions", they saw a blank screen for 5+ seconds while waiting for the API response. No feedback about what was happening.

### Solution Implemented

Created a dedicated `LoadingView.js` that:
1. Shows immediately when user clicks "Generate Questions"
2. Displays animated spinner and rotating status messages
3. Shows topic name and grade level for confirmation
4. Handles offline detection with warning
5. Includes cancel button with confirmation
6. Navigates to QuizView on success, back to TopicInput on error

### New Flow

```
Before: TopicInput → Quiz (blank while loading)
After:  TopicInput → Loading → Quiz
```

### Files Created/Modified

| File | Changes |
|------|---------|
| `src/views/LoadingView.js` | **NEW** - Loading screen with spinner, messages, offline detection |
| `src/views/TopicInputView.js` | Navigate to `/loading` instead of `/quiz` |
| `src/views/QuizView.js` | Get pre-generated questions from state |
| `src/main.js` | Register `/loading` route |
| `tests/e2e/app.spec.js` | Updated 5 tests to expect `/loading` before `/quiz` |
| `playwright.config.js` | Use `npx vite` instead of `netlify dev` for mock API |

### Key Concepts Learned

#### 1. Separation of Concerns

Instead of making QuizView handle both loading AND displaying quiz, we separated them:
- **LoadingView** - handles API call, shows progress
- **QuizView** - just displays quiz (receives questions via state)

This makes each component simpler and more focused.

#### 2. State as Communication Between Views

Views can pass data to each other via global state:
```javascript
// LoadingView stores questions
state.set('generatedQuestions', result.questions);
state.set('quizLanguage', result.language);
this.navigateTo('/quiz');

// QuizView retrieves questions
const questions = state.get('generatedQuestions');
state.set('generatedQuestions', null); // Clear after use
```

#### 3. Proper Cleanup in Views

When a view has intervals/timers, clean them up:
```javascript
cleanup() {
  if (this.messageInterval) {
    clearInterval(this.messageInterval);
    this.messageInterval = null;
  }
}

destroy() {
  this.cleanup();
  super.destroy();
}
```

#### 4. E2E Test Configuration

- Tests should use **mock API** (deterministic, fast, free)
- Changed Playwright webServer from `netlify dev` to `npx vite`
- Tests explicitly check for loading screen: `await expect(page).toHaveURL(/#\/loading/);`

### Testing Performed

1. **Normal flow:** Topic input → Loading screen → Quiz ✅
2. **Cancel button:** Shows confirmation, returns to topic input ✅
3. **Offline detection:** Shows warning message when offline ✅
4. **E2E tests:** All 9 tests passing ✅

---

## Part 2: Multi-Language Question Generation

**Completed:** November 25, 2025
**Duration:** ~30 minutes

### Problem Solved

When users entered topics in languages other than English (e.g., "Sistema Digestivo" in Portuguese), the questions were still generated in English. This created a jarring mixed-language experience for international users.

### Solution Implemented

Updated backend prompts to:
1. Detect the language of the topic
2. Generate ALL content (questions + answers + explanations) in that same language
3. Return the detected language as a locale code (e.g., "PT-PT", "EN-US")

### Files Modified

| File | Changes |
|------|---------|
| `netlify/functions/generate-questions.js` | Added language detection prompt, returns `{ language, questions }` object |
| `netlify/functions/generate-explanation.js` | Added language detection to explanation prompt |
| `src/api/api.real.js` | Returns `{ language, questions }` object instead of just array |
| `src/api/api.mock.js` | Returns `{ language: 'EN-US', questions }` to match real API |
| `src/views/QuizView.js` | Extracts `result.questions` and stores `result.language` |

### Key Concepts Learned

#### 1. Prompt Engineering for Language Detection

**Why do it in the prompt instead of frontend?**
- Claude already knows how to detect languages (trained on multilingual data)
- No external libraries needed (no `franc`, `langdetect`, etc.)
- No extra API calls - detection happens within the same request
- Context-aware detection (understands "Sistema Digestivo" is Portuguese even without special characters)

**Prompt engineering techniques used:**
1. **Explicit instruction** - "Generate ALL questions in the SAME language"
2. **Concrete examples** - Show input/output language pairs
3. **Emphasis** - Use caps and "CRITICAL" to highlight importance
4. **Repetition** - Mention language requirement multiple times
5. **Negative instruction** - "Do NOT mix languages"

#### 2. API Contract Changes

When you change what an API returns, you must update ALL consumers:
- **Real API** (`api.real.js`) - Changed return structure
- **Mock API** (`api.mock.js`) - Must match the same interface
- **Frontend** (`QuizView.js`) - Must handle new structure
- **Tests** - Would need updating if they existed

**Before:**
```javascript
return questions;  // Array
```

**After:**
```javascript
return {
  language: 'PT-PT',
  questions: questions
};
```

#### 3. Locale Codes

Chose locale codes (e.g., "PT-PT", "EN-US") over simple codes ("pt", "en") or full names ("Portuguese") because:
- More precise (Portuguese from Portugal vs Brazil)
- ISO standard format
- Can be used for future i18n features

### JSON Response Structure

**Generate Questions Response:**
```json
{
  "language": "PT-PT",
  "questions": [
    {
      "question": "Qual é a função principal do estômago?",
      "options": [
        "A) Absorver nutrientes",
        "B) Digerir alimentos com ácido gástrico",
        "C) Filtrar toxinas",
        "D) Produzir insulina"
      ],
      "correct": 1,
      "difficulty": "easy"
    }
  ]
}
```

### Testing Performed

1. **English Topic:** "Photosynthesis"
   - Result: Questions in English, language: "EN-US"

2. **Portuguese Topic:** "Sistema Digestivo"
   - Result: Questions in Portuguese, language: "PT-PT"

3. **Explanation Endpoint:** Verified explanations match question language

---

## Next Up: Part 1 - Loading Screen

**Problem:** When users click "Generate Questions", they see a blank screen for 5+ seconds while waiting for the API response.

**Solution:** Create a dedicated `LoadingView.js` with:
- Animated spinner
- Topic name display
- Rotating status messages
- Cancel button

---

## Session Log

### Session 1 - November 25, 2025
- Started Phase 3
- Completed Part 2: Multi-Language Question Generation
  - Updated prompts for language detection
  - Added `language` field to API response
  - Updated all API consumers (real, mock, QuizView)
- Completed Part 1: Loading Screen for Quiz Generation
  - Created LoadingView.js with spinner, messages, offline detection
  - Updated navigation flow: TopicInput → Loading → Quiz
  - Fixed E2E tests to expect loading screen
  - Fixed Playwright config to use mock API
- Fixed backend bug (duplicate line in prompt)
- All 9 E2E tests passing

**Progress:** 2 of 5 parts complete (Part 1 & Part 2)
**Next session:** Part 3 - Dynamic Home Page
