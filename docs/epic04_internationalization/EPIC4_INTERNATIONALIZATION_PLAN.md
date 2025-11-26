# Epic 4: Internationalization (i18n) - Multi-Language Support

## Overview

Epic 4 adds internationalization to QuizMaster, enabling users to experience the app in their preferred language. Building on the production-ready foundation from Epic 03, this epic focuses on:

- **Translation Infrastructure** - Set up i18n library and translation system
- **String Extraction** - Extract all user-facing strings into translation files
- **Language Detection** - Automatically detect user's preferred language
- **Language Switching** - Allow users to manually select their language
- **Backend Localization** - Translate error messages from serverless functions
- **AI Content Localization** - Generate quiz content in user's language

**Project Transition**: From "English-only product" to "globally accessible app"

**Target Languages**: Start with English (default) + one additional language (e.g., Portuguese, Spanish)

---

## What You'll Learn

### New Technologies & Concepts

1. **i18n Libraries** - i18next configuration, namespaces, interpolation
2. **Translation Files** - JSON structure, key naming conventions, pluralization
3. **Locale Detection** - Browser language preferences, fallback chains
4. **RTL Support** - Right-to-left language considerations (foundation)
5. **Dynamic Content** - Passing locale context to AI for translated quizzes
6. **PWA Localization** - Manifest, offline page, app metadata translation

---

## Prerequisites

Before starting Epic 4, you should have completed:

- ✅ **Epic 01**: PWA Infrastructure (all phases)
- ✅ **Epic 02**: QuizMaster V1 (all phases)
- ✅ **Epic 03**: QuizMaster V2 (Phase 1 minimum, ideally all phases)
  - Phase 1: Backend Integration ✅ (required)
  - Phase 2: Offline Capabilities (recommended)
  - Phase 3: UI Polish (recommended)
  - Phase 4+: Nice to have

---

## Content Audit Summary

Based on codebase analysis, here's what needs to be internationalized:

| Content Type | Count | Files | Priority |
|--------------|-------|-------|----------|
| UI Labels & Buttons | ~25 | HomeView, TopicInputView, QuizView, ResultsView | High |
| Form Fields & Placeholders | ~8 | TopicInputView | High |
| Error Messages | ~20 | api.real.js, api.mock.js, Netlify functions | High |
| Status/Feedback Labels | ~5 | offline.html, network.js, main.js | Medium |
| App Metadata | 3 | manifest.json, index.html | High |
| Confirmation Dialogs | 2 | QuizView, main.js | Medium |
| Score/Performance Labels | 4 | ResultsView | Medium |
| **TOTAL** | **~77** | **11+ files** | - |

---

## Epic 4 Architecture

### i18n System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    QuizMaster i18n System                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Translation Files                   i18n Runtime           │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │ locales/         │              │ i18next          │    │
│  │ ├─ en/           │──────────────│ - Language       │    │
│  │ │  ├─ common.json│              │   detection      │    │
│  │ │  ├─ quiz.json  │              │ - Fallback chain │    │
│  │ │  └─ errors.json│              │ - Interpolation  │    │
│  │ ├─ pt/           │              │ - Pluralization  │    │
│  │ │  ├─ common.json│              └──────────────────┘    │
│  │ │  ├─ quiz.json  │                      │               │
│  │ │  └─ errors.json│                      ▼               │
│  │ └─ es/           │              ┌──────────────────┐    │
│  │    └─ ...        │              │ Views            │    │
│  └──────────────────┘              │ - t('key')       │    │
│                                    │ - Dynamic render │    │
│                                    └──────────────────┘    │
│                                                             │
│  User Preferences                  Backend                  │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │ IndexedDB        │              │ Netlify Functions│    │
│  │ - locale: 'en'   │              │ - Accept-Language│    │
│  │ - Auto-detect    │              │ - Locale param   │    │
│  └──────────────────┘              └──────────────────┘    │
│                                                             │
│  Language Selector (Settings)                               │
│  ┌──────────────────┐                                      │
│  │ 🌐 Language      │                                      │
│  │ ○ English        │                                      │
│  │ ○ Português      │                                      │
│  │ ○ Español        │                                      │
│  │ ○ Auto-detect    │                                      │
│  └──────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Additions from Epic 3

| Aspect | Epic 03 | Epic 04 |
|--------|---------|---------|
| **UI Strings** | Hardcoded in templates | Extracted to JSON files |
| **Error Messages** | English only | Translated per locale |
| **Language** | Single language | Multi-language support |
| **Settings** | API key, grade level | + Language preference |
| **Manifest** | Single language | Per-locale metadata |
| **Quiz Content** | English AI responses | Locale-aware AI prompts |

---

## Phase Structure

### **Phase 1: i18n Foundation** (2-3 sessions)
Set up internationalization infrastructure and core translation system.

📄 [PHASE1_I18N_FOUNDATION.md](./PHASE1_I18N_FOUNDATION.md)

**Learning Objectives:**
- Understand i18n fundamentals (keys, namespaces, interpolation)
- Configure i18next for vanilla JavaScript
- Create translation file structure
- Implement language detection
- Set up development workflow for translations

**Tasks:**

#### 1.1 Install i18next
**Why i18next?**
- Framework-agnostic (works with vanilla JS)
- Lightweight (~6KB gzipped)
- Well-documented and widely used
- Built-in language detection
- Supports namespaces (organize by feature)
- Interpolation and pluralization

```bash
npm install i18next i18next-browser-languagedetector
```

#### 1.2 Create Translation File Structure

**Proposed structure:**
```
src/
└─ locales/
   ├─ en/
   │  ├─ common.json      # Shared UI (nav, buttons, status)
   │  ├─ home.json        # HomeView strings
   │  ├─ quiz.json        # QuizView, TopicInputView, ResultsView
   │  └─ errors.json      # Error messages
   ├─ pt/
   │  ├─ common.json
   │  ├─ home.json
   │  ├─ quiz.json
   │  └─ errors.json
   └─ index.js            # Export all locales
```

**Namespace Strategy:**
- `common` - Navigation, buttons, status indicators, generic labels
- `home` - Home page specific content
- `quiz` - Quiz flow (topic input, questions, results)
- `errors` - API and validation error messages

#### 1.3 Configure i18next

**File:** `src/i18n/i18n.js`

**Features to configure:**
- Default language: 'en'
- Fallback language: 'en'
- Language detection order: localStorage → navigator → htmlTag
- Namespace loading
- Interpolation settings
- Debug mode for development

#### 1.4 Create Initial English Translations

Extract all strings from views into translation files:

**Example `src/locales/en/common.json`:**
```json
{
  "nav": {
    "home": "Home",
    "topics": "Topics",
    "profile": "Profile",
    "settings": "Settings"
  },
  "status": {
    "online": "Online",
    "offline": "Offline"
  },
  "buttons": {
    "tryAgain": "Try Again",
    "cancel": "Cancel"
  }
}
```

**Example `src/locales/en/quiz.json`:**
```json
{
  "topicInput": {
    "title": "New Quiz",
    "question": "What do you want to practice?",
    "placeholder": "World War II, Photosynthesis, Algebra...",
    "gradeLabel": "Grade Level (Optional)",
    "gradeOptions": {
      "select": "Select grade level",
      "middleSchool": "Middle School",
      "highSchool": "High School",
      "college": "College"
    },
    "generateButton": "Generate Questions",
    "validation": {
      "topicRequired": "Please enter a topic to practice!"
    }
  },
  "quiz": {
    "questionProgress": "Question {{current}} of {{total}}",
    "nextButton": "Next Question",
    "submitButton": "Submit Answer",
    "confirmLeave": "Are you sure you want to leave? Your progress will be lost."
  },
  "results": {
    "title": "Results",
    "perfectScore": "Perfect Score!",
    "greatJob": "Great Job!",
    "goodWork": "Good Work!",
    "keepPracticing": "Keep Practicing!",
    "reviewTitle": "Review Your Answers",
    "yourAnswer": "Your answer: {{answer}}",
    "correctAnswer": "Correct answer: {{answer}}",
    "summary": "You answered {{correct}} out of {{total}} questions correctly.",
    "tryAnotherButton": "Try Another Topic"
  }
}
```

**Deliverables:**
- ✅ i18next installed and configured
- ✅ Translation file structure created
- ✅ English translations extracted (~77 strings)
- ✅ Language detection working
- ✅ Helper function for translations `t()`

**Success Criteria:**
- All English strings in JSON files
- App renders using translation keys
- Language detection picks browser locale
- No hardcoded strings remain in views

---

### **Phase 2: View Integration** (2-3 sessions)
Update all views to use translation functions instead of hardcoded strings.

📄 [PHASE2_VIEW_INTEGRATION.md](./PHASE2_VIEW_INTEGRATION.md)

**Learning Objectives:**
- Integrate i18next with view rendering
- Handle interpolation (dynamic values)
- Update template strings to use t() function
- Test translations in development

**Tasks:**

#### 2.1 Create Translation Helper

**File:** `src/utils/translate.js`

```javascript
// Simple wrapper for i18next
import i18next from 'i18next';

export function t(key, options = {}) {
  return i18next.t(key, options);
}

export function changeLanguage(locale) {
  return i18next.changeLanguage(locale);
}

export function getCurrentLanguage() {
  return i18next.language;
}
```

#### 2.2 Update Views (One by One)

**Order of updates:**
1. `HomeView.js` - Start simple, test workflow
2. `TopicInputView.js` - Forms with placeholders
3. `QuizView.js` - Dynamic content with interpolation
4. `ResultsView.js` - Conditional messages
5. Navigation in all views

**Example transformation (HomeView.js):**

**Before:**
```javascript
render() {
  return `
    <h1>Welcome back!</h1>
    <button>Start New Quiz</button>
  `;
}
```

**After:**
```javascript
import { t } from '../utils/translate.js';

render() {
  return `
    <h1>${t('home.greeting')}</h1>
    <button>${t('home.startQuiz')}</button>
  `;
}
```

**With interpolation (QuizView.js):**

**Before:**
```javascript
`Question ${currentNumber} of ${total}`
```

**After:**
```javascript
t('quiz.questionProgress', { current: currentNumber, total: total })
// Translation: "Question {{current}} of {{total}}"
```

#### 2.3 Update Error Handling

**File:** `src/api/api.real.js`

```javascript
import { t } from '../utils/translate.js';

// Before
throw new Error('Failed to generate questions. Please try again.');

// After
throw new Error(t('errors.api.generateFailed'));
```

#### 2.4 Update Offline Page

**File:** `public/offline.html`

This is a special case - static HTML can't use JavaScript translations.

**Options:**
1. Keep simple English (acceptable for MVP)
2. Generate multiple offline pages per locale
3. Use inline script to detect and render

**Deliverables:**
- ✅ All 5 views updated to use t()
- ✅ Navigation translated in all views
- ✅ Error messages use translation keys
- ✅ Interpolation working for dynamic content
- ✅ No hardcoded strings in view templates

**Success Criteria:**
- App fully renders in English via translation system
- Changing language code updates all UI
- Dynamic values (scores, counts) display correctly
- Error messages translate properly

---

### **Phase 3: Add Second Language** (2-3 sessions)
Create translations for a second language and implement language switching.

📄 [PHASE3_SECOND_LANGUAGE.md](./PHASE3_SECOND_LANGUAGE.md)

**Learning Objectives:**
- Create complete translation set for new language
- Implement language switcher UI
- Persist language preference
- Handle missing translations gracefully

**Tasks:**

#### 3.1 Choose Second Language

**Recommended:** Start with a language you or someone you know speaks fluently.

**Common choices:**
- Portuguese (pt) - Good for Brazilian users
- Spanish (es) - Wide global reach
- French (fr) - European market
- German (de) - Technical audience

#### 3.2 Create Translation Files

**Copy and translate:**
```
src/locales/en/  →  src/locales/pt/
```

**Example `src/locales/pt/quiz.json`:**
```json
{
  "topicInput": {
    "title": "Novo Quiz",
    "question": "O que você quer praticar?",
    "placeholder": "Segunda Guerra Mundial, Fotossíntese, Álgebra...",
    "gradeLabel": "Nível Escolar (Opcional)",
    "gradeOptions": {
      "select": "Selecione o nível",
      "middleSchool": "Ensino Fundamental",
      "highSchool": "Ensino Médio",
      "college": "Ensino Superior"
    },
    "generateButton": "Gerar Perguntas",
    "validation": {
      "topicRequired": "Por favor, insira um tópico para praticar!"
    }
  },
  "quiz": {
    "questionProgress": "Pergunta {{current}} de {{total}}",
    "nextButton": "Próxima Pergunta",
    "submitButton": "Enviar Resposta",
    "confirmLeave": "Tem certeza que deseja sair? Seu progresso será perdido."
  },
  "results": {
    "title": "Resultados",
    "perfectScore": "Pontuação Perfeita!",
    "greatJob": "Muito Bem!",
    "goodWork": "Bom Trabalho!",
    "keepPracticing": "Continue Praticando!",
    "reviewTitle": "Revise Suas Respostas",
    "yourAnswer": "Sua resposta: {{answer}}",
    "correctAnswer": "Resposta correta: {{answer}}",
    "summary": "Você acertou {{correct}} de {{total}} perguntas.",
    "tryAnotherButton": "Tentar Outro Tópico"
  }
}
```

#### 3.3 Add Language Switcher to Settings

**Update:** `src/views/SettingsView.js`

```javascript
// Add to settings form
<div class="setting-group">
  <label>${t('settings.language')}</label>
  <select id="language-select">
    <option value="auto">${t('settings.languageAuto')}</option>
    <option value="en">English</option>
    <option value="pt">Português</option>
    <option value="es">Español</option>
  </select>
</div>
```

#### 3.4 Persist Language Preference

**Update:** `src/utils/settings.js`

```javascript
// Save language preference
export function setLanguage(locale) {
  localStorage.setItem('quizmaster_language', locale);
  changeLanguage(locale === 'auto' ? detectBrowserLanguage() : locale);
}

export function getLanguage() {
  return localStorage.getItem('quizmaster_language') || 'auto';
}
```

#### 3.5 Handle Missing Translations

**i18next fallback configuration:**
```javascript
i18next.init({
  fallbackLng: 'en',
  returnNull: false,
  returnEmptyString: false,
  missingKeyHandler: (lng, ns, key) => {
    console.warn(`Missing translation: ${lng}/${ns}/${key}`);
  }
});
```

**Deliverables:**
- ✅ Complete translation files for second language
- ✅ Language switcher in Settings
- ✅ Language preference persisted
- ✅ Fallback to English for missing keys
- ✅ Re-render on language change

**Success Criteria:**
- Can switch between languages in Settings
- Preference persists across sessions
- All UI updates when language changes
- Missing translations show English fallback
- Language detection respects browser preference

---

### **Phase 4: Backend Localization** (1-2 sessions)
Translate backend error messages and support locale in API calls.

📄 [PHASE4_BACKEND_LOCALIZATION.md](./PHASE4_BACKEND_LOCALIZATION.md)

**Learning Objectives:**
- Pass locale context to serverless functions
- Translate validation error messages
- Handle Accept-Language header
- Maintain translation consistency

**Tasks:**

#### 4.1 Pass Locale to API

**Update:** `src/api/api.real.js`

```javascript
import { getCurrentLanguage } from '../utils/translate.js';

async function generateQuestions(topic, gradeLevel) {
  const response = await fetch('/.netlify/functions/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': getCurrentLanguage()
    },
    body: JSON.stringify({ topic, gradeLevel })
  });
  // ...
}
```

#### 4.2 Backend Error Translations

**Option A: Frontend Translation (Recommended for now)**
- Backend returns error codes
- Frontend translates codes to messages

```javascript
// Backend returns
{ "error": "TOPIC_REQUIRED" }

// Frontend translates
t(`errors.${error.code}`)
```

**Option B: Backend Translation (More complex)**
- Maintain translation files in Netlify functions
- Parse Accept-Language header
- Return translated messages

#### 4.3 AI Content Localization

**Update Claude prompts to respect locale:**

```javascript
// netlify/functions/generate-questions.js

const locale = event.headers['accept-language']?.split(',')[0] || 'en';
const languageInstruction = locale !== 'en'
  ? `Generate the questions and answers in ${getLanguageName(locale)}.`
  : '';

const prompt = `
Generate ${numQuestions} multiple-choice questions about "${topic}".
${gradeLevel ? `Target grade level: ${gradeLevel}` : ''}
${languageInstruction}
...
`;
```

**Deliverables:**
- ✅ Locale passed to API calls
- ✅ Error codes translated on frontend
- ✅ AI prompts include language context
- ✅ Quiz content generated in user's language

**Success Criteria:**
- Error messages appear in user's language
- Quiz questions generated in selected language
- Explanations provided in user's language
- Consistent language throughout experience

---

### **Phase 5: PWA & Metadata Localization** (1-2 sessions)
Localize PWA manifest, offline page, and app metadata.

📄 [PHASE5_PWA_LOCALIZATION.md](./PHASE5_PWA_LOCALIZATION.md)

**Learning Objectives:**
- Understand PWA manifest localization limitations
- Implement offline page localization
- Update HTML metadata for SEO
- Handle app name in different languages

**Tasks:**

#### 5.1 Manifest Considerations

**Challenge:** PWA manifest.json is static, doesn't support i18n natively.

**Options:**
1. **Single manifest (Recommended for MVP)**
   - Keep English name/description
   - Simple, works everywhere

2. **Multiple manifests (Advanced)**
   - Generate locale-specific manifests
   - Use server-side detection

**For now:** Keep single manifest with English, add localized description in Settings.

#### 5.2 Offline Page Localization

**File:** `public/offline.html`

**Approach:** Inline JavaScript detection

```html
<script>
  const messages = {
    en: {
      title: "You're Offline",
      message: "Some features might be unavailable until you're back online.",
      button: "Try Again"
    },
    pt: {
      title: "Você está Offline",
      message: "Alguns recursos podem estar indisponíveis até você voltar online.",
      button: "Tentar Novamente"
    }
  };

  const lang = localStorage.getItem('quizmaster_language')
    || navigator.language.split('-')[0]
    || 'en';
  const m = messages[lang] || messages.en;

  document.getElementById('title').textContent = m.title;
  document.getElementById('message').textContent = m.message;
  document.getElementById('retry-button').textContent = m.button;
</script>
```

#### 5.3 HTML Metadata

**Update:** `index.html`

```html
<html lang="en"> <!-- Updated dynamically -->
<head>
  <title>QuizMaster</title>
  <meta name="description" content="AI-powered quiz application">
</head>
```

**Dynamic update on language change:**
```javascript
document.documentElement.lang = getCurrentLanguage();
```

**Deliverables:**
- ✅ Offline page supports multiple languages
- ✅ HTML lang attribute updates dynamically
- ✅ Manifest strategy documented
- ✅ SEO metadata considerations noted

**Success Criteria:**
- Offline page displays in user's language
- Browser correctly identifies page language
- PWA install experience consistent

---

### **Phase 6: Testing & Documentation** (1-2 sessions)
Comprehensive testing and documentation for i18n system.

📄 [PHASE6_TESTING.md](./PHASE6_TESTING.md)

**Learning Objectives:**
- Test translation coverage
- Validate interpolation
- Document translation workflow
- Set up for future languages

**Tasks:**

#### 6.1 Translation Validation

**Create test script:** `scripts/validate-translations.js`

```javascript
// Check all keys exist in all locales
// Report missing translations
// Validate interpolation variables match
```

#### 6.2 Manual Testing Checklist

**For each supported language:**
- [ ] Home page renders correctly
- [ ] Topic input labels and placeholders correct
- [ ] Grade level options translated
- [ ] Quiz progress text interpolates correctly
- [ ] Results page shows correct messages
- [ ] Settings language switcher works
- [ ] Error messages display correctly
- [ ] Offline page shows correct language
- [ ] Navigation tabs translated
- [ ] Confirmation dialogs translated

#### 6.3 E2E Test Updates

**Update:** `tests/e2e/` tests to verify translations

```javascript
// tests/e2e/i18n.spec.js
test('should switch language and update UI', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="settings-nav"]');
  await page.selectOption('#language-select', 'pt');

  // Verify UI updated
  await expect(page.locator('text=Início')).toBeVisible();
});
```

#### 6.4 Documentation

**Create:** `docs/guides/ADDING_TRANSLATIONS.md`

**Contents:**
- Translation file structure
- Key naming conventions
- Interpolation syntax
- Adding new languages
- Testing translations
- Common issues

**Deliverables:**
- ✅ Translation validation script
- ✅ Manual test checklist completed
- ✅ E2E tests for language switching
- ✅ Translation contributor guide
- ✅ All translations verified

**Success Criteria:**
- No missing translations in any language
- All interpolations work correctly
- E2E tests pass for all languages
- Documentation enables contributors to add languages

---

## Success Criteria (Epic 4 Complete)

### Technical Milestones
- ✅ i18next configured and working
- ✅ All UI strings extracted (~77 strings)
- ✅ 2+ languages fully supported
- ✅ Language detection working
- ✅ Language preference persisted
- ✅ Error messages translated
- ✅ AI content respects locale
- ✅ Offline page localized
- ✅ E2E tests for i18n
- ✅ Translation contributor guide

### User-Facing Milestones
- ✅ App available in user's preferred language
- ✅ Easy language switching in Settings
- ✅ Quiz content in selected language
- ✅ Seamless experience across all pages
- ✅ No broken translations or missing text

---

## Estimated Timeline

**Core Epic: ~10-14 sessions**

| Phase | Sessions | Focus |
|-------|----------|-------|
| Phase 1 | 2-3 | i18n Foundation (setup, English extraction) |
| Phase 2 | 2-3 | View Integration (update all views) |
| Phase 3 | 2-3 | Add Second Language (translations, switcher) |
| Phase 4 | 1-2 | Backend Localization (API, AI content) |
| Phase 5 | 1-2 | PWA Localization (offline page, metadata) |
| Phase 6 | 1-2 | Testing & Documentation |

---

## Teaching Methodology (Continued)

**Same approach as previous epics:**

**Claude's Role:**
- ✅ Explain i18n concepts before implementation
- ✅ Provide code as text for you to implement
- ✅ Wait for confirmation after each step
- ✅ Ask questions about translation decisions
- ✅ Guide through testing process

**Your Role:**
- ✅ Type all translation code
- ✅ Create translation files
- ✅ Run npm commands
- ✅ Test language switching
- ✅ Write actual translations (or use translation service)

---

## Future Considerations

### Adding More Languages
1. Copy `src/locales/en/` to new locale folder
2. Translate all JSON files
3. Add language option to Settings
4. Test thoroughly

### RTL Language Support
For Arabic, Hebrew, etc.:
- Add CSS for RTL layout
- Use `dir="rtl"` attribute
- Test all components

### Translation Management
For larger scale:
- Consider translation management platforms (Crowdin, Lokalise)
- Implement CI checks for translation coverage
- Add automated translation (Google Translate API) for draft translations

---

## Getting Started

When you're ready to begin Epic 4, say:
- **"Let's start Phase 1"** or
- **"What's next?"**

We'll start with Phase 1: i18n Foundation, setting up i18next and extracting strings!

---

## References

**External Resources:**
- [i18next Documentation](https://www.i18next.com/)
- [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)
- [JSON Translation Files Best Practices](https://www.i18next.com/misc/json-format)
- [PWA Internationalization](https://web.dev/i18n/)
- [W3C Internationalization](https://www.w3.org/International/)

---

**Note**: This epic focuses on making QuizMaster accessible to a global audience. Start with 2 languages, then expand based on user needs. Quality translations are more important than quantity - get one additional language perfect before adding more.

🌍 **Ready to go global with QuizMaster?**
