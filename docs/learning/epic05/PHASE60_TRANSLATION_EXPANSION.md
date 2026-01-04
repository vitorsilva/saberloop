# Phase 60: Translation Expansion

## Overview

Expand Saberloop's language support by adding Norwegian and Russian translations, and completing the missing translations for Spanish, French, and German that are listed in the code but don't have translation files.

**Goal:** Full translation coverage for 7 languages (en, pt-PT, es, fr, de, no, ru)

---

## Current State Analysis

### What Exists

| Language | Code | Translation File | i18n.js | translate.js | api.real.js | Status |
|----------|------|------------------|---------|--------------|-------------|--------|
| English | en | `en.json` ✅ | ✅ | N/A | ✅ | Complete |
| Portuguese | pt-PT | `pt-PT.json` ✅ | ✅ | N/A | ✅ | Complete |
| Spanish | es | ❌ Missing | ✅ | ✅ | ✅ | Broken - listed but no file |
| French | fr | ❌ Missing | ✅ | ✅ | ✅ | Broken - listed but no file |
| German | de | ❌ Missing | ✅ | ✅ | ✅ | Broken - listed but no file |
| Norwegian | no | ❌ Missing | ❌ | ❌ | ❌ | New language |
| Russian | ru | ❌ Missing | ❌ | ✅ | ❌ | New language (CLI ready) |

### Key Files

- `src/core/i18n.js` - i18n configuration with `SUPPORTED_LANGUAGES` array (lines 24-30)
- `src/api/api.real.js` - `LANGUAGE_NAMES` for LLM prompts (lines 8-14)
- `scripts/translate.js` - CLI translation utility with `LANGUAGE_NAMES` (lines 25-41)
- `public/locales/*.json` - Translation files
- `src/views/SettingsView.js` - Language selector UI (auto-renders from SUPPORTED_LANGUAGES)

### Translation Keys

The English translation file (`en.json`) has **240 lines** covering:
- common (12 keys)
- home (6 keys)
- dates (3 keys)
- topics (5 keys)
- topicInput (9 keys)
- settings (37 keys)
- loading (12 keys)
- quiz (5 keys)
- results (14 keys)
- offline (1 key)
- errors (6 keys)
- welcome (10 keys)
- help (12 keys)
- connection (7 keys)
- openrouter (14 keys)
- connectModal (3 keys)
- explanation (12 keys)
- share (12 keys)
- usage (4 keys)

---

## Branching & Commit Strategy

### Branch
```bash
git checkout -b feature/phase60-translation-expansion
```

### Commit Order (Atomic Commits)

Small, focused commits in logical order:

| # | Commit Message | Files Changed |
|---|----------------|---------------|
| 1 | `feat(i18n): add Norwegian to translate CLI` | `scripts/translate.js` |
| 2 | `feat(i18n): add Norwegian and Russian to supported languages` | `src/core/i18n.js` |
| 3 | `feat(api): add Norwegian and Russian to LLM language names` | `src/api/api.real.js` |
| 4 | `feat(i18n): add Spanish translations` | `public/locales/es.json` |
| 5 | `feat(i18n): add French translations` | `public/locales/fr.json` |
| 6 | `feat(i18n): add German translations` | `public/locales/de.json` |
| 7 | `feat(i18n): add Norwegian translations` | `public/locales/no.json` |
| 8 | `feat(i18n): add Russian translations` | `public/locales/ru.json` |

### Rationale

1. **Code changes first** (commits 1-3): Enables the CLI and app to support new languages before generating files
2. **Missing translations next** (commits 4-6): Fixes the broken state where languages are listed but files don't exist
3. **New languages last** (commits 7-8): Adds the new requested languages

### PR Strategy

Single PR with all commits, or can be split into:
- **PR 1**: Commits 1-6 (fix broken state + code updates)
- **PR 2**: Commits 7-8 (new languages)

---

## Implementation Plan

### Task 1: Create Missing Translation Files (es, fr, de)

**Problem:** Spanish, French, and German are listed in `SUPPORTED_LANGUAGES` but have no translation files. Users selecting these languages will see English fallback text.

**Solution:** Use the existing `scripts/translate.js` CLI to generate translations.

**Steps:**
1. Run translation CLI for each language:
   ```bash
   # Set API key (user's OpenRouter key)
   export OPENROUTER_API_KEY=sk-or-v1-...

   # Generate translations
   npm run translate es
   npm run translate fr
   npm run translate de
   ```
2. Review generated translations for accuracy
3. Commit the new translation files

**Files Created:**
- `public/locales/es.json`
- `public/locales/fr.json`
- `public/locales/de.json`

---

### Task 2: Add Norwegian Support

**Files to update:**

1. **`scripts/translate.js`** (line ~40) - Add Norwegian to `LANGUAGE_NAMES`:
   ```javascript
   'no': 'Norwegian (Bokmål)',
   ```

2. **`src/core/i18n.js`** (line ~30) - Add Norwegian to `SUPPORTED_LANGUAGES`:
   ```javascript
   { code: 'no', name: 'Norsk', flag: '🇳🇴' },
   ```

3. **`src/api/api.real.js`** (line ~14) - Add Norwegian to `LANGUAGE_NAMES`:
   ```javascript
   'no': 'Norwegian (Bokmål)',
   ```

4. **Generate translation file:**
   ```bash
   npm run translate -- no
   ```

5. Review and commit `public/locales/no.json`

---

### Task 3: Add Russian Support

**Files to update:**

1. **`src/core/i18n.js`** (line ~30) - Add Russian to `SUPPORTED_LANGUAGES`:
   ```javascript
   { code: 'ru', name: 'Русский', flag: '🇷🇺' },
   ```

2. **`src/api/api.real.js`** (line ~14) - Add Russian to `LANGUAGE_NAMES`:
   ```javascript
   'ru': 'Russian',
   ```

3. **Generate translation file** (Russian already in translate.js):
   ```bash
   npm run translate -- ru
   ```

4. Review and commit `public/locales/ru.json`

---

### Task 4: Verify Language Selector UI

The language selector in `SettingsView.js` should automatically display all languages from `SUPPORTED_LANGUAGES`. Verify:

1. All 7 languages appear in the dropdown
2. Selecting each language updates the UI
3. Language preference persists across sessions
4. Fallback to English works for missing keys

---

### Task 5: Test LLM Language Integration

Verify that quiz generation uses the selected language:

1. Select Norwegian → Generate quiz → Questions should be in Norwegian
2. Select Russian → Generate quiz → Questions should be in Russian
3. Explanations should also be in the selected language

**Note:** The `api.real.js` already has a `languageNames` map that may need updating for Norwegian and Russian.

Check `src/api/api.real.js` for:
```javascript
const languageNames = {
    // ... check if no and ru are included
};
```

If missing, add:
```javascript
no: 'Norwegian (Bokmål)',
ru: 'Russian'
```

---

## Validation Checklist

### Translation Files
- [ ] `public/locales/es.json` exists and has all keys
- [ ] `public/locales/fr.json` exists and has all keys
- [ ] `public/locales/de.json` exists and has all keys
- [ ] `public/locales/no.json` exists and has all keys
- [ ] `public/locales/ru.json` exists and has all keys

### Code Updates
- [ ] `scripts/translate.js` - LANGUAGE_NAMES includes `no` (ru already present)
- [ ] `src/core/i18n.js` - SUPPORTED_LANGUAGES includes `no` and `ru`
- [ ] `src/api/api.real.js` - LANGUAGE_NAMES includes `no` and `ru`

### UI Testing
- [ ] Language selector shows all 7 languages
- [ ] Selecting Spanish updates UI to Spanish
- [ ] Selecting French updates UI to French
- [ ] Selecting German updates UI to German
- [ ] Selecting Norwegian updates UI to Norwegian
- [ ] Selecting Russian updates UI to Russian
- [ ] Language preference persists after app restart

### Quiz Generation Testing
- [ ] Quiz generated in Norwegian when Norwegian selected
- [ ] Quiz generated in Russian when Russian selected
- [ ] Explanations generated in selected language

### Edge Cases
- [ ] Fallback to English for any missing keys
- [ ] No console errors when switching languages
- [ ] Offline mode works with cached translations

---

## Files Changed Summary

| File | Change |
|------|--------|
| `scripts/translate.js` | Add `no` to LANGUAGE_NAMES (ru already present) |
| `src/core/i18n.js` | Add `no` and `ru` to SUPPORTED_LANGUAGES |
| `src/api/api.real.js` | Add `no` and `ru` to LANGUAGE_NAMES |
| `public/locales/es.json` | NEW - Spanish translations (~240 lines) |
| `public/locales/fr.json` | NEW - French translations (~240 lines) |
| `public/locales/de.json` | NEW - German translations (~240 lines) |
| `public/locales/no.json` | NEW - Norwegian translations (~240 lines) |
| `public/locales/ru.json` | NEW - Russian translations (~240 lines) |

---

## Notes

### Translation Quality

The CLI tool uses LLM for translation. While generally good, translations should be reviewed by native speakers for:
- Cultural appropriateness
- Correct technical terminology
- Natural phrasing

### Cyrillic Script (Russian)

Russian uses Cyrillic script. Verify:
- Fonts render correctly
- Text doesn't overflow UI elements
- RTL is not needed (Russian is LTR)

### Norwegian Variants

Norwegian has two written standards: Bokmål and Nynorsk. This implementation uses Bokmål (the more common variant). The language code `no` is used (not `nb` for Bokmål specifically).

---

## Success Criteria

1. **7 languages fully supported**: en, pt-PT, es, fr, de, no, ru
2. **No broken language options**: All listed languages have translation files
3. **Consistent experience**: UI and quiz generation use the same language
4. **Graceful degradation**: Missing keys fall back to English

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Task 1: Create es, fr, de translations | 15 min (CLI) + 30 min (review) |
| Task 2: Add Norwegian | 10 min (code) + 15 min (CLI) + 20 min (review) |
| Task 3: Add Russian | 10 min (code) + 15 min (CLI) + 20 min (review) |
| Task 4: Verify UI | 10 min |
| Task 5: Test LLM integration | 15 min |
| **Total** | ~2-3 hours |

---

## Related Documentation

- Original i18n implementation: `docs/learning/epic04_saberloop_v1/PHASE30_I18N.md`
- Translation CLI: `scripts/translate.js`
- i18n module: `src/core/i18n.js`
