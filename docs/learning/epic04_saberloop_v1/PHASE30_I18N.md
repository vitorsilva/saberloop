# Internationalization (i18n) - Learning Plan

## Overview

This plan transforms Saberloop from an English-only application to a fully internationalized app supporting multiple languages. The implementation covers:

- **UI Translation** - All static text (buttons, labels, messages) translated
- **AI Content Localization** - Quiz questions and explanations generated in the user's preferred language
- **Locale-Aware Formatting** - Dates, numbers, and relative times formatted per locale
- **Translation Workflow** - Hybrid approach with manual + CLI-assisted translations
- **Test Migration** - Update E2E tests to use data-testid instead of text matching

**Project Impact**: Makes Saberloop accessible to users worldwide, significantly expanding potential user base.

---

## What You'll Learn

### New Technologies & Concepts

1. **i18next** - Industry-standard i18n library for JavaScript
2. **Intl API** - Browser's built-in internationalization APIs
3. **Translation Keys** - Organizing text with namespaces and nested keys
4. **Pluralization** - Handling plural forms across languages
5. **Interpolation** - Dynamic values in translated strings
6. **Language Detection** - Auto-detecting user's preferred language
7. **Lazy Loading** - Loading translations on-demand
8. **Translation Memory** - Caching API-generated translations
9. **data-testid Pattern** - Decoupling tests from UI text

---

## Prerequisites

Before starting this plan, you should have:

- ✅ **Epic 03 Phase 3** complete (Settings page exists)
- ✅ **IndexedDB** working (for caching translations)
- ✅ **OpenRouter integration** working (for AI content)
- ✅ Understanding of ES6 modules
- ✅ E2E tests passing (will be migrated)

---

## Pre-Phase: Staging Environment (Complete)

**Status:** ✅ Complete (December 27, 2024) - PR #39

Before implementing i18n, we set up a staging environment for safe testing of large changes.

**Deliverables:**
- [x] Staging URL: https://saberloop.com/app-staging/
- [x] `npm run build:staging` - Build with staging base path
- [x] `npm run deploy:staging` - Deploy to staging
- [x] `npm run build:deploy:staging` - Combined build and deploy
- [x] Manifest validation to prevent build/deploy mismatches
- [x] Documentation: `docs/developer-guide/STAGING_DEPLOYMENT.md`

**Key Decisions:**
- Portuguese variant: **pt-PT** (European Portuguese)
- Settings storage: **localStorage** (keep current pattern, i18next default)
- FAQ translation: **Skip for now** (English-only initially)

**Workflow for Phase 30:**
1. Complete each sub-phase
2. Deploy to staging: `npm run build:deploy:staging`
3. Test at https://saberloop.com/app-staging/
4. When all sub-phases complete, merge to main
5. Deploy to production: `npm run build:deploy`

---

## Current State Analysis

### Architecture Overview

```
Current LLM Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ User types  │────►│ src/api/api.real.js  │────►│ OpenRouter API  │
│ topic       │     │ (auto-detect lang)   │     │ (via browser)   │
└─────────────┘     └──────────────────────┘     └─────────────────┘

Target LLM Flow:
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ User sets   │────►│ src/api/api.real.js  │────►│ OpenRouter API  │
│ language    │     │ (use user setting)   │     │ (via browser)   │
└─────────────┘     └──────────────────────┘     └─────────────────┘
```

**Key Files:**
- `src/api/api.real.js` - LLM prompts (OpenRouter client-side)
- `src/api/openrouter-client.js` - Direct browser → OpenRouter calls
- `src/api/api.mock.js` - Mock API (stays English-only for dev)

### Where Strings Live Today

```
src/views/
├── HomeView.js        # "Welcome back!", "Start New Quiz", "Recent Topics", etc.
├── QuizView.js        # "Question X of Y", "Next Question", "Submit Answer"
├── ResultsView.js     # "Quiz Complete!", "Your Score", "Correct", "Incorrect"
├── SettingsView.js    # "Settings", "API Key", "Save", etc.
├── TopicInputView.js  # "Enter a topic", "Grade Level", "Start Quiz"
├── LoadingView.js     # "Generating questions...", "Please wait"
└── WelcomeView.js     # Onboarding text

src/components/
├── ConnectModal.js    # Modal text
└── ...

src/utils/
├── network.js         # "You're offline" messages
└── ...
```

### String Categories

| Category | Examples | Count (Est.) |
|----------|----------|--------------|
| **Navigation** | Home, Settings, Topics | ~10 |
| **Actions** | Start Quiz, Submit, Next | ~15 |
| **Labels** | Question X of Y, Score | ~20 |
| **Messages** | Errors, confirmations | ~15 |
| **Dates** | Today, Yesterday, X days ago | ~5 |
| **Errors** | Network error, API key, Rate limit | ~10 |
| **Placeholders** | "Your text will appear here..." | ~2 |
| **Dynamic** | AI-generated content | N/A |

**Total static strings**: ~75 strings to extract (including error messages)

### E2E Tests with Hardcoded Strings

**Critical Issue**: `tests/e2e/app.spec.js` has ~38 text-based assertions that will break with i18n:

| String | Occurrences | Notes |
|--------|-------------|-------|
| `'Welcome back!'` | 7 | Static heading |
| `'Recent Topics'` | 1 | Static heading |
| `'New Quiz'` | 1 | Static heading |
| `'Question 1 of 5'` | 3 | Interpolated text |
| `'Are you sure you want to leave?'` | 1 | **Browser dialog (special)** |
| `'No quizzes yet'` | 1 | Static message |
| `'Today'` | 1 | **Intl.RelativeTimeFormat** |
| `'Great Job!'` | 1 | Static message |
| `'Review Your Answers'` | 1 | Static heading |
| `'Settings'` | 1 | Static heading |
| `'Preferences'` | 1 | Static heading |
| `"You're offline"` | 1 | Static banner |
| `'Quiz History'` | 1 | Static heading |
| `'Science Quiz'` | 1 | **Dynamic: `${topic} Quiz`** |
| `'Ancient Egypt Quiz'` | 1 | **Dynamic: `${topic} Quiz`** |
| `'Marine Biology Quiz'` | 1 | **Dynamic: `${topic} Quiz`** |
| `'80%'` | 1 | **Locale-dependent format** |
| `'5/5'` | 2 | Score format |
| `'About'` | 1 | Static label |
| `'Version'` | 1 | Static label |
| `'View on GitHub'` | 1 | Static link text |
| `'Results'` | 1 | Static heading |

**Solution**: Migrate to `data-testid` attributes (Phase 2).

### Unit Tests with Hardcoded Strings

**Also affected**: Unit tests check error messages and placeholder text:

**`src/utils/errorHandler.test.js`** (8 assertions):
| String | Notes |
|--------|-------|
| `'Network error'` | User-facing error |
| `'API key'` | User-facing error |
| `'Rate limit'` | User-facing error |
| `'timed out'` | User-facing error |
| `'An error occurred'` | User-facing error |

**`src/api/openrouter-client.test.js`** (4 assertions):
| String | Notes |
|--------|-------|
| `'Invalid API key'` | Thrown error message |
| `'Rate limit exceeded'` | Thrown error message |
| `'Insufficient credits'` | Thrown error message |
| `'Empty response from OpenRouter'` | Thrown error message |

**`src/app.test.js`** (1 assertion):
| String | Notes |
|--------|-------|
| `'Your text will appear here...'` | Placeholder text |

**Decision**: Error messages WILL be translated (user-facing). Unit tests will need to import translation keys or check for key substrings that remain constant.

---

## Architecture

### Recommended Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    i18n Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │  i18next         │      │  Translation Files        │    │
│  │  (Core library)  │◄────►│  /public/locales/{lang}  │    │
│  └────────┬─────────┘      └──────────────────────────┘    │
│           │                                                  │
│           │  t('key')                                        │
│           ▼                                                  │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │  Views/Components│      │  User Settings            │    │
│  │  (UI Layer)      │◄────►│  (IndexedDB)             │    │
│  └──────────────────┘      │  - preferredLanguage     │    │
│                            └──────────────────────────┘    │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │  src/api/        │      │  Translation Cache        │    │
│  │  api.real.js     │◄────►│  (IndexedDB)             │    │
│  │  +language param │      │  - API translations      │    │
│  └──────────────────┘      └──────────────────────────┘    │
│                                                              │
│  ┌──────────────────┐                                       │
│  │  Intl API        │  ← Browser native                     │
│  │  - DateTimeFormat│                                       │
│  │  - RelativeTime  │                                       │
│  │  - NumberFormat  │                                       │
│  └──────────────────┘                                       │
│                                                              │
│  ┌──────────────────┐                                       │
│  │  CLI Translator  │  ← npm run translate:es               │
│  │  scripts/        │                                       │
│  │  translate.js    │                                       │
│  └──────────────────┘                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Why i18next?

| Feature | i18next | Custom Solution |
|---------|---------|-----------------|
| **Maturity** | 10+ years, battle-tested | Unproven |
| **Pluralization** | Built-in, all languages | Complex to implement |
| **Interpolation** | `{{name}}` syntax | Must build |
| **Namespaces** | Organize by feature | Manual |
| **Lazy Loading** | Plugin available | Must build |
| **Fallbacks** | Automatic | Must build |
| **TypeScript** | Full support | N/A |
| **Community** | Huge ecosystem | None |
| **Bundle Size** | ~40KB (with plugins) | Smaller but limited |

**Recommendation**: Use i18next - it's the industry standard for JavaScript i18n.

---

## Phase Structure

### **Phase 1: i18n Infrastructure Setup** (1 session)

Set up the foundation for internationalization.

**Learning Objectives:**
- Install and configure i18next
- Understand translation file structure
- Create the i18n initialization module
- Set up language detection

**Deliverables:**
- [ ] `npm install i18next i18next-browser-languagedetector`
- [ ] `src/core/i18n.js` - i18n configuration
- [ ] `public/locales/en.json` - English translations (starter)
- [ ] `public/locales/pt.json` - Portuguese translations (starter)
- [ ] Basic integration test

**Implementation:**

```javascript
// src/core/i18n.js
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: { translation: {} },  // Will be loaded
  pt: { translation: {} }
};

await i18next
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // Not needed for vanilla JS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export const t = i18next.t.bind(i18next);
export const changeLanguage = i18next.changeLanguage.bind(i18next);
export default i18next;
```

**Translation File Structure:**
```json
// public/locales/en.json
{
  "common": {
    "home": "Home",
    "settings": "Settings",
    "topics": "Topics",
    "save": "Save",
    "cancel": "Cancel"
  },
  "home": {
    "welcome": "Welcome back!",
    "startQuiz": "Start New Quiz",
    "recentTopics": "Recent Topics",
    "noQuizzes": "No quizzes yet",
    "startFirst": "Start your first quiz to see it here!"
  },
  "quiz": {
    "questionOf": "Question {{current}} of {{total}}",
    "nextQuestion": "Next Question",
    "submitAnswer": "Submit Answer",
    "confirmLeave": "Are you sure you want to leave? Your progress will be lost."
  },
  "results": {
    "title": "Results",
    "reviewAnswers": "Review Your Answers",
    "greatJob": "Great Job!",
    "tryAnother": "Try Another Topic"
  },
  "dates": {
    "today": "Today",
    "yesterday": "Yesterday",
    "daysAgo": "{{count}} days ago"
  },
  "offline": {
    "banner": "You're offline. You can replay saved quizzes below."
  }
}
```

**Success Criteria:**
- i18next initializes without errors
- `t('home.welcome')` returns "Welcome back!"
- Language detection works (picks browser language)
- Can manually switch languages

---

### **Phase 2: Test Migration to data-testid** (1-2 sessions)

Migrate E2E tests from text-based selectors to data-testid attributes.

**Learning Objectives:**
- Understand why text-based tests break with i18n
- Learn the data-testid pattern
- Systematically update views and tests
- Maintain test coverage during migration

**Why This Phase is Critical:**
- Tests currently check `toContainText('Welcome back!')`
- When UI is translated, these tests will fail
- `data-testid` decouples tests from displayed text
- Industry best practice for internationalized apps

**Deliverables:**
- [ ] Add data-testid attributes to all tested elements in views
- [ ] Update `tests/e2e/app.spec.js` to use data-testid selectors
- [ ] Verify all tests still pass
- [ ] Document testing conventions

**Migration Pattern:**

```javascript
// BEFORE (in HomeView.js)
<h2 class="...">Welcome back!</h2>

// AFTER (in HomeView.js)
<h2 class="..." data-testid="welcome-heading">${t('home.welcome')}</h2>
```

```javascript
// BEFORE (in app.spec.js)
await expect(page.locator('h2')).toContainText('Welcome back!');

// AFTER (in app.spec.js)
await expect(page.locator('[data-testid="welcome-heading"]')).toBeVisible();
```

**Elements to Add data-testid:**

| Element | data-testid | Current Text | Notes |
|---------|-------------|--------------|-------|
| Welcome heading | `welcome-heading` | "Welcome back!" | |
| Recent topics heading | `recent-topics-heading` | "Recent Topics" | |
| No quizzes message | `no-quizzes-message` | "No quizzes yet" | |
| Start quiz button | `start-quiz-btn` | Already has `#startQuizBtn` | Keep ID |
| New quiz heading | `new-quiz-heading` | "New Quiz" | |
| **Quiz title** | `quiz-title` | "Science Quiz" | **Dynamic!** |
| Question progress | `question-progress` | "Question X of Y" | Interpolated |
| Submit button | `submit-btn` | Already has `#submitBtn` | Keep ID |
| Results heading | `results-heading` | "Results" | |
| **Score display** | `score-display` | "80%" | Locale format |
| **Score fraction** | `score-fraction` | "5/5" | |
| Success message | `success-message` | "Great Job!" | |
| Review heading | `review-heading` | "Review Your Answers" | |
| Settings heading | `settings-heading` | "Settings" | |
| Preferences heading | `preferences-heading` | "Preferences" | |
| **About section** | `about-section` | "About" | |
| **Version label** | `version-label` | "Version" | |
| **GitHub link** | `github-link` | "View on GitHub" | |
| Offline banner | `offline-banner` | Already has `#offlineBanner` | Keep ID |
| Quiz history heading | `quiz-history-heading` | "Quiz History" | |

**Special Cases:**

**1. Dynamic Quiz Title (`${topic} Quiz`):**
```javascript
// BEFORE
<h1>${topic} Quiz</h1>

// AFTER
<h1 data-testid="quiz-title">${t('quiz.title', { topic })}</h1>

// Translation key
"quiz": {
  "title": "{{topic}} Quiz"
}

// E2E Test - check visibility, NOT text content
await expect(page.locator('[data-testid="quiz-title"]')).toBeVisible();
```

**2. Browser Dialog (confirm/alert):**
```javascript
// BEFORE - checks exact text
page.once('dialog', dialog => {
  expect(dialog.message()).toContain('Are you sure you want to leave?');
  dialog.dismiss();
});

// AFTER - just verify dialog appeared (text is translated)
page.once('dialog', dialog => {
  expect(dialog.type()).toBe('confirm');
  dialog.dismiss();
});
```

**3. Locale-Dependent Values ("Today", "80%"):**
```javascript
// Don't check exact text - it changes per locale
// BEFORE
await expect(page.locator('text=Today')).toBeVisible();
await expect(page.locator('text=80%')).toBeVisible();

// AFTER - use data-testid, check visibility only
await expect(page.locator('[data-testid="quiz-date"]')).toBeVisible();
await expect(page.locator('[data-testid="score-display"]')).toBeVisible();
```

**Testing Conventions Document:**

```markdown
## E2E Testing Conventions

### Selectors (Priority Order)
1. `data-testid` - For elements that need testing
2. `#id` - For interactive elements (buttons, inputs)
3. `.class` - For groups of similar elements
4. Tag selectors - Avoid for text content

### Naming Convention
- Use kebab-case: `data-testid="welcome-heading"`
- Be descriptive: `quiz-progress` not `qp`
- Include element type: `*-heading`, `*-btn`, `*-input`

### What NOT to Test
- Exact translated text (will change per language)
- CSS classes for styling (can change)
- DOM structure (implementation detail)

### What TO Test
- Element visibility
- Element presence
- User interactions (click, type)
- Navigation (URL changes)
- State changes (enabled/disabled)
```

**Success Criteria:**
- All E2E tests pass using data-testid selectors
- No tests rely on specific English text
- Tests will work regardless of UI language
- Testing conventions documented

---

### **Phase 3: String Extraction & Migration** (2-3 sessions)

Extract all hardcoded strings from views and replace with translation keys.

**Learning Objectives:**
- Identify all translatable strings
- Organize strings into logical namespaces
- Handle interpolation (dynamic values)
- Understand pluralization patterns
- Translate error messages (user-facing)

**Deliverables:**
- [ ] Complete `en.json` with all strings (~75 keys including errors)
- [ ] Updated `HomeView.js` using `t()` function
- [ ] Updated `QuizView.js` using `t()` function
- [ ] Updated `ResultsView.js` using `t()` function
- [ ] Updated `SettingsView.js` using `t()` function
- [ ] Updated `TopicInputView.js` using `t()` function
- [ ] Updated `LoadingView.js` using `t()` function
- [ ] Updated all components using `t()` function
- [ ] Updated `errorHandler.js` with translated errors
- [ ] Updated `openrouter-client.js` with translated errors
- [ ] Updated `app.js` placeholder text
- [ ] Updated unit tests for translated strings

**Migration Pattern:**

```javascript
// BEFORE
<h2>Welcome back!</h2>
<p>Question ${index + 1} of ${total}</p>

// AFTER
import { t } from '../core/i18n.js';

<h2 data-testid="welcome-heading">${t('home.welcome')}</h2>
<p data-testid="question-progress">${t('quiz.questionOf', { current: index + 1, total })}</p>
```

**Handling Plurals:**
```json
{
  "dates": {
    "daysAgo_one": "{{count}} day ago",
    "daysAgo_other": "{{count}} days ago"
  }
}
```

```javascript
t('dates.daysAgo', { count: 3 }); // "3 days ago"
t('dates.daysAgo', { count: 1 }); // "1 day ago"
```

**Error Message Translation:**

```json
// public/locales/en.json - errors namespace
{
  "errors": {
    "network": "Network error. Please check your connection and try again.",
    "apiKey": "Invalid API key. Please reconnect with OpenRouter.",
    "rateLimit": "Rate limit exceeded. Free tier allows 50 requests/day.",
    "insufficientCredits": "Insufficient credits. Add credits at openrouter.ai",
    "timeout": "Request timed out. Please try again.",
    "generic": "An error occurred. Please try again.",
    "emptyResponse": "Empty response from AI. Please try again."
  },
  "placeholders": {
    "textOutput": "Your text will appear here..."
  }
}
```

```javascript
// src/utils/errorHandler.js - BEFORE
if (message.includes('network') || message.includes('Failed to fetch')) {
  return 'Network error. Please check your connection and try again.';
}

// src/utils/errorHandler.js - AFTER
import { t } from '../core/i18n.js';

if (message.includes('network') || message.includes('Failed to fetch')) {
  return t('errors.network');
}
```

**Unit Test Updates:**

Since error messages are now translated, unit tests need adjustment:

```javascript
// BEFORE - checks exact English text
it('should return network error message for fetch errors', () => {
  const error = new Error('Failed to fetch');
  const message = handleApiError(error);
  expect(message).toContain('Network error');
});

// AFTER - Option A: Check translation key was used
it('should return network error message for fetch errors', () => {
  const error = new Error('Failed to fetch');
  const message = handleApiError(error);
  // Import English translations for test verification
  expect(message).toBe(translations.errors.network);
});

// AFTER - Option B: Mock i18n and check key
it('should return network error message for fetch errors', () => {
  const error = new Error('Failed to fetch');
  const message = handleApiError(error);
  expect(t).toHaveBeenCalledWith('errors.network');
});
```

**Recommended Approach for Unit Tests:**
1. Create a test helper that loads English translations
2. Compare against the English translation value
3. This verifies the correct key is used without hardcoding

```javascript
// tests/helpers/i18n-test-helper.js
import en from '../../public/locales/en.json';

export function getTranslation(key) {
  const keys = key.split('.');
  let value = en;
  for (const k of keys) {
    value = value[k];
  }
  return value;
}

// In test file
import { getTranslation } from '../helpers/i18n-test-helper.js';

expect(message).toBe(getTranslation('errors.network'));
```

**Success Criteria:**
- All static strings extracted (~75 keys)
- All error messages use translation keys
- App displays correctly with English
- No hardcoded user-facing text remains
- Interpolation works for dynamic content
- E2E tests still pass (using data-testid)
- Unit tests pass with translated error messages

---

### **Phase 4: Language Settings UI** (1 session)

Add language preference to Settings page.

**Learning Objectives:**
- Build language selector component
- Persist preference to IndexedDB
- Apply language on app load
- Handle language change (re-render)

**Deliverables:**
- [ ] Language selector in SettingsView
- [ ] `settings.language` stored in IndexedDB
- [ ] Load saved language on app startup
- [ ] Re-render views on language change

**Implementation:**

```javascript
// In SettingsView.js
<div class="setting-group" data-testid="language-setting">
  <label>${t('settings.language')}</label>
  <select id="languageSelect" data-testid="language-select">
    <option value="en">English</option>
    <option value="pt">Português</option>
    <option value="es">Español</option>
    <!-- Add more as translations are added -->
  </select>
</div>
```

```javascript
// Language change handler
languageSelect.addEventListener('change', async (e) => {
  const lang = e.target.value;
  await changeLanguage(lang);
  await saveSetting('language', lang);
  // Re-render current view
  this.render();
});
```

**Supported Languages (Initial):**
| Code | Language | Status |
|------|----------|--------|
| en | English | ✅ Complete (manual) |
| pt | Portuguese | 🔄 Manual |
| es | Spanish | 🔄 CLI + Review |
| fr | French | 🔄 CLI + Review |
| de | German | 🔄 CLI + Review |

**Success Criteria:**
- Language selector visible in Settings
- Selection persists across sessions
- App uses saved language on startup
- Changing language updates UI immediately

---

### **Phase 5: LLM Language Integration** (1 session)

Modify LLM prompts to use user's language preference instead of auto-detection.

**Learning Objectives:**
- Understand current auto-detection in `api.real.js`
- Modify prompts to use explicit language parameter
- Pass language from frontend to API
- Handle language in explanations

**Current Flow (in `src/api/api.real.js:23-31`):**
```javascript
// AUTO-DETECTION (current)
LANGUAGE REQUIREMENT (CRITICAL):
- Detect the language of the topic "${topic}"
- Generate ALL questions in the SAME language as the topic
```

**New Flow:**
```javascript
// USER SETTING (target)
LANGUAGE REQUIREMENT (CRITICAL):
- Generate ALL content in ${languageName} (${languageCode})
- The questions, options, and explanations must be in ${languageName}
- Do NOT auto-detect from topic - use the specified language
```

**Deliverables:**
- [ ] Update `generateQuestions()` in `src/api/api.real.js`
- [ ] Update `generateExplanation()` in `src/api/api.real.js`
- [ ] Add `language` parameter to function signatures
- [ ] Get language from user settings in LoadingView
- [ ] Test with multiple languages

**Implementation:**

```javascript
// src/api/api.real.js
export async function generateQuestions(topic, gradeLevel = 'middle school', language = 'en') {
  const languageNames = {
    en: 'English',
    pt: 'Portuguese (Brazilian)',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese (Simplified)'
  };

  const languageName = languageNames[language] || 'English';

  const prompt = `You are an expert educational content creator. Generate exactly 5
multiple-choice questions about "${topic}" appropriate for ${gradeLevel} students.

LANGUAGE REQUIREMENT (CRITICAL):
- Generate ALL content in ${languageName} (${language})
- The questions, ALL answer options, and any text must be in ${languageName}
- Do NOT auto-detect language from the topic
- Even if the topic is in a different language, respond in ${languageName}

Requirements:
...`;
```

```javascript
// src/views/LoadingView.js
import { getSetting } from '../core/db.js';

// Get user's language preference
const language = await getSetting('language') || 'en';

// Pass to API
const result = await generateQuestions(topic, gradeLevel, language);
```

**Mock API Note:**
The mock API (`src/api/api.mock.js`) will continue to return English questions only. This is intentional for development simplicity. Real API calls will use the language parameter.

**Success Criteria:**
- Quiz questions generated in user's language
- Explanations generated in user's language
- Language parameter passed through entire flow
- Works offline with cached content (in original language)
- Mock API unaffected (English only)

---

### **Phase 6: Locale-Aware Formatting** (1 session)

Use Intl API for dates, numbers, and relative time.

**Learning Objectives:**
- Understand Intl.DateTimeFormat
- Understand Intl.RelativeTimeFormat
- Understand Intl.NumberFormat
- Create reusable formatting utilities

**Deliverables:**
- [ ] `src/utils/formatters.js` - Locale-aware formatters
- [ ] Update `HomeView.js` date formatting
- [ ] Update `ResultsView.js` score formatting
- [ ] Test with different locales

**Implementation:**

```javascript
// src/utils/formatters.js
import i18n from '../core/i18n.js';

export function formatDate(date) {
  const locale = i18n.language;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatRelativeTime(date) {
  const locale = i18n.language;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return rtf.format(diffHours, 'hour');
  }
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, 'day');
  }
  if (Math.abs(diffDays) < 30) {
    return rtf.format(Math.round(diffDays / 7), 'week');
  }
  return formatDate(date);
}

export function formatNumber(number) {
  const locale = i18n.language;
  return new Intl.NumberFormat(locale).format(number);
}

export function formatPercent(value) {
  const locale = i18n.language;
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0
  }).format(value);
}
```

**Usage:**
```javascript
import { formatRelativeTime, formatPercent } from '../utils/formatters.js';

// In HomeView
const dateStr = formatRelativeTime(session.timestamp);
// English: "2 days ago"
// Portuguese: "há 2 dias"
// Spanish: "hace 2 días"

// In ResultsView
const scoreStr = formatPercent(score / total);
// English: "85%"
// German: "85 %"
```

**Success Criteria:**
- Dates display in locale format
- Relative time ("2 days ago") adapts to language
- Numbers formatted per locale
- No hardcoded date/number formatting remains

---

### **Phase 7: CLI Translation Utility** (1-2 sessions)

Build CLI tool to translate locale files using LLM.

**Learning Objectives:**
- Create Node.js CLI scripts
- Use LLM for translation
- Handle JSON file I/O
- Implement caching to avoid re-translating

**Deliverables:**
- [ ] `scripts/translate.js` - CLI translation tool
- [ ] `npm run translate:es` script in package.json
- [ ] Translation cache to avoid duplicates
- [ ] Documentation for adding languages

**Implementation:**

```javascript
// scripts/translate.js
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const languageNames = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese (Brazilian)',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)'
};

async function translateFile(targetLang) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY environment variable not set');
    process.exit(1);
  }

  const langName = languageNames[targetLang];
  if (!langName) {
    console.error(`Error: Unknown language code "${targetLang}"`);
    console.error('Supported:', Object.keys(languageNames).join(', '));
    process.exit(1);
  }

  // Read English source
  const enPath = path.join(process.cwd(), 'public/locales/en.json');
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  // Check for existing translation (for incremental updates)
  const targetPath = path.join(process.cwd(), `public/locales/${targetLang}.json`);
  let existingTranslation = {};
  if (fs.existsSync(targetPath)) {
    existingTranslation = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    console.log(`Found existing ${targetLang}.json, will update missing keys only`);
  }

  // Find keys that need translation
  const keysToTranslate = findMissingKeys(enContent, existingTranslation);

  if (keysToTranslate.length === 0) {
    console.log(`All keys already translated for ${targetLang}`);
    return;
  }

  console.log(`Translating ${keysToTranslate.length} keys to ${langName}...`);

  // Build translation prompt
  const prompt = `Translate the following JSON keys from English to ${langName}.
Keep the JSON structure exactly the same, only translate the string values.
Preserve any interpolation variables like {{count}} or {{current}}.

JSON to translate:
${JSON.stringify(extractKeys(enContent, keysToTranslate), null, 2)}

Return ONLY the translated JSON object, no explanation.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    console.error('API Error:', response.status);
    process.exit(1);
  }

  const data = await response.json();
  let translatedText = data.choices[0].message.content;

  // Clean markdown code blocks if present
  if (translatedText.startsWith('```')) {
    translatedText = translatedText.replace(/```json?\n?/g, '').replace(/```$/g, '');
  }

  const translated = JSON.parse(translatedText.trim());

  // Merge with existing
  const merged = deepMerge(existingTranslation, translated);

  // Write output
  fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2));
  console.log(`✅ Saved to public/locales/${targetLang}.json`);
  console.log(`   Review the translation before committing!`);
}

// Helper functions
function findMissingKeys(source, target, prefix = '') {
  const missing = [];
  for (const [key, value] of Object.entries(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      missing.push(...findMissingKeys(value, target?.[key] || {}, fullKey));
    } else if (!target?.[key]) {
      missing.push(fullKey);
    }
  }
  return missing;
}

function extractKeys(source, keys) {
  // Extract only the keys that need translation
  const result = {};
  for (const key of keys) {
    const parts = key.split('.');
    let src = source;
    let dst = result;
    for (let i = 0; i < parts.length - 1; i++) {
      src = src[parts[i]];
      dst[parts[i]] = dst[parts[i]] || {};
      dst = dst[parts[i]];
    }
    dst[parts[parts.length - 1]] = src[parts[parts.length - 1]];
  }
  return result;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Run
const targetLang = process.argv[2];
if (!targetLang) {
  console.error('Usage: npm run translate <language-code>');
  console.error('Example: npm run translate es');
  process.exit(1);
}

translateFile(targetLang);
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "translate": "node scripts/translate.js",
    "translate:es": "node scripts/translate.js es",
    "translate:fr": "node scripts/translate.js fr",
    "translate:de": "node scripts/translate.js de",
    "translate:pt": "node scripts/translate.js pt"
  }
}
```

**Usage:**
```bash
# Set API key
export OPENROUTER_API_KEY=sk-or-v1-...

# Translate to Spanish
npm run translate:es

# Translate to French
npm run translate fr

# Output
# Translating 65 keys to Spanish...
# ✅ Saved to public/locales/es.json
#    Review the translation before committing!
```

**Adding a New Language:**
```markdown
## How to Add a New Language

1. Run the translation CLI:
   ```bash
   export OPENROUTER_API_KEY=your-key
   npm run translate <lang-code>
   ```

2. Review the generated `public/locales/<lang>.json`
   - Check for translation errors
   - Verify interpolation variables preserved
   - Test pluralization

3. Add language to selector in `SettingsView.js`:
   ```html
   <option value="<lang-code>">Language Name</option>
   ```

4. Test the app with new language selected

5. Commit the translation file
```

**Success Criteria:**
- CLI tool generates translations
- Incremental updates (only translates new keys)
- Output requires human review before committing
- At least 2 languages generated via CLI
- Clear documentation for adding more

---

### **Phase 8: RTL Support** (Future Phase) ⏸️

*Deferred - document for future implementation*

**What RTL Support Requires:**
- CSS `direction: rtl` property
- Flexbox/Grid direction adjustments
- Icon mirroring (arrows, etc.)
- Text alignment changes
- Testing with native speakers

**Languages Requiring RTL:**
- Arabic (ar)
- Hebrew (he)
- Persian/Farsi (fa)
- Urdu (ur)

**When to Implement:**
- When targeting Middle Eastern markets
- When RTL users request support
- Before major public launch in those regions

**Preparation (Do Now):**
- Use logical CSS properties (`margin-inline-start` vs `margin-left`)
- Avoid hardcoded left/right positioning
- Test with `dir="rtl"` attribute occasionally

---

## File Structure After Implementation

```
src/
├── core/
│   ├── i18n.js              # i18next configuration
│   └── ...
├── utils/
│   ├── formatters.js        # Intl-based formatters
│   ├── errorHandler.js      # Updated with t() calls
│   └── ...
├── api/
│   ├── api.real.js          # Updated with language param
│   ├── api.mock.js          # Unchanged (English only)
│   └── openrouter-client.js # Updated with t() for errors
├── views/
│   └── ... (all updated with t() calls + data-testid)
└── ...

public/
└── locales/
    ├── en.json              # English (complete, manual) ~75 keys
    ├── pt.json              # Portuguese (complete, manual)
    ├── es.json              # Spanish (CLI + review)
    ├── fr.json              # French (CLI + review)
    └── de.json              # German (CLI + review)

scripts/
└── translate.js             # CLI translation utility

tests/
├── helpers/
│   └── i18n-test-helper.js  # Translation helper for unit tests
├── e2e/
│   └── app.spec.js          # Updated with data-testid selectors
└── ... (unit tests updated for translated strings)
```

---

## Success Criteria (Complete i18n)

### Technical Milestones
- [ ] i18next configured and working
- [ ] All ~75 strings extracted and translated (including errors)
- [ ] E2E tests migrated to data-testid (~38 assertions updated)
- [ ] Unit tests updated for translated error messages (~13 assertions)
- [ ] Dynamic content patterns working (`{{topic}} Quiz`)
- [ ] Browser dialogs handled correctly in tests
- [ ] Language selector in Settings
- [ ] Preference persists in IndexedDB
- [ ] LLM generates content in user's language (not auto-detect)
- [ ] Dates/numbers use Intl API
- [ ] At least 5 languages supported
- [ ] CLI translation utility working
- [ ] No hardcoded user-facing text
- [ ] Test helper for translation verification

### User-Facing Milestones
- [ ] Can switch language in Settings
- [ ] UI updates immediately on change
- [ ] Quiz questions in selected language
- [ ] Explanations in selected language
- [ ] Error messages in selected language
- [ ] Dates formatted per locale
- [ ] Works offline in selected language

---

## Estimated Timeline

| Phase | Sessions | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| Phase 1 | 1 | i18n Infrastructure Setup | i18next config, starter locale files |
| Phase 2 | 1-2 | Test Migration to data-testid | ~38 E2E assertions, ~21 data-testid attrs |
| Phase 3 | 2-3 | String Extraction & Migration | ~75 keys, error msgs, unit test updates |
| Phase 4 | 1 | Language Settings UI | Language selector, persistence |
| Phase 5 | 1 | LLM Language Integration | Modify prompts, pass language param |
| Phase 6 | 1 | Locale-Aware Formatting | Intl API formatters |
| Phase 7 | 1-2 | CLI Translation Utility | `npm run translate:es` |
| **Total** | **8-11** | **Full i18n Implementation** | 5+ languages supported |

Phase 8 (RTL) deferred to future.

---

## Risks & Mitigation

### Risk 1: Translation Quality (CLI)
**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**
- CLI output marked as "needs review"
- Human review required before commit
- Prioritize manual review for key languages
- Allow corrections via direct JSON editing

### Risk 2: LLM Language Consistency
**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Explicit language instruction in prompts (not auto-detect)
- Test with various topics and languages
- User can change language setting if issues
- Fallback to English for errors

### Risk 3: Test Migration Complexity
**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Migrate tests before string extraction
- Keep test functionality identical
- Run tests after each view migration
- Document data-testid conventions

### Risk 4: Bundle Size Increase
**Impact:** Low
**Likelihood:** Low
**Mitigation:**
- i18next is ~40KB (acceptable)
- Lazy load non-default languages
- Cache translations in IndexedDB
- Only load languages user selects

### Risk 5: Missing Translations in Production
**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**
- Fallback to English for missing keys
- Log missing translations for tracking
- CLI detects missing keys automatically
- Default to English in edge cases

---

## Decision Matrix

**Do this phase if:**
- ✅ You want Saberloop accessible globally
- ✅ You have non-English speaking users
- ✅ You want to learn i18n best practices
- ✅ You're preparing for wider distribution

**Skip/defer if:**
- ⏸️ All current users are English speakers
- ⏸️ You want to ship faster (English only)
- ⏸️ Other features are higher priority

---

## References

**Libraries:**
- [i18next Documentation](https://www.i18next.com/)
- [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)

**Browser APIs:**
- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Intl.RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat)
- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)

**Testing:**
- [Playwright data-testid](https://playwright.dev/docs/locators#locate-by-test-id)
- [Testing Library - data-testid](https://testing-library.com/docs/queries/bytestid/)

**Best Practices:**
- [W3C Internationalization](https://www.w3.org/International/)
- [Google i18n Guide](https://developers.google.com/international)

---

**Last Updated:** 2025-12-12 (v2 - added test analysis, error translation, unit test updates)
**Location:** `docs/learning/parking_lot/I18N_INTERNATIONALIZATION.md`
**Related:** [Epic 3 Plan](../epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md)
