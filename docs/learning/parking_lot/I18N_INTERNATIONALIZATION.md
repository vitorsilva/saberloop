# Internationalization (i18n) - Learning Plan

## Overview

This plan transforms Saberloop from an English-only application to a fully internationalized app supporting multiple languages. The implementation covers:

- **UI Translation** - All static text (buttons, labels, messages) translated
- **AI Content Localization** - Quiz questions and explanations generated in the user's preferred language
- **Locale-Aware Formatting** - Dates, numbers, and relative times formatted per locale
- **Translation Workflow** - Hybrid approach with manual + API-assisted translations

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

---

## Prerequisites

Before starting this plan, you should have:

- ✅ **Epic 03 Phase 3** complete (Settings page exists)
- ✅ **IndexedDB** working (for caching translations)
- ✅ **OpenRouter/LLM integration** working (for AI content)
- ✅ Understanding of ES6 modules

---

## Current State Analysis

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
| **Dynamic** | AI-generated content | N/A |

**Total static strings**: ~65 strings to extract

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
│  │  (Core library)  │◄────►│  /locales/{lang}.json    │    │
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
│  │  LLM Prompts     │      │  Translation Cache        │    │
│  │  (AI Content)    │◄────►│  (IndexedDB)             │    │
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

### **Phase 2: String Extraction & Migration** (2-3 sessions)

Extract all hardcoded strings from views and replace with translation keys.

**Learning Objectives:**
- Identify all translatable strings
- Organize strings into logical namespaces
- Handle interpolation (dynamic values)
- Understand pluralization patterns

**Deliverables:**
- [ ] Complete `en.json` with all strings (~65 keys)
- [ ] Updated `HomeView.js` using `t()` function
- [ ] Updated `QuizView.js` using `t()` function
- [ ] Updated `ResultsView.js` using `t()` function
- [ ] Updated `SettingsView.js` using `t()` function
- [ ] Updated `TopicInputView.js` using `t()` function
- [ ] Updated `LoadingView.js` using `t()` function
- [ ] Updated all components using `t()` function

**Migration Pattern:**

```javascript
// BEFORE
<h2>Welcome back!</h2>
<p>Question ${index + 1} of ${total}</p>

// AFTER
import { t } from '../core/i18n.js';

<h2>${t('home.welcome')}</h2>
<p>${t('quiz.questionOf', { current: index + 1, total })}</p>
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

**Success Criteria:**
- All static strings extracted
- App displays correctly with English
- No hardcoded user-facing text remains
- Interpolation works for dynamic content

---

### **Phase 3: Language Settings UI** (1 session)

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
<div class="setting-group">
  <label>${t('settings.language')}</label>
  <select id="languageSelect">
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
| en | English | ✅ Complete |
| pt | Portuguese | 🔄 Manual |
| es | Spanish | 🔄 API + Review |
| fr | French | 🔄 API + Review |
| de | German | 🔄 API + Review |

**Success Criteria:**
- Language selector visible in Settings
- Selection persists across sessions
- App uses saved language on startup
- Changing language updates UI immediately

---

### **Phase 4: LLM Language Integration** (1-2 sessions)

Pass user's language preference to all LLM prompts.

**Learning Objectives:**
- Modify prompt templates to include language
- Update API client to pass language parameter
- Ensure AI generates content in correct language
- Handle language in explanations

**Current Flow:**
```
User types topic → LLM detects language → Generates in detected language
```

**New Flow:**
```
User types topic → App passes language setting → LLM generates in specified language
```

**Deliverables:**
- [ ] Update `generate-questions` function prompt
- [ ] Update `generate-explanation` function prompt
- [ ] Pass `language` parameter from frontend
- [ ] Test with multiple languages

**Implementation:**

```javascript
// netlify/functions/generate-questions.js (or PHP equivalent)
const prompt = `Generate ${count} multiple choice questions about "${topic}"
for a ${gradeLevel} student.

IMPORTANT: Generate all content in ${language} (${languageName}).
The questions, options, and any explanations must be in ${language}.

Return as JSON...`;
```

```javascript
// Frontend API call
const questions = await generateQuestions({
  topic: 'Photosynthesis',
  gradeLevel: 'middle school',
  count: 5,
  language: 'pt'  // User's preferred language
});
```

**Language Code Mapping:**
```javascript
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
```

**Success Criteria:**
- Quiz questions generated in user's language
- Explanations generated in user's language
- Language parameter passed through entire flow
- Works offline with cached content (in original language)

---

### **Phase 5: Locale-Aware Formatting** (1 session)

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

### **Phase 6: Translation Workflow** (1-2 sessions)

Implement hybrid translation approach: manual + API-assisted.

**Learning Objectives:**
- Organize translation files
- Set up translation caching in IndexedDB
- Implement API translation fallback
- Build translation management utilities

**Deliverables:**
- [ ] Complete manual translations for core languages (en, pt)
- [ ] Translation cache schema in IndexedDB
- [ ] API translation utility (for new languages)
- [ ] Translation status tracking
- [ ] Documentation for adding new languages

**Translation Cache Schema:**
```javascript
// IndexedDB store: translations
{
  id: 'es:home.welcome',  // language:key
  language: 'es',
  key: 'home.welcome',
  value: '¡Bienvenido de nuevo!',
  source: 'api',  // 'manual' | 'api' | 'reviewed'
  createdAt: Date,
  reviewedAt: null
}
```

**API Translation Utility:**
```javascript
// src/utils/translator.js
export async function translateMissing(language, keys) {
  // Check cache first
  const cached = await getCachedTranslations(language, keys);
  const missing = keys.filter(k => !cached[k]);

  if (missing.length === 0) return cached;

  // Call translation API (could use LLM)
  const translated = await callTranslationAPI(missing, language);

  // Cache results
  await cacheTranslations(language, translated);

  return { ...cached, ...translated };
}
```

**Adding a New Language:**
```markdown
## How to Add a New Language

1. Create `public/locales/{code}.json` (copy from en.json)
2. Add language to selector in SettingsView
3. Either:
   a. Translate manually (preferred for quality)
   b. Run translation utility for initial pass
   c. Review and correct API translations
4. Test thoroughly
5. Update language list in documentation
```

**Success Criteria:**
- English fully translated (manual)
- Portuguese fully translated (manual)
- At least 2 additional languages via API
- Translations cached for offline use
- Clear workflow for adding languages

---

### **Phase 7: RTL Support** (Future Phase) ⏸️

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
│   ├── translator.js        # API translation utility
│   └── ...
├── views/
│   └── ... (all updated with t() calls)
└── ...

public/
└── locales/
    ├── en.json              # English (complete, manual)
    ├── pt.json              # Portuguese (complete, manual)
    ├── es.json              # Spanish (API + review)
    ├── fr.json              # French (API + review)
    └── de.json              # German (API + review)

netlify/functions/
├── generate-questions.js    # Updated with language param
├── generate-explanation.js  # Updated with language param
└── ...
```

---

## Success Criteria (Complete i18n)

### Technical Milestones
- [ ] i18next configured and working
- [ ] All ~65 strings extracted and translated
- [ ] Language selector in Settings
- [ ] Preference persists in IndexedDB
- [ ] LLM generates content in user's language
- [ ] Dates/numbers use Intl API
- [ ] At least 5 languages supported
- [ ] Translations cached for offline
- [ ] No hardcoded user-facing text

### User-Facing Milestones
- [ ] Can switch language in Settings
- [ ] UI updates immediately on change
- [ ] Quiz questions in selected language
- [ ] Explanations in selected language
- [ ] Dates formatted per locale
- [ ] Works offline in selected language

---

## Estimated Timeline

| Phase | Sessions | Focus |
|-------|----------|-------|
| Phase 1 | 1 | i18n Infrastructure Setup |
| Phase 2 | 2-3 | String Extraction & Migration |
| Phase 3 | 1 | Language Settings UI |
| Phase 4 | 1-2 | LLM Language Integration |
| Phase 5 | 1 | Locale-Aware Formatting |
| Phase 6 | 1-2 | Translation Workflow |
| **Total** | **7-10** | **Full i18n Implementation** |

Phase 7 (RTL) deferred to future.

---

## Risks & Mitigation

### Risk 1: Translation Quality (API)
**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**
- Use high-quality translation API (DeepL > Google)
- Mark API translations as "needs review"
- Prioritize manual review for key languages
- Allow community corrections

### Risk 2: LLM Language Consistency
**Impact:** Medium
**Likelihood:** Low
**Mitigation:**
- Explicit language instruction in prompts
- Test with various topics and languages
- Fallback to English if detection fails
- User can report language issues

### Risk 3: Bundle Size Increase
**Impact:** Low
**Likelihood:** Low
**Mitigation:**
- i18next is ~40KB (acceptable)
- Lazy load non-default languages
- Cache translations in IndexedDB
- Only load languages user selects

### Risk 4: Missing Translations in Production
**Impact:** Medium
**Likelihood:** Medium
**Mitigation:**
- Fallback to English for missing keys
- Log missing translations for tracking
- Automated CI check for missing keys
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

**Best Practices:**
- [W3C Internationalization](https://www.w3.org/International/)
- [Google i18n Guide](https://developers.google.com/international)

---

**Last Updated:** 2025-12-12
**Location:** `docs/learning/parking_lot/I18N_INTERNATIONALIZATION.md`
**Related:** [Epic 3 Plan](../epic03_quizmaster_v2/EPIC3_QUIZMASTER_V2_PLAN.md)
