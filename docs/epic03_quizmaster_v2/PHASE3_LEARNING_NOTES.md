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
| **Part 3** | **Dynamic Home Page** | **Complete** |
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

## Part 3: Dynamic Home Page

**Completed:** November 25, 2025
**Duration:** ~60 minutes

### Problem Solved

The home page displayed hardcoded mock data (Geography, Science, History, Movie Trivia) instead of real quiz history from the user's completed quizzes.

### Solution Implemented

1. **Save quiz sessions** to IndexedDB when user completes a quiz
2. **Read sessions** from IndexedDB on home page load
3. **Display dynamically** with color-coded scores and relative dates
4. **Handle empty state** when no quizzes exist yet

### Files Modified

| File | Changes |
|------|---------|
| `src/views/ResultsView.js` | Added `saveQuizSession()` method to save completed quizzes to IndexedDB |
| `src/views/HomeView.js` | Made `render()` async, added `generateRecentTopicsHTML()` and `formatDate()` methods |
| `tests/e2e/app.spec.js` | Updated home page test for empty state, added new test for quiz persistence |
| `playwright.config.js` | Use `cross-env` to force mock API in tests |
| `package.json` | Added `cross-env` as devDependency |

### Session Object Structure

```javascript
{
  topic: "Photosynthesis",       // Topic name for display
  gradeLevel: "5th Grade",       // Grade level used
  timestamp: Date.now(),         // When quiz was taken
  score: 8,                      // Number correct
  totalQuestions: 10,            // Total questions
  questions: [...],              // For replay/review
  answers: [0, 2, 1, ...]        // User's answers
}
```

### Key Concepts Learned

#### 1. Data Denormalization in NoSQL

Stored `topic` name directly in session instead of using a foreign key reference:
- IndexedDB has no JOINs - can't easily combine data from multiple stores
- Faster reads - no second lookup needed
- Offline resilient - sessions work even if topics store is corrupted
- Historical accuracy - old sessions keep original topic name even if renamed later

#### 2. Async View Rendering

Made `render()` async to await IndexedDB operations:
```javascript
async render() {
  const sessions = await getRecentSessions(10);
  const recentTopicsHTML = this.generateRecentTopicsHTML(sessions);
  // ... rest of rendering
}
```

#### 3. Empty State UX

Always handle the case when there's no data:
```javascript
if (!sessions || sessions.length === 0) {
  return `<div>No quizzes yet. Start your first quiz!</div>`;
}
```

#### 4. Cross-Platform Environment Variables

Used `cross-env` package to set environment variables in npm scripts:
- Works on Windows, Mac, and Linux
- Essential for CI/CD pipelines (GitHub Actions runs on Linux)
- Command: `npx cross-env VITE_USE_REAL_API=false vite --port 3000`

#### 5. E2E Test Isolation

Tests that modify database state need careful consideration:
- IndexedDB may persist between tests
- Tests should either clean up after themselves or not depend on clean state
- Using mock API ensures deterministic test results

### Testing Performed

1. **Session saving:** Quiz completed → session appears in IndexedDB ✅
2. **Dynamic display:** Home page shows real quiz with score and date ✅
3. **Empty state:** "No quizzes yet" message when DB empty ✅
4. **Color coding:** Green (≥80%), Orange (50-79%), Red (<50%) ✅
5. **E2E tests:** All 10 tests passing ✅

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

### Session 2 - November 25, 2025
- Completed Part 3: Dynamic Home Page
  - Added session saving in ResultsView.js
  - Made HomeView.js read from IndexedDB
  - Implemented color-coded scores and relative dates
  - Added empty state handling
- Updated E2E tests
  - Changed home page test to check empty state (was checking hardcoded data)
  - Added new test: "should display completed quiz on home page"
  - Fixed Playwright config with `cross-env` for cross-platform env vars
  - Installed `cross-env` as devDependency
- All 10 E2E tests passing

**Progress:** 3 of 5 parts complete (Part 1, Part 2 & Part 3)
**Next session:** Part 4 - Settings Page
