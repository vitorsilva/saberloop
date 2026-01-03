# Phase 51: Explanation Performance Improvement - Learning Notes

**Started:** January 3, 2026
**Completed:** January 3, 2026
**Status:** Deployed to Staging
**Branch:** `feature/phase51-explanation-performance`

---

## Summary

Implemented explanation caching to improve performance when users view explanations for incorrect answers multiple times. The solution splits explanations into cacheable and personalized parts.

## What Was Built

### API Layer Changes

**Files Modified:**
- `src/api/api.real.js` - Updated `generateExplanation()` to return structured JSON
- `src/api/api.mock.js` - Updated mock to match new response format
- `src/api/index.js` - Export new `generateWrongAnswerExplanation` function

**Key Changes:**
1. `generateExplanation()` now returns:
   ```javascript
   {
     rightAnswerExplanation: "Why the correct answer is right...",
     wrongAnswerExplanation: "Why the user's answer was wrong..."
   }
   ```
2. Added `generateWrongAnswerExplanation()` for partial generation when cache exists
3. Added JSON parsing with fallback for malformed LLM responses

### Data Layer Changes

**Files Modified:**
- `src/core/db.js` - Added `updateQuestionExplanation()` function
- `src/services/quiz-service.js` - Export new functions

**Key Changes:**
1. `updateQuestionExplanation(sessionId, questionIndex, rightAnswerExplanation)` caches explanation in session
2. Quiz service exports both new API functions and DB function

### UI Layer Changes

**Files Modified:**
- `src/components/ExplanationModal.js` - Progressive loading UI
- `src/views/ResultsView.js` - Caching logic and state management

**Key Changes:**
1. Modal accepts `cachedExplanation`, `isOffline`, `hasApiKey` parameters
2. Shows cached content instantly, loads personalized in parallel
3. Handles states: loading, cached+loading, offline, no-API-key, error
4. ResultsView checks cache, passes to modal, saves after fetch
5. Stores `currentSessionId` in state for caching support

### i18n Changes

**Files Modified:**
- `public/locales/en.json`
- `public/locales/pt-PT.json`

**New Keys:**
- `explanation.title` - "Explanation"
- `explanation.loadingPersonalized` - "Loading personalized feedback..."
- `explanation.connectToAI` - "Connect to AI for personalized feedback..."
- `explanation.couldntLoad` - "Couldn't load personalized feedback"

---

## Testing Results

| Test Type | Result |
|-----------|--------|
| Type checking | 0 errors |
| Unit tests (Vitest) | 356 passed |
| Architecture tests | 0 errors, 1 warning |
| E2E tests (Playwright) | 68 passed, 3 skipped |
| Mutation tests (Stryker) | 92.61% score |
| Maestro tests | 8/8 passed |

---

## Commits (11 total)

```
68851cd test: update Maestro test screenshots
d96e610 docs: add command-line Maestro testing instructions
b912348 feat(i18n): add explanation caching translation keys (pt-PT)
22c52b5 feat(i18n): add explanation caching translation keys (en)
081aa07 feat(ui): implement explanation caching in ResultsView
cc9ef2b feat(ui): update ExplanationModal for progressive loading
05aa6ea feat(service): add explanation caching functions
20ec46e feat(db): add updateQuestionExplanation for caching
9c295d5 feat(api): export generateWrongAnswerExplanation
8cd6b2c feat(api): update mock API to return structured explanation
bfa96e2 feat(api): update generateExplanation to return structured JSON
```

---

## Key Concepts Learned

### 1. Progressive Loading Pattern

Split content into cacheable (generic) and personalized parts:
- **Cacheable:** Why the correct answer is right (same for all users)
- **Personalized:** Why the user's specific wrong answer was incorrect

Benefits:
- Instant display of cached content
- Reduced API calls on repeat views
- Works offline with cached data
- Lower token costs

### 2. Structured LLM Responses

Requesting JSON from LLM instead of plain text:
```
Return a JSON object with exactly these two fields:
{
  "rightAnswerExplanation": "...",
  "wrongAnswerExplanation": "..."
}
```

Gotchas:
- LLM may wrap response in markdown code blocks
- Need fallback parsing for malformed responses
- Always validate and provide defaults

### 3. State Management for Caching

Store session ID immediately after saving quiz:
```javascript
const sessionId = await saveQuizSession(session);
state.set('currentSessionId', sessionId);
```

This enables updating the session with cached explanation later.

### 4. Running Maestro Tests Locally

Full command-line workflow (no Android Studio UI needed):

```powershell
# 1. List available emulators
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator" -list-avds

# 2. Start emulator
Start-Process -FilePath "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator" -ArgumentList "-avd AVD_NAME -no-snapshot-load"

# 3. Wait for boot, verify connection
adb devices

# 4. Install APK
adb install "package/Saberloop - Google Play package/Saberloop.apk"

# 5. Run tests
maestro test .maestro/flows/ --test-output-dir .maestro/tests
```

---

## Architecture Decisions

### Why Cache in Session (not separate store)?

1. **Data locality:** Explanation belongs with question data
2. **Automatic cleanup:** Deleted when session deleted
3. **Simpler queries:** No joins needed
4. **Offline support:** Already cached with session

### Why Two Separate API Functions?

1. **Full fetch:** `generateExplanation()` - First time, returns both parts
2. **Partial fetch:** `generateWrongAnswerExplanation()` - Repeat views, only personalized

Benefits:
- Fewer tokens on repeat views (~60% reduction)
- Faster response time
- Clear separation of concerns

---

## Files Changed

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `src/api/api.real.js` | +115, -41 | Structured JSON response |
| `src/api/api.mock.js` | +33, -14 | Mock structured response |
| `src/api/index.js` | +1 | Export new function |
| `src/core/db.js` | +28 | Cache update function |
| `src/services/quiz-service.js` | +32, -5 | Service layer exports |
| `src/components/ExplanationModal.js` | +122, -24 | Progressive loading UI |
| `src/views/ResultsView.js` | +58, -7 | Caching logic |
| `public/locales/en.json` | +4 | English translations |
| `public/locales/pt-PT.json` | +4 | Portuguese translations |
| `docs/.../PHASE60_LEARNING_NOTES.md` | +28, -8 | Maestro CLI instructions |

---

## Deployment

- **Staging:** https://saberloop.com/app-staging/ (deployed)
- **Production:** Pending PR merge

---

## Next Steps

1. Test on staging
2. Create PR to main
3. After merge, deploy to production

---

**Phase Status:** Deployed to Staging
