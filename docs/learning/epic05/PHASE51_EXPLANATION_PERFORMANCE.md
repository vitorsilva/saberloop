# Explanation Performance Improvement

**Status:** Ready to Implement
**Priority:** Medium (Performance & UX)
**Estimated Effort:** 2-3 sessions
**Created:** 2025-12-28
**Updated:** 2025-12-30

## Session Log

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-28 | **Plan Created** | Design complete with wireframes |
| 2025-12-30 | **Moved to Epic 5** | Promoted from parking lot to active epic |

---

## Overview

Improve explanation feature performance by splitting explanations into cacheable and personalized parts. This enables instant display of cached content while still providing personalized feedback.

**Key Improvement:** Show general explanation immediately (cached), generate user-specific feedback in parallel.

---

## What You'll Learn

### New Technologies & Concepts

1. **Structured LLM Responses** - Getting JSON from AI instead of plain text
2. **Caching Strategies** - When to cache, what to cache, cache invalidation
3. **Progressive UI Loading** - Showing partial content while loading rest
4. **Lazy Loading Pattern** - Generate/cache only when needed (not upfront)
5. **Schema Evolution** - Adding fields to existing data structures safely
6. **Prompt Engineering** - Crafting prompts that return structured data
7. **Offline Graceful Degradation** - Partial functionality without network

---

## Prerequisites

Before starting this phase, you should have:

- ✅ **Explanation feature** working (`ExplanationModal.js`)
- ✅ **IndexedDB** for storing quiz sessions
- ✅ **OpenRouter integration** for LLM calls
- ✅ **Results page** displaying questions and answers
- ✅ Understanding of async/await and Promise.all()
- ✅ Understanding of JSON parsing and error handling

---

## Problem Statement

Currently, when a user clicks the explanation button (info icon) on an incorrect answer:
1. A modal opens with a loading spinner
2. The LLM generates an explanation that includes:
   - Why the correct answer is correct
   - Why the user's selected answer was wrong
3. The full explanation is displayed

**Issues:**
- **Performance:** Generation takes noticeable time (2-5 seconds)
- **No caching:** Explanation cannot be cached because it depends on which wrong answer the user selected
- **Offline limitation:** Feature is completely unavailable offline
- **Repeated quizzes:** Even on quiz retakes, explanations are regenerated from scratch

---

## Solution Design

### Core Idea

Split the explanation into two parts with a structured JSON response:

```json
{
  "rightAnswerExplanation": "Paris has been the capital of France since the 10th century...",
  "wrongAnswerExplanation": "London is actually the capital of the United Kingdom, not France..."
}
```

**Benefits:**
- `rightAnswerExplanation` can be cached (same for all users, all attempts)
- `wrongAnswerExplanation` is personalized (depends on user's wrong selection)
- Cached explanation shows instantly; personalized loads in parallel
- Works offline/without LLM (partial functionality with cached content)

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage location | Question object in session | Sessions persist; retakes load same questions; simple |
| When to generate/cache | Lazy loading (on first request) | Only pays cost when needed |
| Correct answers | No explanation button | Keep current behavior; scope control |
| Migration (old sessions) | Self-healing (treat as first-time) | Simple; no migration script needed |
| UI consistency | Always show separator | Same visual structure regardless of load timing |

---

## UI Wireframes

### Current Implementation

**Loading State:**
```
┌─────────────────────────────────────────────┐
│                  ───────                    │
│            🔴 INCORRECT                     │
│      What is the capital of France?         │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ ❌ YOU       │  │ ✅ CORRECT ANSWER    │ │
│  │ SELECTED     │  │                      │ │
│  │   London     │  │      Paris           │ │
│  └──────────────┘  └──────────────────────┘ │
│  💡 Why it's Paris                          │
│  ┌─────────────────────────────────────────┐│
│  │     ⟳ Generating explanation...         ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│
│  │           Got it!  →                    ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Loaded State:**
```
┌─────────────────────────────────────────────┐
│  💡 Why it's Paris                          │
│  ┌─────────────────────────────────────────┐│
│  │ Paris is the capital of France, not    ││
│  │ London. London is actually the capital ││
│  │ of the United Kingdom.                 ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### Proposed Implementation

**Loading State (with cached explanation):**
```
┌─────────────────────────────────────────────┐
│  💡 Explanation                             │
│  ┌─────────────────────────────────────────┐│
│  │ Paris has been the capital of France   ││  ← Instant (cached)
│  │ since the 10th century...              ││
│  │ ─────────────────────────────────────  ││  ← Separator
│  │     ⟳ Loading personalized feedback... ││  ← Still loading
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Fully Loaded State:**
```
┌─────────────────────────────────────────────┐
│  💡 Explanation                             │
│  ┌─────────────────────────────────────────┐│
│  │ Paris has been the capital of France   ││  ← Right answer explanation
│  │ since the 10th century...              ││
│  │ ─────────────────────────────────────  ││  ← Separator
│  │ London is the capital of the UK, not   ││  ← Wrong answer explanation
│  │ France. Easy to mix up!                ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Offline State (cached only):**
```
┌─────────────────────────────────────────────┐
│  💡 Explanation                             │
│  ┌─────────────────────────────────────────┐│
│  │ Paris has been the capital of France   ││
│  │ since the 10th century...              ││
│  └─────────────────────────────────────────┘│  ← No message, clean
└─────────────────────────────────────────────┘
```

**Online, No LLM Connected (cached only):**
```
┌─────────────────────────────────────────────┐
│  💡 Explanation                             │
│  ┌─────────────────────────────────────────┐│
│  │ Paris has been the capital of France   ││
│  │ since the 10th century...              ││
│  │                                        ││
│  │ ☁️ Connect to AI for personalized      ││  ← Informational only
│  │    feedback on your answer             ││    (not clickable)
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Error State (LLM failed, cached available):**
```
┌─────────────────────────────────────────────┐
│  💡 Explanation                             │
│  ┌─────────────────────────────────────────┐│
│  │ Paris has been the capital of France   ││
│  │ since the 10th century...              ││
│  │ ─────────────────────────────────────  ││
│  │ ⚠️ Couldn't load personalized feedback ││
│  │    [Try again]                         ││  ← Retry button
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: API Layer Changes

1. **Update LLM prompt** (`src/api/api.real.js`)
   - Modify `generateExplanation()` to request structured JSON response
   - New prompt structure:
     ```
     Return a JSON object with two fields:
     - rightAnswerExplanation: Why the correct answer is correct (2-3 sentences)
     - wrongAnswerExplanation: Why the student's answer was incorrect (1-2 sentences)
     ```
   - Parse JSON response and return structured object

2. **Add new function** for generating only `wrongAnswerExplanation`
   - `generateWrongAnswerExplanation(question, userAnswer, correctAnswer, gradeLevel, apiKey, language)`
   - Used when `rightAnswerExplanation` is already cached

3. **Update quiz-service.js**
   - Export new function for wrong-answer-only generation
   - Handle both full generation and partial generation cases

### Phase 2: Data Layer Changes

4. **Update session storage** (`src/core/db.js`)
   - Add `updateQuestionExplanation(sessionId, questionIndex, rightAnswerExplanation)` function
   - Updates the question object within the session

5. **Update ResultsView** (`src/views/ResultsView.js`)
   - After receiving explanation, save `rightAnswerExplanation` to session
   - Check for existing cached explanation before calling LLM

### Phase 3: UI Layer Changes

6. **Update ExplanationModal** (`src/components/ExplanationModal.js`)
   - Accept optional `cachedExplanation` parameter
   - Show cached content immediately if available
   - Display separator between explanation parts
   - Handle all states: loading, loaded, offline, no-LLM, error

7. **Update modal invocation** (`src/views/ResultsView.js`)
   - Check for cached `rightAnswerExplanation` in question object
   - Pass to modal for instant display
   - Call appropriate API (full or partial) based on cache state

### Phase 4: Network State Handling

8. **Add network/LLM state detection**
   - Check if offline → show cached only, no message
   - Check if online but no API key → show cached + "Connect to AI" message
   - Check if online with API key → load personalized explanation

### Phase 5: i18n

9. **Add new translation keys** (all supported languages)
   - `explanation.loadingPersonalized` - "Loading personalized feedback..."
   - `explanation.connectToAI` - "Connect to AI for personalized feedback on your answer"
   - `explanation.couldntLoad` - "Couldn't load personalized feedback"

---

## Files to Change

| File | Change |
|------|--------|
| `src/api/api.real.js` | Update prompt for JSON response; add partial generation function |
| `src/services/quiz-service.js` | Export new generation functions |
| `src/core/db.js` | Add function to update question explanation in session |
| `src/components/ExplanationModal.js` | Handle cached content, states, separator UI |
| `src/views/ResultsView.js` | Check cache, save explanation, handle network states |
| `public/locales/en.json` | Add new i18n keys |
| `public/locales/pt-PT.json` | Add new i18n keys |
| `public/locales/es.json` | Add new i18n keys |
| `public/locales/fr.json` | Add new i18n keys |
| `public/locales/de.json` | Add new i18n keys |

---

## Testing Plan

### Unit Tests (Vitest)

| Test | Description |
|------|-------------|
| `api.real.test.js` | Test JSON parsing of new structured response |
| `api.real.test.js` | Test partial generation (wrongAnswerExplanation only) |
| `db.test.js` | Test `updateQuestionExplanation()` function |
| `ExplanationModal.test.js` | Test rendering with/without cached content |
| `ExplanationModal.test.js` | Test all UI states (loading, loaded, offline, error) |

### E2E Tests (Playwright)

| Test | Description |
|------|-------------|
| `explanation.spec.js` | First-time explanation shows loading → both parts appear |
| `explanation.spec.js` | Second request shows cached instantly + loading for personalized |
| `explanation.spec.js` | Offline mode shows cached content only (no error) |
| `explanation.spec.js` | Error state shows cached content + retry button |
| `explanation.spec.js` | Quiz retake uses cached explanation from session |

### Manual Testing Checklist

- [ ] First explanation request: shows loading, then both parts with separator
- [ ] Second request (same question): cached shows instantly, personalized loads
- [ ] Quiz retake: cached explanation available immediately
- [ ] Offline mode: only cached content, clean UI
- [ ] No API key: cached content + "Connect to AI" message
- [ ] LLM error: cached content + error message + retry button
- [ ] Retry button works and loads personalized content
- [ ] Old session (no cache): behaves like first-time request
- [ ] All languages display correctly (en, pt-PT, es, fr, de)

---

## Architecture Testing

Ensure `npm run archtest` passes after changes:
- API layer changes stay in `src/api/`
- Service layer changes stay in `src/services/`
- DB layer changes stay in `src/core/`
- View/component changes don't import from wrong layers

---

## i18n Requirements

### New Keys

```json
{
  "explanation": {
    "loadingPersonalized": "Loading personalized feedback...",
    "connectToAI": "Connect to AI for personalized feedback on your answer",
    "couldntLoad": "Couldn't load personalized feedback"
  }
}
```

### Translations Needed

| Key | en | pt-PT | es | fr | de |
|-----|----|----|----|----|-----|
| `loadingPersonalized` | Loading personalized feedback... | A carregar feedback personalizado... | Cargando comentarios personalizados... | Chargement des commentaires personnalisés... | Personalisiertes Feedback wird geladen... |
| `connectToAI` | Connect to AI for personalized feedback on your answer | Conecte-se à IA para feedback personalizado sobre a sua resposta | Conéctate a la IA para recibir comentarios personalizados | Connectez-vous à l'IA pour des commentaires personnalisés | Verbinden Sie sich mit der KI für personalisiertes Feedback |
| `couldntLoad` | Couldn't load personalized feedback | Não foi possível carregar o feedback personalizado | No se pudo cargar los comentarios personalizados | Impossible de charger les commentaires personnalisés | Personalisiertes Feedback konnte nicht geladen werden |

---

## JSDoc Requirements

All new/modified functions should have JSDoc comments:

```javascript
/**
 * Generates a structured explanation with separate right/wrong answer parts.
 * @param {string} question - The quiz question text
 * @param {string} userAnswer - The user's selected answer
 * @param {string} correctAnswer - The correct answer
 * @param {string} gradeLevel - The educational grade level
 * @param {string} apiKey - OpenRouter API key
 * @param {string} language - Language code (e.g., 'en', 'pt-PT')
 * @returns {Promise<{rightAnswerExplanation: string, wrongAnswerExplanation: string}>}
 */
```

---

## Migration Notes

**Old sessions without `rightAnswerExplanation`:**
- Treated as first-time requests
- Full explanation generated (both parts)
- `rightAnswerExplanation` cached for future
- No migration script needed (self-healing)

**Backward compatibility:**
- If `question.rightAnswerExplanation` is undefined, trigger full generation
- Existing functionality preserved for users with old sessions

---

## Performance Impact

| Scenario | Before | After |
|----------|--------|-------|
| First explanation | ~3s wait | ~3s wait (same) |
| Repeat explanation (same session) | ~3s wait | **Instant** (cached) + ~1s for personalized |
| Quiz retake explanation | ~3s wait | **Instant** (cached) + ~1s for personalized |
| Offline | Not available | **Available** (cached portion) |

---

## Why It's Optional

- ✅ Current explanation feature works (full generation each time)
- ⚠️ Moderate implementation effort (UI, API, storage changes)
- ⚠️ Changes LLM prompt structure (JSON parsing needed)

## Why You Might Want It

- ⚡ **Better UX** - Instant content display instead of waiting
- 📴 **Offline support** - Partial functionality without network
- 💰 **Token savings** - Only generate personalized part on repeat views
- 🔄 **Quiz retakes** - Cached explanations persist across sessions
- 🎓 **Learning value** - Progressive loading patterns, structured API responses

---

## Estimated Effort

| Phase | Sessions |
|-------|----------|
| Phase 1: API Layer | 1-2 |
| Phase 2: Data Layer | 1 |
| Phase 3: UI Layer | 1-2 |
| Phase 4: Network States | 1 |
| Phase 5: i18n | 0.5 |
| Testing & Polish | 1-2 |
| **Total** | **5-8 sessions** |

---

## Checklist

- [ ] Create plan document (this file)
- [ ] Capture "before" screenshots
- [ ] Write failing tests (unit + E2E)
- [ ] Phase 1: API layer changes
- [ ] Phase 2: Data layer changes
- [ ] Phase 3: UI layer changes
- [ ] Phase 4: Network state handling
- [ ] Phase 5: i18n translations
- [ ] Run archtest (must pass)
- [ ] Run all tests (must pass)
- [ ] Capture "after" screenshots
- [ ] Manual testing checklist complete
- [ ] Commit and push
- [ ] Create PR

---

## Related Documents

- [ExplanationModal Component](../../src/components/ExplanationModal.js)
- [Database Schema](../../architecture/DATABASE_SCHEMA.md)
- [Phase 40: Telemetry](../epic04_saberloop_v1/PHASE40_TELEMETRY.md)
- [i18n Phase](../epic04_saberloop_v1/PHASE30_I18N.md)

---

**Last Updated:** 2025-12-28
