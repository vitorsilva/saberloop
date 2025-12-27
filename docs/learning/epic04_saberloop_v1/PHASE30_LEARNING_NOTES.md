# Phase 30: Internationalization (i18n) - Learning Notes

## Status: In Progress

**Started:** December 27, 2024
**Branch:** `main` (pre-phase merged), next phases will use feature branches

---

## Pre-Phase: Staging Environment Setup (Complete)

### What We Did

Before starting i18n implementation, we set up a staging environment to safely test large changes.

**PR #39** - Merged December 27, 2024

| Deliverable | Status |
|-------------|--------|
| Staging URL: https://saberloop.com/app-staging/ | ✅ Live |
| `npm run build:staging` | ✅ Added |
| `npm run deploy:staging` | ✅ Added |
| `npm run build:deploy:staging` | ✅ Added |
| Manifest validation | ✅ Implemented |
| Documentation | ✅ `docs/developer-guide/STAGING_DEPLOYMENT.md` |

### Key Learnings

#### 1. Environment Variables in Vite Config

Vite config can read environment variables to change build behavior:

```javascript
function getBasePath(command) {
    if (command === 'serve') return '/';
    if (process.env.DEPLOY_TARGET === 'staging') return '/app-staging/';
    return '/app/';
}
```

**Insight:** The `command` parameter tells us if we're in dev (`serve`) or build mode.

#### 2. Dynamic PWA Manifest

The PWA manifest paths (scope, start_url, icons) must match the deployment path:

```javascript
// Before (hardcoded)
id: '/app/',
scope: '/app/',
start_url: '/app/',
icons: [{ src: '/app/icons/icon-192x192.png', ... }]

// After (dynamic)
id: base,
scope: base,
start_url: base,
icons: [{ src: `${base}icons/icon-192x192.png`, ... }]
```

**Insight:** Template literals (`${base}`) make paths dynamic without string concatenation.

#### 3. Build/Deploy Validation

Preventing mismatches between build and deploy targets:

```javascript
function validateManifest() {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const manifestBase = manifest.scope;

    if (manifestBase !== expectedBase) {
        console.error('❌ Build/deploy mismatch detected!');
        process.exit(1);
    }
}
```

**Insight:** Fail fast with clear error messages. Tell the user exactly how to fix it.

#### 4. Cross-Platform Environment Variables

On Windows, `DEPLOY_TARGET=staging npm run build` doesn't work. Use `cross-env`:

```json
"build:staging": "cross-env DEPLOY_TARGET=staging npm run build"
```

**Insight:** `cross-env` abstracts OS differences for npm scripts.

### Questions Answered

**Q: Why use feature branches?**
A: To isolate changes so main stays stable. If something breaks, production is unaffected.

**Q: How do we pass config to builds without changing code?**
A: Environment variables. They're external to code and can vary per environment.

**Q: How do we prevent deploying wrong build to wrong environment?**
A: Validate before deploying. Check the manifest matches the target.

---

## Phase 30.1: i18n Infrastructure (Complete)

**Status:** ✅ Merged (PR #40)

### What We Did

| Deliverable | Status |
|-------------|--------|
| Install i18next and language detector | ✅ |
| Create `src/core/i18n.js` module | ✅ |
| Create `public/locales/en.json` (~25 keys) | ✅ |
| Create `public/locales/pt-PT.json` (~25 keys) | ✅ |
| Add unit tests (22 tests) | ✅ |
| All tests pass (202 total) | ✅ |

### Key Learnings

#### 1. Numeronyms

- **i18n** = internationalization (i + 18 letters + n)
- **l10n** = localization
- **a11y** = accessibility

#### 2. i18next Initialization

```javascript
await i18next
    .use(LanguageDetector)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: { escapeValue: false }
    });
```

**Key insight:** `escapeValue: false` because vanilla JS doesn't need XSS protection like React's JSX.

#### 3. Lazy Loading Translations

```javascript
async function loadTranslations(lang) {
    const response = await fetch(`${import.meta.env.BASE_URL}locales/${lang}.json`);
    return await response.json();
}
```

**Key insight:** Using `import.meta.env.BASE_URL` ensures paths work in both dev (`/`) and production (`/app/`).

#### 4. Language Code Normalization

```javascript
function normalizeLanguageCode(code) {
    // pt-BR -> pt-PT (our supported variant)
    // en-US -> en (base language)
}
```

**Key insight:** Users might have `pt-BR` in their browser, but we support `pt-PT`. Normalize to closest match.

#### 5. Testing Async Modules

```javascript
beforeEach(() => {
    vi.resetModules(); // Reset module state between tests
});

// Import fresh for each test
const { initI18n, t } = await import('./i18n.js');
```

**Key insight:** `vi.resetModules()` clears the module cache, giving each test a fresh instance.

---

## Phase 30.2: Test Migration to data-testid (In Progress)

**Status:** PR pending - data-testid attributes added, E2E migration deferred

### What We Did

| Deliverable | Status |
|-------------|--------|
| Add data-testid to HomeView | ✅ |
| Add data-testid to QuizView | ✅ |
| Add data-testid to ResultsView | ✅ |
| Add data-testid to SettingsView | ✅ |
| Add data-testid to TopicInputView | ✅ |
| Add data-testid to WelcomeView | ✅ |
| Add data-testid to LoadingView | ✅ |
| Add data-testid to TopicsView | ✅ |
| Add data-testid to HelpView | ✅ |
| Add data-testid to ConnectionConfirmedView | ✅ |
| Add data-testid to OpenRouterGuideView | ✅ |
| Add data-testid to ConnectModal | ✅ |
| Add data-testid to ExplanationModal | ✅ |
| Migrate E2E tests to use data-testid | ⏳ Deferred |
| All tests pass (202 total) | ✅ |

### Key Learnings

#### 1. data-testid Pattern

The `data-testid` attribute provides stable selectors for E2E tests that don't break when:
- Text content changes (translations)
- CSS classes change (styling refactors)
- Element structure changes (within reason)

```html
<!-- Before: fragile selector -->
<h2 class="text-xl font-bold">Welcome back!</h2>
<!-- Test: page.getByText('Welcome back!') - breaks on translation -->

<!-- After: stable selector -->
<h2 data-testid="welcome-heading" class="text-xl font-bold">Welcome back!</h2>
<!-- Test: page.getByTestId('welcome-heading') - works regardless of text -->
```

#### 2. Naming Convention

We used descriptive, kebab-case names that indicate the element's purpose:
- `welcome-heading` - Main heading on welcome page
- `quiz-title` - Title showing quiz topic
- `score-percentage` - The percentage score display
- `generate-quiz-btn` - Button to generate quiz

#### 3. Scope of Changes

Added data-testid to key UI elements across:
- **12 view files** - All major app views
- **2 component files** - Modal components
- **29 total elements** - Interactive and display elements

### data-testid Inventory

| View/Component | data-testid values |
|----------------|-------------------|
| HomeView | `welcome-heading`, `recent-topics-heading`, `no-quizzes-message`, `quiz-topic`, `quiz-date`, `quiz-score` |
| QuizView | `quiz-title`, `question-progress`, `question-text` |
| ResultsView | `score-percentage`, `result-message`, `score-summary` |
| SettingsView | `settings-title`, `grade-level-select`, `app-version` |
| TopicInputView | `new-quiz-title`, `topic-input`, `generate-quiz-btn` |
| WelcomeView | `welcome-title`, `connect-btn`, `skip-btn` |
| LoadingView | `loading-topic`, `loading-message` |
| TopicsView | `topics-title`, `quiz-count` |
| HelpView | `help-title` |
| ConnectionConfirmedView | `connection-confirmed-title`, `start-quiz-btn` |
| OpenRouterGuideView | `openrouter-guide-title` |
| ConnectModal | `connect-modal-title`, `modal-connect-btn`, `modal-cancel-btn` |
| ExplanationModal | `explanation-question`, `got-it-btn` |

### Next Steps

The actual E2E test migration (updating selectors in `tests/e2e/app.spec.js`) is deferred to a follow-up task. The infrastructure is now in place

---

## Phase 30.3: String Extraction (Pending)

*To be completed*

---

## Phase 30.4: Language Settings UI (Pending)

*To be completed*

---

## Phase 30.5: LLM Language Integration (Pending)

*To be completed*

---

## Phase 30.6: Locale-Aware Formatting (Pending)

*To be completed*

---

## Phase 30.7: CLI Translation Utility (Pending)

*To be completed*

---

## Summary

| Sub-Phase | Status | Key Learning |
|-----------|--------|--------------|
| Pre-Phase: Staging | ✅ Complete | Environment variables, validation, cross-platform scripts |
| 30.1: Infrastructure | ✅ Complete | i18next setup, lazy loading, language normalization |
| 30.2: Test Migration | 🔄 In Progress | data-testid pattern for i18n-safe testing |
| 30.3: String Extraction | ⏳ Pending | |
| 30.4: Language Settings | ⏳ Pending | |
| 30.5: LLM Integration | ⏳ Pending | |
| 30.6: Formatters | ⏳ Pending | |
| 30.7: CLI Tool | ⏳ Pending | |

---

## Next Session

Continue Phase 30.2 or start Phase 30.3:
- **Option A:** Migrate E2E tests in `app.spec.js` to use data-testid selectors
- **Option B:** Start Phase 30.3 - String extraction (replace hardcoded strings with `t()` calls)
